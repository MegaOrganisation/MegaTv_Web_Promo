"use client";

import { clsx } from "clsx";
import { Baby, Camera, Check, KeyRound, Loader2, RotateCcw, Save, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useMemo, useState, useEffect, type ChangeEvent, type FormEvent } from "react";

import { MegaButton } from "@/components/ui/MegaButton";
import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";
import { AVATAR_REGISTRY, avatarAssetPath, avatarGradientCss } from "@/lib/profiles/avatars";
import { formatPinInput } from "@/lib/profiles/pin";
import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profiles: ProfileRow[];
};

type ProfileFormState = {
  name: string;
  avatarId: number;
  isKidsProfile: boolean;
  pin: string;
  currentPin: string;
  removePin: boolean;
};

export function ProfileManagementPanel({ profiles }: Props) {
  const router = useRouter();
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.profile_id || "");
  const selectedProfile = profiles.find((profile) => profile.profile_id === selectedProfileId) || profiles[0] || null;
  const [formByProfileId, setFormByProfileId] = useState<Record<string, ProfileFormState>>(() =>
    Object.fromEntries(profiles.map((profile) => [profile.profile_id, profileToForm(profile)]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      avatarId: form.avatarId,
      usePresetAvatar: true,
      isKidsProfile: form.isKidsProfile
    };

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
          const itemForm = active ? form : formByProfileId[profile.profile_id] || profileToForm(profile);
          const displayAvatarId = itemForm.avatarId;
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
              <PresetAvatarCircle
                key={`${profile.profile_id}-${displayAvatarId}`}
                avatarId={displayAvatarId}
                size="lg"
                label={profile.name || "Profil MegaTv"}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">{profile.name || "Profil MegaTv"}</span>
                <span className="mt-1 block truncate text-xs text-white/42">
                  {profile.is_kids_profile ? "Profil enfant" : "Profil adulte"}
                  {profile.is_locked ? " · PIN actif" : ""}
                </span>
              </span>
              {active ? <Check className="h-5 w-5 text-white" /> : null}
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="rounded-[26px] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <PresetAvatarCircle avatarId={form.avatarId} size="xl" label={selectedProfile.name || "Profil MegaTv"} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/38">Profil sélectionné</p>
            <h3 className="mt-1 truncate text-2xl font-black text-white">{selectedProfile.name || "Profil MegaTv"}</h3>
            <p className="mt-1 text-sm text-white/45">Avatars MegaTv, mode Kids et PIN synchronisés avec l&apos;application.</p>
            {(selectedProfile.avatar_image_version || 0) > 0 && (selectedProfile.avatar_id || 0) > 0 ? (
              <p className="mt-2 rounded-xl border border-yellow-300/20 bg-yellow-300/8 px-3 py-2 text-xs text-yellow-100">
                Ancienne photo personnalisée détectée — cliquez Enregistrer pour basculer sur l&apos;avatar MegaTv.
              </p>
            ) : null}
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

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/18 p-4">
          <label className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <Baby className="h-4 w-4" />
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

        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
            <Sparkles className="h-4 w-4" />
            Avatars MegaTv
          </div>
          {AVATAR_REGISTRY.categories.map((category) => (
            <div key={category.label} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{category.label}</p>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                {category.ids.map((avatarId) => {
                  const active = form.avatarId === avatarId;
                  return (
                    <button
                      key={avatarId}
                      type="button"
                      onClick={() => updateForm({ avatarId })}
                      className={clsx(
                        "focus-ring relative aspect-square max-h-12 max-w-12 overflow-hidden rounded-full border p-0.5 transition sm:max-h-14 sm:max-w-14",
                        active ? "border-white scale-105" : "border-white/10 hover:border-white/35"
                      )}
                      style={{ background: avatarGradientCss(avatarId) }}
                      aria-label={`Avatar ${avatarId}`}
                    >
                      <NextImage src={avatarAssetPath(avatarId)} alt="" width={48} height={48} className="h-full w-full rounded-full object-cover" />
                      {active ? (
                        <span className="absolute inset-0 grid place-items-center rounded-full bg-black/32">
                          <Check className="h-4 w-4 text-white" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/18 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
            <KeyRound className="h-4 w-4" />
            Code PIN
          </div>
          <p className="mt-1 text-xs leading-5 text-white/42">4 ou 5 chiffres, identique au format MegaTv Android.</p>
          {selectedProfile.is_locked ? (
            <label className="mt-3 block">
              <span className="text-xs text-white/45">PIN actuel</span>
              <input
                value={form.currentPin}
                onChange={(event) => updateForm({ currentPin: formatPinInput(event.target.value) })}
                inputMode="numeric"
                className="focus-ring mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-black/22 px-4 text-sm font-semibold text-white outline-none"
                placeholder="••••"
              />
            </label>
          ) : null}
          <label className="mt-3 block">
            <span className="text-xs text-white/45">{selectedProfile.is_locked ? "Nouveau PIN" : "Définir un PIN"}</span>
            <input
              value={form.pin}
              onChange={(event) => updateForm({ pin: formatPinInput(event.target.value), removePin: false })}
              inputMode="numeric"
              className="focus-ring mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-black/22 px-4 text-sm font-semibold text-white outline-none"
              placeholder="1234"
            />
          </label>
          {selectedProfile.is_locked ? (
            <label className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={form.removePin} onChange={(event) => updateForm({ removePin: event.target.checked, pin: "" })} />
              Supprimer le PIN
            </label>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/18 p-4">
          <p className="text-sm font-semibold text-white/70">Photo personnalisée</p>
          <p className="mt-1 text-xs leading-5 text-white/42">Import JPG, PNG ou WebP. Recadrage carré 512×512 avant stockage Supabase.</p>
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
    avatarId: profile.avatar_id && profile.avatar_id > 0 ? profile.avatar_id : AVATAR_REGISTRY.allIds[0] || 1,
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
