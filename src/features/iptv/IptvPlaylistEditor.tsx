"use client";

import { useMemo, useState } from "react";
import { GripVertical, Pencil, Plus, Save, Trash2, Tv, X } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaButton } from "@/components/ui/MegaButton";

import { detectPlaylistType, maskPlaylistUrl, newPlaylistId, type IptvPlaylistEntry } from "@/lib/iptv/types";

type Props = {
  profileId: string;
  initialPlaylists: IptvPlaylistEntry[];
};

type DraftEntry = IptvPlaylistEntry & { isNew?: boolean };

const inputClass =
  "focus-ring mt-1 w-full rounded-2xl border border-[var(--mega-cp-border)] bg-[var(--mega-card-bg)] px-3 py-2 text-sm text-[var(--mega-text)] outline-none placeholder:text-[var(--mega-text-faint)]";

export function IptvPlaylistEditor({ profileId, initialPlaylists }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftEntry[]>(initialPlaylists);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const displayList = editing ? draft : initialPlaylists;

  const profileLabel = useMemo(() => profileId.slice(0, 8), [profileId]);

  function resetDraft() {
    setDraft(initialPlaylists.map((entry) => ({ ...entry })));
    setEditing(false);
    setError(null);
    setMessage(null);
  }

  function updateEntry(index: number, patch: Partial<DraftEntry>) {
    setDraft((current) => current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addPlaylist() {
    const id = newPlaylistId(draft);
    setDraft((current) => [
      ...current,
      { id, name: `Liste ${current.length + 1}`, m3uUrl: "", epgUrl: "", enabled: true, isNew: true }
    ]);
    setEditing(true);
  }

  function removePlaylist(index: number) {
    setDraft((current) => current.filter((_, i) => i !== index));
    setEditing(true);
  }

  function movePlaylist(from: number, to: number) {
    if (to < 0 || to >= draft.length || from === to) return;
    setDraft((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setEditing(true);
  }

  async function savePlaylists() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const playlists = draft
      .map((entry) => ({
        id: entry.id,
        name: entry.name.trim(),
        m3uUrl: entry.m3uUrl.trim(),
        epgUrl: entry.epgUrl?.trim() || "",
        enabled: entry.enabled !== false,
        hiddenCategories: entry.hiddenCategories || []
      }))
      .filter((entry) => entry.name && entry.m3uUrl);

    if (playlists.length === 0) {
      setSaving(false);
      setError("Ajoutez au moins une playlist avec un nom et une URL M3U.");
      return;
    }

    const response = await fetch("/api/companion/iptv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, playlists })
    });

    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    setSaving(false);

    if (!response.ok) {
      setError(body?.error || "Échec de la synchronisation cloud.");
      return;
    }

    setMessage("Playlists synchronisées. Un seul push cloud a été envoyé.");
    setEditing(false);
    window.location.reload();
  }

  return (
    <GlassCard as="section" className="p-4 sm:p-5">
      <div className="mega-surface mega-surface-elevated mb-5 rounded-[26px] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="mega-metric-icon-wrap">
              <Tv className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="mega-section-title">Playlists IPTV</h2>
              <p className="mega-section-sub">
                Profil {profileLabel}… · écriture batch à l&apos;enregistrement uniquement
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!editing ? (
              <>
                <MegaButton type="button" variant="ghost" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  Modifier
                </MegaButton>
                <MegaButton type="button" onClick={addPlaylist}>
                  <Plus className="h-4 w-4" />
                  Ajouter
                </MegaButton>
              </>
            ) : (
              <>
                <MegaButton type="button" variant="ghost" onClick={resetDraft} disabled={saving}>
                  <X className="h-4 w-4" />
                  Annuler
                </MegaButton>
                <MegaButton type="button" onClick={() => void savePlaylists()} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </MegaButton>
              </>
            )}
          </div>
        </div>
      </div>

      {message ? <p className="mb-4 text-sm text-green-300/90">{message}</p> : null}
      {error ? <p className="mb-4 text-sm text-red-300/90">{error}</p> : null}

      {displayList.length === 0 ? (
        <div className="mega-surface rounded-[22px] border border-dashed border-[var(--mega-cp-border)] p-8 text-center text-sm text-[var(--mega-text-muted)]">
          Aucune playlist pour ce profil. Ajoutez une liste M3U ou Xtream pour démarrer.
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((entry, index) => (
            <div
              key={entry.id}
              draggable={editing}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) movePlaylist(dragIndex, index);
                setDragIndex(null);
              }}
              className="mega-surface mega-surface-elevated rounded-[20px] p-3.5 sm:p-4"
            >
              <div className="flex items-start gap-3">
                {editing ? (
                  <button
                    type="button"
                    className="mt-1 shrink-0 cursor-grab text-[var(--mega-text-faint)]"
                    aria-label="Réordonner"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                ) : null}
                <div className="min-w-0 flex-1 overflow-visible">
                  {editing ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs text-[var(--mega-text-faint)]">
                        Nom
                        <input
                          className={inputClass}
                          value={entry.name}
                          onChange={(event) => updateEntry(index, { name: event.target.value })}
                        />
                      </label>
                      <label className="block text-xs text-[var(--mega-text-faint)]">
                        Type
                        <div className="mt-1 rounded-2xl border border-[var(--mega-cp-border)] bg-[var(--mega-card-bg)] px-3 py-2 text-sm text-[var(--mega-text-muted)]">
                          {detectPlaylistType(entry.m3uUrl)}
                        </div>
                      </label>
                      <label className="block text-xs text-[var(--mega-text-faint)] sm:col-span-2">
                        URL M3U / Xtream
                        <input
                          className={inputClass}
                          value={entry.m3uUrl}
                          onChange={(event) => updateEntry(index, { m3uUrl: event.target.value })}
                          placeholder="https://…"
                        />
                      </label>
                      <label className="block text-xs text-[var(--mega-text-faint)] sm:col-span-2">
                        URL EPG (optionnel)
                        <input
                          className={inputClass}
                          value={entry.epgUrl || ""}
                          onChange={(event) => updateEntry(index, { epgUrl: event.target.value })}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[var(--mega-text-muted)]">
                        <input
                          type="checkbox"
                          checked={entry.enabled !== false}
                          onChange={(event) => updateEntry(index, { enabled: event.target.checked })}
                        />
                        Activée
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[var(--mega-text)]">{entry.name}</p>
                        <span className="rounded-full border border-[var(--mega-cp-border)] bg-[var(--mega-card-bg)] px-2 py-0.5 text-[11px] text-[var(--mega-text-faint)]">
                          {detectPlaylistType(entry.m3uUrl)}
                        </span>
                        {entry.enabled === false ? (
                          <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[11px] text-yellow-200">
                            Désactivée
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 break-all font-mono text-xs text-[var(--mega-text-faint)]">
                        {maskPlaylistUrl(entry.m3uUrl)}
                      </p>
                    </>
                  )}
                </div>
                {editing ? (
                  <MegaButton type="button" variant="danger" className="min-h-9 shrink-0 px-3" onClick={() => removePlaylist(index)}>
                    <Trash2 className="h-4 w-4" />
                  </MegaButton>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
