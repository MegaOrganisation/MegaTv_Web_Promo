"use client";

import { clsx } from "clsx";
import {
  Baby,
  Camera,
  Check,
  Film,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";

import { MegaButton } from "@/components/ui/MegaButton";
import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";
import { AVATAR_REGISTRY } from "@/lib/profiles/avatars";
import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profiles: ProfileRow[];
  avatarUrls?: Record<string, string>;
};

type ProfileFormState = {
  name: string;
  avatarId: number;
  usePresetAvatar: boolean;
  isKidsProfile: boolean;
  pin: string;
  currentPin: string;
  removePin: boolean;
};

type TmdbSearchResult = {
  mediaId: string;
  mediaType: string;
  tmdbId: number;
  title: string;
  subtitle: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
};

export function ProfileManagementPanel({ profiles, avatarUrls = {} }: Props) {
  const router = useRouter();
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.profile_id || "");
  const selectedProfile = profiles.find((profile) => profile.profile_id === selectedProfileId) || profiles[0] || null;

  const [formByProfileId, setFormByProfileId] = useState<Record<string, ProfileFormState>>(() =>
    Object.fromEntries(profiles.map((profile) => [profile.profile_id, profileToForm(profile)]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // TMDB Search Modal State
  const [tmdbModalOpen, setTmdbModalOpen] = useState(false);
  const [tmdbTarget, setTmdbTarget] = useState<"avatar" | "cover">("avatar");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<TmdbSearchResult[]>([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useMemo(() => {
    if (!selectedProfile) return null;
    return formByProfileId[selectedProfile.profile_id] || profileToForm(selectedProfile);
  }, [formByProfileId, selectedProfile]);

  useEffect(() => {
    setFormByProfileId((current) => {
      const next = { ...current };
      for (const profile of profiles) {
        const serverForm = profileToForm(profile);
        const existing = current[profile.profile_id];
        next[profile.profile_id] = existing
          ? { ...existing, name: serverForm.name, isKidsProfile: serverForm.isKidsProfile }
          : serverForm;
      }
      return next;
    });
  }, [profiles]);

  if (profiles.length === 0 || !selectedProfile || !form) {
    return <p className="text-sm text-white/45">Aucun profil cloud détecté pour le moment.</p>;
  }

  function getAvatarSrc(profile: ProfileRow) {
    if (avatarUrls[profile.profile_id]) {
      return avatarUrls[profile.profile_id];
    }
    const path = profile.avatar_image_storage_path?.trim();
    if (path) {
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      return `/api/profiles/${encodeURIComponent(profile.profile_id)}/avatar?v=${profile.avatar_image_version || 1}`;
    }
    if ((profile.avatar_image_version || 0) > 0) {
      return `/api/profiles/${encodeURIComponent(profile.profile_id)}/avatar?v=${profile.avatar_image_version || 1}`;
    }
    if (profile.avatar_id && profile.avatar_id > 0) {
      const num = Math.min(Math.max(profile.avatar_id, 1), 20);
      return `/assets/avatars/avatar_${num}.png`;
    }
    return null;
  }

  function updateForm(patch: Partial<ProfileFormState>) {
    if (!selectedProfile) return;
    setMessage(null);
    setError(null);
    setFormByProfileId((current) => ({
      ...current,
      [selectedProfile.profile_id]: {
        ...(current[selectedProfile.profile_id] || profileToForm(selectedProfile)),
        ...patch
      }
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProfile || !form) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const payload: Record<string, unknown> = {
      name: form.name,
      isKidsProfile: form.isKidsProfile
    };

    if (form.usePresetAvatar && form.avatarId > 0) {
      payload.avatarId = form.avatarId;
      payload.usePresetAvatar = true;
    }

    if (form.removePin) {
      payload.removePin = true;
      if (selectedProfile.is_locked) payload.currentPin = form.currentPin;
    } else if (form.pin) {
      payload.pin = form.pin;
      if (selectedProfile.is_locked) payload.currentPin = form.currentPin;
    }

    const response = await fetch(`/api/profiles/${encodeURIComponent(selectedProfile.profile_id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Modification du profil impossible.");
      return;
    }

    setMessage("Profil mis à jour avec succès.");
    router.refresh();
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    if (!selectedProfile) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    let preparedFile: File;
    try {
      preparedFile = await prepareAvatarUpload(file);
    } catch {
      setIsSaving(false);
      setError("Impossible de préparer cette image.");
      return;
    }
    formData.append("avatar", preparedFile);
    const response = await fetch(`/api/profiles/${encodeURIComponent(selectedProfile.profile_id)}/avatar`, {
      method: "POST",
      body: formData
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Import de la photo impossible.");
      return;
    }

    updateForm({ usePresetAvatar: false });
    setMessage("Photo de profil importée.");
    router.refresh();
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    if (!selectedProfile) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`/api/profiles/${encodeURIComponent(selectedProfile.profile_id)}/cover`, {
      method: "POST",
      body: formData
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Import de la couverture impossible.");
      return;
    }

    setMessage("Photo de couverture mise à jour.");
    router.refresh();
  }

  async function removeCustomAvatar() {
    if (!selectedProfile) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/profiles/${encodeURIComponent(selectedProfile.profile_id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeCustomAvatar: true, avatarId: 1, usePresetAvatar: true })
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Réinitialisation de la photo impossible.");
      return;
    }

    updateForm({ avatarId: 1, usePresetAvatar: true });
    setMessage("Photo personnalisée retirée.");
    router.refresh();
  }

  async function removeCover() {
    if (!selectedProfile) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/profiles/${encodeURIComponent(selectedProfile.profile_id)}/cover`, {
      method: "DELETE"
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Suppression de la couverture impossible.");
      return;
    }

    setMessage("Photo de couverture supprimée.");
    router.refresh();
  }

  function handleTmdbSearch(q: string) {
    setTmdbQuery(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (q.trim().length < 2) {
      setTmdbResults([]);
      setTmdbSearching(false);
      return;
    }
    setTmdbSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/web/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setTmdbResults(data.results || []);
      } catch (_) {
        setTmdbResults([]);
      } finally {
        setTmdbSearching(false);
      }
    }, 300);
  }

  async function applyTmdbImage(url: string) {
    if (!selectedProfile || !url) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    setTmdbModalOpen(false);

    if (tmdbTarget === "avatar") {
      const response = await fetch(`/api/profiles/${encodeURIComponent(selectedProfile.profile_id)}/avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbPosterUrl: url })
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setIsSaving(false);
      if (!response.ok) {
        setError(body.error || "Application du poster TMDB impossible.");
        return;
      }
      updateForm({ usePresetAvatar: false });
      setMessage("Poster TMDB appliqué comme avatar !");
      router.refresh();
    } else {
      // Cover mode
      const formData = new FormData();
      formData.append("tmdbUrl", url);
      const response = await fetch(`/api/profiles/${encodeURIComponent(selectedProfile.profile_id)}/cover`, {
        method: "POST",
        body: formData
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setIsSaving(false);
      if (!response.ok) {
        setError(body.error || "Application de la couverture TMDB impossible.");
        return;
      }
      setMessage("Fond TMDB appliqué comme couverture !");
      router.refresh();
    }
  }

  const selectedAvatarSrc = form.usePresetAvatar && form.avatarId > 0
    ? `/assets/avatars/avatar_${form.avatarId}.png`
    : getAvatarSrc(selectedProfile);

  const selectedCoverSrc = selectedProfile.cover_value?.trim() || null;

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      {/* Profile selector left list */}
      <div className="space-y-3">
        {profiles.map((profile) => {
          const active = profile.profile_id === selectedProfile.profile_id;
          const avatarSrc = getAvatarSrc(profile);
          return (
            <button
              key={profile.profile_id}
              type="button"
              onClick={() => {
                setSelectedProfileId(profile.profile_id);
                setMessage(null);
                setError(null);
              }}
              className={clsx("mega-profile-row focus-ring", active && "is-active")}
            >
              <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border border-white/15 bg-white/10 flex items-center justify-center">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt={profile.name || "Profil"} className="h-full w-full object-cover" />
                ) : (
                  <PresetAvatarCircle
                    avatarId={profile.avatar_id && profile.avatar_id > 0 ? profile.avatar_id : 1}
                    size="md"
                    label={profile.name || "Profil"}
                  />
                )}
              </div>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-bold text-[var(--mega-text)]">{profile.name || "Profil MegaTv"}</span>
                <span className="mt-1 block truncate text-xs text-[var(--mega-text-faint)]">
                  {profile.is_kids_profile ? "Profil enfant" : "Profil adulte"}
                  {profile.is_locked ? " · PIN actif" : ""}
                </span>
              </span>
              {active ? <Check className="h-5 w-5 text-[var(--brand-blue)] shrink-0" /> : null}
            </button>
          );
        })}
      </div>

      {/* Profile edit pane right */}
      <form onSubmit={submit} className="mega-surface mega-surface-elevated rounded-[26px] overflow-hidden">
        {/* Cover Photo Header */}
        <div className="relative w-full h-36 sm:h-44 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 overflow-hidden border-b border-white/10">
          {selectedCoverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedCoverSrc} alt="Couverture" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-semibold uppercase tracking-wider">
              Aucune couverture configurée
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#10131b] via-[#10131b]/40 to-transparent" />

          {/* Cover management action buttons top right */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={() => {
                setTmdbTarget("cover");
                setTmdbModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 transition-colors"
            >
              <Film size={12} className="text-indigo-400" />
              <span>Cover TMDB</span>
            </button>
            <label className="cursor-pointer px-2.5 py-1.5 rounded-full text-xs font-semibold bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 transition-colors">
              <Camera size={12} className="text-teal-400" />
              <span>Importer</span>
              <input type="file" accept="image/*" onChange={uploadCover} className="hidden" />
            </label>
            {selectedCoverSrc && (
              <button
                type="button"
                onClick={removeCover}
                title="Supprimer la couverture"
                className="p-1.5 rounded-full text-xs font-semibold bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* Avatar on top of cover */}
          <div className="absolute bottom-3 left-4 sm:left-6 flex items-end gap-3 z-10">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/80 shadow-2xl bg-black/50 shrink-0">
              {selectedAvatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedAvatarSrc} alt={selectedProfile.name || "Profil"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-xl">
                  {selectedProfile.name?.[0] || "P"}
                </div>
              )}
            </div>
            <div className="pb-1">
              <h3 className="truncate text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {selectedProfile.name || "Profil MegaTv"}
              </h3>
              <p className="text-xs text-white/70 drop-shadow">
                {selectedProfile.is_kids_profile ? "Profil Enfant" : "Profil Adulte"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Avatar action buttons */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-2">Photo de profil</span>
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTmdbTarget("avatar");
                  setTmdbModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Film size={13} className="text-indigo-400" />
                <span>Poster TMDB</span>
              </button>
              <label className="cursor-pointer px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-1.5 transition-colors">
                <Camera size={13} className="text-emerald-400" />
                <span>Importer une photo</span>
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
              </label>
              {((selectedProfile.avatar_image_version || 0) > 0 || selectedProfile.avatar_image_storage_path) && (
                <button
                  type="button"
                  onClick={removeCustomAvatar}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-white/70">Nom du profil</span>
            <input
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              maxLength={60}
              className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/22 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/28"
              placeholder="Nom du profil"
            />
          </label>

          <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
                <Baby className="h-4 w-4 text-amber-400" />
                Profil Kids
              </span>
              <input
                type="checkbox"
                checked={form.isKidsProfile}
                onChange={(event) => updateForm({ isKidsProfile: event.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-black/30"
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-white/42">Active le filtrage contenu enfant côté MegaTv, comme dans l&apos;app Android.</p>
          </div>

          {/* Preset MegaTv Avatars */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Avatars Officiels MegaTv
            </div>
            {AVATAR_REGISTRY.categories.map((category) => (
              <div key={category.label} className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{category.label}</p>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {category.ids.map((avatarId) => {
                    const selected = form.usePresetAvatar && form.avatarId === avatarId;
                    return (
                      <button
                        key={avatarId}
                        type="button"
                        onClick={() => updateForm({ avatarId, usePresetAvatar: true })}
                        className={clsx(
                          "relative rounded-full p-0.5 transition-transform hover:scale-110",
                          selected ? "ring-2 ring-white scale-105" : "opacity-80 hover:opacity-100"
                        )}
                      >
                        <PresetAvatarCircle avatarId={avatarId} size="md" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback messages */}
          {error && <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
          {message && <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{message}</p>}

          <div className="flex justify-end pt-2">
            <MegaButton type="submit" disabled={isSaving} className="min-w-32">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
            </MegaButton>
          </div>
        </div>
      </form>

      {/* TMDB Search Modal for Poster / Cover Picker */}
      {tmdbModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#141622] border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Film className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold">
                  {tmdbTarget === "avatar" ? "Choisir un poster TMDB (Avatar)" : "Choisir un fond TMDB (Couverture)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTmdbModalOpen(false)}
                className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-4 border-b border-white/8 bg-black/20">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-white/40" />
                <input
                  type="text"
                  autoFocus
                  value={tmdbQuery}
                  onChange={(e) => handleTmdbSearch(e.target.value)}
                  placeholder="Rechercher un film ou une série (ex: Supergirl, Dune, Arcane...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/8 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {tmdbSearching && <Loader2 size={16} className="absolute right-3.5 animate-spin text-white/40" />}
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {tmdbResults.length === 0 ? (
                <div className="text-center py-12 text-white/40 text-sm">
                  {tmdbQuery.trim().length < 2 ? "Tapez au moins 2 caractères pour rechercher sur TMDB." : "Aucun résultat trouvé."}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tmdbResults.map((item) => {
                    const pickedUrl = tmdbTarget === "avatar"
                      ? (item.posterUrl || item.backdropUrl)
                      : (item.backdropUrl || item.posterUrl);
                    if (!pickedUrl) return null;
                    return (
                      <button
                        key={`${item.mediaType}-${item.tmdbId}`}
                        type="button"
                        onClick={() => applyTmdbImage(pickedUrl)}
                        className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/40 text-left transition-all hover:scale-[1.03] hover:border-indigo-400 focus:outline-none"
                      >
                        <div className={clsx("w-full bg-[#0a0c14] overflow-hidden", tmdbTarget === "avatar" ? "aspect-[2/3]" : "aspect-[16/9]")}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pickedUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-white/40">{item.subtitle || item.mediaType.toUpperCase()}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function profileToForm(profile: ProfileRow): ProfileFormState {
  const hasCustom = (profile.avatar_image_version || 0) > 0 || Boolean(profile.avatar_image_storage_path);
  return {
    name: profile.name || "Profil",
    avatarId: profile.avatar_id && profile.avatar_id > 0 ? profile.avatar_id : 1,
    usePresetAvatar: !hasCustom && Boolean(profile.avatar_id && profile.avatar_id > 0),
    isKidsProfile: Boolean(profile.is_kids_profile),
    pin: "",
    currentPin: "",
    removePin: false
  };
}

async function prepareAvatarUpload(file: File) {
  if (typeof window === "undefined") return file;

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(imageUrl);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    if (side <= 0) return file;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 512, 512);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob) return file;
    return new File([blob], "avatar.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de lire l'image"));
    image.src = src;
  });
}
