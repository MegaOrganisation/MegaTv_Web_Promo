"use client";

import { clsx } from "clsx";
import { Camera, Check, Loader2, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { MegaButton } from "@/components/ui/MegaButton";
import { ProfileAvatar } from "@/features/dashboard/ProfileAvatar";
import { avatarAssetPath, avatarGradientCss, PROFILE_COLORS, profileColorToCss, TOTAL_AVATARS } from "@/lib/profiles/avatars";
import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profiles: ProfileRow[];
  profileAvatarUrlsById?: Record<string, string>;
};

type ProfileFormState = {
  name: string;
  avatarColor: number;
  avatarId: number;
  usePresetAvatar: boolean;
};

const colorLabels = ["Blanc", "Rouge", "Orange", "Jaune", "Vert", "Bleu", "Indigo", "Rose"];

export function ProfileManagementPanel({ profiles, profileAvatarUrlsById = {} }: Props) {
  const router = useRouter();
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.profile_id || "");
  const selectedProfile = profiles.find((profile) => profile.profile_id === selectedProfileId) || profiles[0] || null;
  const [formByProfileId, setFormByProfileId] = useState<Record<string, ProfileFormState>>(() => Object.fromEntries(profiles.map((profile) => [profile.profile_id, profileToForm(profile)])));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useMemo(() => {
    if (!selectedProfile) return null;
    return formByProfileId[selectedProfile.profile_id] || profileToForm(selectedProfile);
  }, [formByProfileId, selectedProfile]);

  if (profiles.length === 0 || !selectedProfile || !form) {
    return <p className="text-sm text-white/45">Aucun profil cloud détecté pour le moment.</p>;
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

    const payload = {
      name: form.name,
      avatarColor: form.avatarColor,
      ...(form.usePresetAvatar ? { avatarId: form.avatarId, usePresetAvatar: true } : {})
    };

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

    setMessage("Profil mis à jour.");
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

    setMessage("Photo de profil importée.");
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
      body: JSON.stringify({ removeCustomAvatar: true })
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Réinitialisation de la photo impossible.");
      return;
    }

    setMessage("Photo personnalisée retirée.");
    router.refresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-3">
        {profiles.map((profile) => {
          const active = profile.profile_id === selectedProfile.profile_id;
          return (
            <button
              key={profile.profile_id}
              type="button"
              onClick={() => {
                setSelectedProfileId(profile.profile_id);
                setMessage(null);
                setError(null);
              }}
              className={clsx(
                "focus-ring flex w-full items-center gap-3 rounded-[22px] border p-3 text-left transition",
                active ? "border-white/24 bg-white/12" : "border-white/8 bg-white/[0.035] hover:bg-white/[0.06]"
              )}
            >
              <ProfileAvatar profile={profile} avatarUrl={profileAvatarUrlsById[profile.profile_id]} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">{profile.name || "Profil MegaTv"}</span>
                <span className="mt-1 block truncate text-xs text-white/42">{profile.is_kids_profile ? "Profil enfant" : "Profil adulte"}{profile.is_locked ? " · verrouillé" : ""}</span>
              </span>
              {active ? <Check className="h-5 w-5 text-white" /> : null}
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="rounded-[26px] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProfileAvatar profile={selectedProfile} avatarUrl={profileAvatarUrlsById[selectedProfile.profile_id]} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/38">Profil sélectionné</p>
            <h3 className="mt-1 truncate text-2xl font-black text-white">{selectedProfile.name || "Profil MegaTv"}</h3>
            <p className="mt-1 text-sm text-white/45">Nom, couleur, avatar preset ou photo personnalisée synchronisés avec MegaTv.</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-white/70">Nom du profil</span>
          <input
            value={form.name}
            onChange={(event) => updateForm({ name: event.target.value })}
            maxLength={60}
            className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/22 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/28"
            placeholder="Nom du profil"
          />
        </label>

        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
            <Palette className="h-4 w-4" />
            Couleur
          </div>
          <div className="flex flex-wrap gap-2">
            {PROFILE_COLORS.map((color, index) => {
              const active = form.avatarColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={colorLabels[index] || `Couleur ${index + 1}`}
                  onClick={() => updateForm({ avatarColor: color })}
                  className={clsx("focus-ring grid h-10 w-10 place-items-center rounded-full border transition", active ? "border-white scale-105" : "border-white/12 hover:border-white/35")}
                  style={{ background: profileColorToCss(color) }}
                >
                  {active ? <Check className={clsx("h-4 w-4", color === 0xffffffff ? "text-black" : "text-white")} /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
            <Sparkles className="h-4 w-4" />
            Avatar par défaut
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: TOTAL_AVATARS }, (_, index) => index + 1).map((avatarId) => {
              const active = form.avatarId === avatarId;
              return (
                <button
                  key={avatarId}
                  type="button"
                  onClick={() => updateForm({ avatarId, usePresetAvatar: true })}
                  className={clsx("focus-ring relative aspect-square overflow-hidden rounded-full border p-0.5 transition", active ? "border-white scale-105" : "border-white/10 hover:border-white/35")}
                  style={{ background: avatarGradientCss(avatarId) }}
                  aria-label={`Avatar ${avatarId}`}
                >
                  <NextImage src={avatarAssetPath(avatarId)} alt="" width={64} height={64} className="h-full w-full rounded-full object-cover" />
                  {active ? <span className="absolute inset-0 grid place-items-center rounded-full bg-black/32"><Check className="h-4 w-4 text-white" /></span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/18 p-4">
          <p className="text-sm font-semibold text-white/70">Photo personnalisée</p>
          <p className="mt-1 text-xs leading-5 text-white/42">Import JPG, PNG ou WebP. L'image est recadrée en carré 512×512 avant stockage dans le bucket privé Supabase.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/24 hover:bg-white/[0.09]">
              <Camera className="h-4 w-4" />
              Importer
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} className="sr-only" disabled={isSaving} />
            </label>
            {(selectedProfile.avatar_image_version || 0) > 0 ? (
              <MegaButton type="button" variant="ghost" onClick={removeCustomAvatar} disabled={isSaving}>
                <RotateCcw className="h-4 w-4" />
                Retirer la photo
              </MegaButton>
            ) : null}
          </div>
        </div>

        {message ? <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/8 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/8 px-4 py-3 text-sm text-red-100">{error}</p> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <MegaButton type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </MegaButton>
        </div>
      </form>
    </div>
  );
}

function profileToForm(profile: ProfileRow): ProfileFormState {
  return {
    name: profile.name || "Profil",
    avatarColor: normalizeColor(profile.avatar_color),
    avatarId: profile.avatar_id && profile.avatar_id > 0 ? profile.avatar_id : 1,
    usePresetAvatar: false
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

function normalizeColor(value: number | null | undefined): number {
  return typeof value === "number" && PROFILE_COLORS.some((color) => color === value) ? value : PROFILE_COLORS[0];
}
