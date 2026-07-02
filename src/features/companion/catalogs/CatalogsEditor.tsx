"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, Plus, Save, Trash2 } from "lucide-react";

import { CatalogDiscoveryModal } from "@/features/companion/catalogs/CatalogDiscoveryModal";
import type { CatalogDiscoveryResult } from "@/app/api/catalogs/discover/route";
import { GlassCard } from "@/components/ui/GlassCard";
import { MegaButton } from "@/components/ui/MegaButton";
import type { CompanionCatalog } from "@/lib/companion/sync-types";
import { catalogsForSettingsPanel, isHiddenFromSettingsPanel, isPreinstalledSourceLocked } from "@/lib/catalogs/visibility";

type Props = {
  profileId: string;
  initialCatalogs: CompanionCatalog[];
  initialHiddenPreinstalled: string[];
  initialDeletedIds: string[];
};

function visibleCatalogsFromAll(catalogs: CompanionCatalog[]) {
  return catalogsForSettingsPanel(catalogs);
}

function mergeVisibleCatalogsBack(fullCatalogs: CompanionCatalog[], visibleCatalogs: CompanionCatalog[]) {
  const hidden = fullCatalogs.filter((catalog) => isHiddenFromSettingsPanel(catalog));
  const visibleIds = new Set(visibleCatalogs.map((catalog) => catalog.id));
  const untouchedHidden = hidden.filter((catalog) => !visibleIds.has(catalog.id));
  return [...visibleCatalogs, ...untouchedHidden];
}

export function CatalogsEditor({ profileId, initialCatalogs, initialHiddenPreinstalled, initialDeletedIds }: Props) {
  const [allCatalogs, setAllCatalogs] = useState(initialCatalogs);
  const [catalogs, setCatalogs] = useState(() => visibleCatalogsFromAll(initialCatalogs));
  const [hiddenPreinstalled, setHiddenPreinstalled] = useState(initialHiddenPreinstalled);
  const [deletedIds, setDeletedIds] = useState(initialDeletedIds);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; posterUrl: string | null; hint?: string } | null>(null);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);

  useEffect(() => {
    setAllCatalogs(initialCatalogs);
    setCatalogs(visibleCatalogsFromAll(initialCatalogs));
    setHiddenPreinstalled(initialHiddenPreinstalled);
    setDeletedIds(initialDeletedIds);
    setDirty(false);
  }, [initialCatalogs, initialHiddenPreinstalled, initialDeletedIds, profileId]);

  const move = useCallback((index: number, delta: number) => {
    setCatalogs((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  }, []);

  const updateCatalog = useCallback((index: number, patch: Partial<CompanionCatalog>) => {
    setCatalogs((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setDirty(true);
  }, []);

  const removeCatalog = useCallback((index: number) => {
    setCatalogs((prev) => {
      const removed = prev[index];
      if (removed?.id) setDeletedIds((ids) => (ids.includes(removed.id) ? ids : [...ids, removed.id]));
      return prev.filter((_, i) => i !== index);
    });
    setDirty(true);
  }, []);

  const toggleHiddenPreinstalled = useCallback((id: string) => {
    setHiddenPreinstalled((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setDirty(true);
  }, []);

  const loadPreview = async (catalog: CompanionCatalog) => {
    setPreviewId(catalog.id);
    setPreview(null);
    const tmdbMatch =
      catalog.sourceRef?.match(/tmdb:(movie|tv):(\d+)/i) ||
      catalog.sourceUrl?.match(/tmdb:(movie|tv):(\d+)/i) ||
      catalog.id.match(/tmdb[_-]?(movie|tv)[_-]?(\d+)/i);
    if (tmdbMatch) {
      const mediaType = tmdbMatch[1].toLowerCase() === "tv" ? "tv" : "movie";
      const tmdbId = Number(tmdbMatch[2]);
      const res = await fetch(`/api/tmdb/enrich?media_type=${mediaType}&tmdb_id=${tmdbId}`);
      if (res.ok) {
        const json = await res.json();
        setPreview({ title: json.title || catalog.title, posterUrl: json.posterUrl });
        return;
      }
    }

    if (catalog.sourceType === "TRAKT" || catalog.sourceType === "MDBLIST") {
      setPreview({
        title: catalog.title,
        posterUrl: null,
        hint: `Liste ${catalog.sourceType} — aperçu posters disponible à l'ajout via recherche. URL : ${catalog.sourceUrl || catalog.sourceRef || "—"}`
      });
      return;
    }

    setPreview({
      title: catalog.title,
      posterUrl: null,
      hint: catalog.isPreinstalled
        ? "Catalogue préinstallé MegaTv — le rail reprend le flux TMDB/addons configuré dans l'app."
        : "Pas de référence TMDB directe sur ce catalogue."
    });
  };

  const addDiscoveredCatalog = (result: CatalogDiscoveryResult) => {
    const catalog: CompanionCatalog = {
      id: result.id.replace(/[^a-zA-Z0-9:_-]/g, "_"),
      title: result.title,
      sourceType: result.sourceType,
      sourceUrl: result.sourceUrl,
      sourceRef: result.sourceUrl,
      kind: "STANDARD"
    };
    setCatalogs((prev) => [...prev, catalog]);
    setDirty(true);
    setStatus(`« ${result.title} » ajouté — pensez à sauvegarder.`);
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const mergedCatalogs = mergeVisibleCatalogsBack(allCatalogs, catalogs);
      const res = await fetch("/api/companion/sync/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, catalogs: mergedCatalogs, hiddenPreinstalled, deletedCatalogIds: deletedIds })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de sauvegarde");
      setDirty(false);
      setStatus("Catalogues sauvegardés (batch cloud). Les suppressions sont tombstonées.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const preinstalled = catalogs.filter((c) => c.isPreinstalled || c.sourceType === "PREINSTALLED");

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Catalogues</h2>
            <p className="mt-1 text-sm text-white/45">Ordre local-first — sous-catalogues franchise/service/genre masqués comme dans l&apos;app.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MegaButton variant="ghost" onClick={() => setDiscoveryOpen(true)}>
              <Plus className="h-4 w-4" />
              Ajouter
            </MegaButton>
            <MegaButton disabled={!dirty || saving} onClick={save}>
              <Save className="h-4 w-4" />
              Sauvegarder
            </MegaButton>
          </div>
        </div>
        {status ? <p className="mt-4 text-sm text-white/60">{status}</p> : null}
        {deletedIds.length > 0 ? (
          <p className="mt-3 text-xs text-white/40">Tombstones actifs : {deletedIds.join(", ")}</p>
        ) : null}
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {catalogs.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-white/45">Aucun catalogue pour ce profil.</p>
            </GlassCard>
          ) : (
            catalogs.map((catalog, index) => {
              const locked = isPreinstalledSourceLocked(catalog);
              return (
              <GlassCard key={`${catalog.id}-${index}`} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <label className="text-xs text-white/45">
                      Titre
                      <input
                        className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                        value={catalog.title}
                        onChange={(e) => updateCatalog(index, { title: e.target.value })}
                      />
                    </label>
                    <label className="text-xs text-white/45">
                      Source
                      <select
                        className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white disabled:opacity-50"
                        value={catalog.sourceType}
                        disabled={locked}
                        onChange={(e) => updateCatalog(index, { sourceType: e.target.value as CompanionCatalog["sourceType"] })}
                      >
                        {["PREINSTALLED", "TRAKT", "MDBLIST", "ADDON", "HOME_SERVER"].map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-white/45 sm:col-span-2">
                      ID
                      <input
                        className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white disabled:opacity-50"
                        value={catalog.id}
                        disabled={locked}
                        onChange={(e) => updateCatalog(index, { id: e.target.value })}
                      />
                    </label>
                    {!locked ? (
                      <label className="text-xs text-white/45 sm:col-span-2">
                        URL / référence source
                        <input
                          className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                          value={catalog.sourceUrl || catalog.sourceRef || ""}
                          onChange={(e) => updateCatalog(index, { sourceUrl: e.target.value, sourceRef: e.target.value })}
                          placeholder="https://… ou tmdb:movie:123"
                        />
                      </label>
                    ) : (
                      <p className="text-xs text-white/40 sm:col-span-2">Catalogue préinstallé — source verrouillée comme dans l&apos;app MegaTv.</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" className="focus-ring rounded-lg p-2 text-white/50 hover:bg-white/10" onClick={() => move(index, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" className="focus-ring rounded-lg p-2 text-white/50 hover:bg-white/10" onClick={() => move(index, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" className="focus-ring rounded-lg p-2 text-white/50 hover:bg-white/10" onClick={() => loadPreview(catalog)}>
                      <Eye className="h-4 w-4" />
                    </button>
                    {!locked ? (
                      <button type="button" className="focus-ring rounded-lg p-2 text-red-200/70 hover:bg-red-500/10" onClick={() => removeCatalog(index)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </GlassCard>
            );
            })
          )}
        </div>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white">Aperçu rail</h3>
          <p className="mt-1 text-sm text-white/45">TMDB si sourceRef/id TMDB ; listes Trakt/MDBList via recherche à l&apos;ajout.</p>
          {previewId ? (
            <div className="mt-4">
              {preview?.posterUrl ? (
                <Image src={preview.posterUrl} alt={preview.title} width={180} height={270} className="rounded-2xl border border-white/10" unoptimized />
              ) : (
                <div className="grid h-48 place-items-center rounded-2xl border border-dashed border-white/15 text-sm text-white/40">Pas d&apos;aperçu TMDB</div>
              )}
              <p className="mt-3 font-semibold text-white">{preview?.title || "Chargement…"}</p>
              {preview?.hint ? <p className="mt-2 text-xs leading-5 text-white/45">{preview.hint}</p> : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/40">Cliquez sur l&apos;œil d&apos;un catalogue.</p>
          )}

          {preinstalled.length > 0 ? (
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/35">Préinstallés masqués</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {preinstalled.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleHiddenPreinstalled(c.id)}
                    className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      hiddenPreinstalled.includes(c.id)
                        ? "border-red-300/30 bg-red-500/12 text-red-100"
                        : "border-white/10 bg-white/[0.04] text-white/60"
                    }`}
                  >
                    {hiddenPreinstalled.includes(c.id) ? "Masqué" : "Visible"} · {c.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </GlassCard>
      </div>

      <CatalogDiscoveryModal
        open={discoveryOpen}
        existingUrls={catalogs.map((catalog) => catalog.sourceUrl || catalog.sourceRef || "").filter(Boolean)}
        onClose={() => setDiscoveryOpen(false)}
        onConfirmAdd={addDiscoveredCatalog}
      />
    </div>
  );
}
