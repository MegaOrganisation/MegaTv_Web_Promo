"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, RefreshCw, Save, Trash2 } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaButton } from "@/components/ui/MegaButton";
import type { CompanionAddon } from "@/lib/companion/sync-types";

type Props = {
  profileId: string;
  initialAddons: CompanionAddon[];
  initialHiddenBuiltIn: string[];
};

function emptyAddon(): CompanionAddon {
  return {
    id: `addon_${Date.now()}`,
    name: "Nouvel addon",
    version: "1.0.0",
    description: "",
    isInstalled: true,
    isEnabled: true,
    type: "COMMUNITY",
    url: ""
  };
}

export function AddonsEditor({ profileId, initialAddons, initialHiddenBuiltIn }: Props) {
  const [addons, setAddons] = useState(initialAddons);
  const [hiddenBuiltIn, setHiddenBuiltIn] = useState(initialHiddenBuiltIn);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [forcing, setForcing] = useState(false);

  useEffect(() => {
    setAddons(initialAddons);
    setHiddenBuiltIn(initialHiddenBuiltIn);
    setDirty(false);
  }, [initialAddons, initialHiddenBuiltIn, profileId]);

  const move = useCallback((index: number, delta: number) => {
    setAddons((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  }, []);

  const updateAddon = useCallback((index: number, patch: Partial<CompanionAddon>) => {
    setAddons((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setDirty(true);
  }, []);

  const removeAddon = useCallback((index: number) => {
    setAddons((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  }, []);

  const toggleHiddenBuiltIn = useCallback((id: string) => {
    setHiddenBuiltIn((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setDirty(true);
  }, []);

  const save = async (forceSync = false) => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/companion/sync/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, addons, hiddenBuiltIn, forceSync })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de sauvegarde");
      setDirty(false);
      setStatus(forceSync ? "Sauvegardé et sync forcée sur vos appareils." : "Sauvegardé dans le cloud.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const forceSyncOnly = async () => {
    setForcing(true);
    setStatus(null);
    try {
      const res = await fetch("/api/companion/sync/force", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopes: ["addons", "catalogs", "iptv"] })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec force sync");
      setStatus("Sync forcée programmée — vos appareils Android la liront au prochain cold start.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setForcing(false);
    }
  };

  const builtInCandidates = useMemo(
    () => addons.filter((a) => a.type === "OFFICIAL").map((a) => a.id),
    [addons]
  );

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Addons Stremio</h2>
            <p className="mt-1 text-sm text-white/45">Édition locale — push cloud uniquement à la sauvegarde.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MegaButton variant="ghost" onClick={() => setAddons((p) => [...p, emptyAddon()])}>
              <Plus className="h-4 w-4" />
              Ajouter
            </MegaButton>
            <MegaButton variant="ghost" disabled={!dirty || saving} onClick={() => save(false)}>
              <Save className="h-4 w-4" />
              Sauvegarder
            </MegaButton>
            <MegaButton disabled={saving} onClick={() => save(true)}>
              <Save className="h-4 w-4" />
              Sauver + sync
            </MegaButton>
            <MegaButton variant="ghost" disabled={forcing} onClick={forceSyncOnly}>
              <RefreshCw className="h-4 w-4" />
              Forcer sync
            </MegaButton>
          </div>
        </div>
        {status ? <p className="mt-4 text-sm text-white/60">{status}</p> : null}
      </GlassCard>

      {builtInCandidates.length > 0 ? (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white">Addons intégrés masqués</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {builtInCandidates.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleHiddenBuiltIn(id)}
                className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  hiddenBuiltIn.includes(id)
                    ? "border-red-300/30 bg-red-500/12 text-red-100"
                    : "border-white/10 bg-white/[0.04] text-white/60"
                }`}
              >
                {hiddenBuiltIn.includes(id) ? "Masqué" : "Visible"} · {id}
              </button>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <div className="space-y-3">
        {addons.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-white/45">Aucun addon pour ce profil. Ajoutez-en un ou synchronisez depuis l&apos;app TV.</p>
          </GlassCard>
        ) : (
          addons.map((addon, index) => (
            <GlassCard key={`${addon.id}-${index}`} className="p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="mt-2 h-4 w-4 shrink-0 text-white/25" />
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <label className="text-xs text-white/45">
                    Nom
                    <input
                      className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                      value={addon.name}
                      onChange={(e) => updateAddon(index, { name: e.target.value })}
                    />
                  </label>
                  <label className="text-xs text-white/45">
                    URL manifest
                    <input
                      className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                      value={addon.url || ""}
                      onChange={(e) => updateAddon(index, { url: e.target.value })}
                    />
                  </label>
                  <label className="text-xs text-white/45">
                    ID
                    <input
                      className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                      value={addon.id}
                      onChange={(e) => updateAddon(index, { id: e.target.value })}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={addon.isEnabled}
                      onChange={(e) => updateAddon(index, { isEnabled: e.target.checked })}
                    />
                    Activé
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <button type="button" className="focus-ring rounded-lg p-2 text-white/50 hover:bg-white/10" onClick={() => move(index, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" className="focus-ring rounded-lg p-2 text-white/50 hover:bg-white/10" onClick={() => move(index, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" className="focus-ring rounded-lg p-2 text-red-200/70 hover:bg-red-500/10" onClick={() => removeAddon(index)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
