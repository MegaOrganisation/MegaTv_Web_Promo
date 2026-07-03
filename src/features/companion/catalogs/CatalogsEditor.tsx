"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

function catalogSignature(catalogs: CompanionCatalog[]) {
  return catalogs.map((catalog) => `${catalog.id}:${catalog.title}:${catalog.sourceUrl || catalog.sourceRef || ""}`).join("|");
}

export function CatalogsEditor({ profileId, initialCatalogs, initialHiddenPreinstalled, initialDeletedIds }: Props) {
  const router = useRouter();
  const [allCatalogs, setAllCatalogs] = useState(initialCatalogs);
  const [catalogs, setCatalogs] = useState(() => visibleCatalogsFromAll(initialCatalogs));
  const [hiddenPreinstalled, setHiddenPreinstalled] = useState(initialHiddenPreinstalled);
  const [deletedIds, setDeletedIds] = useState(initialDeletedIds);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; posterUrl: string | null; posterUrls?: string[]; hint?: string } | null>(null);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const lastSyncedProfileRef = useRef(profileId);
  const lastSyncedSignatureRef = useRef(catalogSignature(initialCatalogs));

  useEffect(() => {
    const signature = catalogSignature(initialCatalogs);
    const profileChanged = lastSyncedProfileRef.current !== profileId;
    const serverChanged = lastSyncedSignatureRef.current !== signature;

    if (!profileChanged && !serverChanged) return;
    if (!profileChanged && serverChanged && dirty) return;

    setAllCatalogs(initialCatalogs);
    setCatalogs(visibleCatalogsFromAll(initialCatalogs));
    setHiddenPreinstalled(initialHiddenPreinstalled);
    setDeletedIds(initialDeletedIds);
    setDirty(false);
    lastSyncedProfileRef.current = profileId;
    lastSyncedSignatureRef.current = signature;
  }, [dirty, initialCatalogs, initialDeletedIds, initialHiddenPreinstalled, profileId]);

  const syncVisible = useCallback((updater: (prev: CompanionCatalog[]) => CompanionCatalog[]) => {
    setCatalogs((prev) => {
      const next = updater(prev);
      setAllCatalogs((full) => mergeVisibleCatalogsBack(full, next));
      return next;
    });
    setDirty(true);
  }, []);

  const move = useCallback(
    (index: number, delta: number) => {
      syncVisible((prev) => {
        const next = [...prev];
        const target = index + delta;
        if (target < 0 || target >= next.length) return prev;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    },
    [syncVisible]
  );

  const updateCatalog = useCallback(
    (index: number, patch: Partial<CompanionCatalog>) => {
      syncVisible((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    },
    [syncVisible]
  );

  const removeCatalog = useCallback(
    (index: number) => {
      syncVisible((prev) => {
        const removed = prev[index];
        if (removed?.id) setDeletedIds((ids) => (ids.includes(removed.id) ? ids : [...ids, removed.id]));
        return prev.filter((_, i) => i !== index);
      });
    },
    [syncVisible]
  );

  const toggleHiddenPreinstalled = useCallback((id: string) => {
    setHiddenPreinstalled((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setDirty(true);
  }, []);

  const loadPreview = async (catalog: CompanionCatalog) => {
    setPreviewId(catalog.id);
    setPreview(null);

    const sourceUrl = catalog.sourceUrl || catalog.sourceRef || "";
    const response = await fetch(
      `/api/catalogs/preview?url=${encodeURIComponent(sourceUrl)}&title=${encodeURIComponent(catalog.title)}`
    );
    const json = (await response.json()) as {
      title?: string;
      posterUrl?: string | null;
      posterUrls?: string[];
      hint?: string | null;
    };

    setPreview({
      title: json.title || catalog.title,
      posterUrl: json.posterUrl || json.posterUrls?.[0] || null,
      posterUrls: json.posterUrls || (json.posterUrl ? [json.posterUrl] : []),
      hint: json.hint || undefined
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
    syncVisible((prev) => [...prev, catalog]);
    setDeletedIds((ids) => ids.filter((id) => id !== catalog.id));
    setStatus(`« ${result.title} » ajouté — pensez à sauvegarder.`);
  };

  const addManualCatalog = () => {
    const catalog: CompanionCatalog = {
      id: `custom_${Date.now()}`,
      title: "Nouveau catalogue",
      sourceType: "MDBLIST",
      sourceUrl: "",
      sourceRef: "",
      kind: "STANDARD"
    };
    syncVisible((prev) => [...prev, catalog]);
    setStatus("Catalogue manuel ajouté — renseignez le titre et l'URL puis sauvegardez.");
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const mergedCatalogs = mergeVisibleCatalogsBack(allCatalogs, catalogs);
      const res = await fetch("/api/companion/sync/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          catalogs: mergedCatalogs,
          hiddenPreinstalled,
          deletedCatalogIds: deletedIds,
          forceSync: true
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de sauvegarde");
      setAllCatalogs(mergedCatalogs);
      setDirty(false);
      lastSyncedSignatureRef.current = catalogSignature(mergedCatalogs);
      setStatus("Catalogues sauvegardés — synchronisation envoyée à vos appareils.");
      router.refresh();
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
              Rechercher
            </MegaButton>
            <MegaButton variant="ghost" onClick={addManualCatalog}>
              <Plus className="h-4 w-4" />
              Manuel
            </MegaButton>
            <MegaButton disabled={!dirty || saving} onClick={save}>
              <Save className="h-4 w-4" />
              Sauvegarder
            </MegaButton>
          </div>
        </div>
        {status ? <p className="mt-4 text-sm text-white/60">{status}</p> : null}
        {dirty ? <p className="mt-2 text-xs text-amber-100/80">Modifications non sauvegardées — cliquez Sauvegarder pour pousser vers Supabase.</p> : null}
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
          <p className="mt-1 text-sm text-white/45">TMDB, Trakt ou MDBList — cliquez sur l&apos;œil d&apos;un catalogue.</p>
          {previewId ? (
            <div className="mt-4">
              {preview?.posterUrls && preview.posterUrls.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {preview.posterUrls.map((poster, index) => (
                    <Image key={`${previewId}-${index}`} src={poster} alt="" width={72} height={108} unoptimized className="h-28 w-18 shrink-0 rounded-xl border border-white/10 object-cover" />
                  ))}
                </div>
              ) : preview?.posterUrl ? (
                <Image src={preview.posterUrl} alt={preview.title} width={180} height={270} className="rounded-2xl border border-white/10" unoptimized />
              ) : (
                <div className="grid h-48 place-items-center rounded-2xl border border-dashed border-white/15 text-sm text-white/40">Aperçu indisponible</div>
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
