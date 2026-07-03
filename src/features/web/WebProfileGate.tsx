"use client";

import { clsx } from "clsx";
import { Lock, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MegaButton } from "@/components/ui/MegaButton";
import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";
import { readStoredProfileId, withProfileQuery, writeStoredProfileId } from "@/lib/companion/profile-scope";
import { formatPinInput } from "@/lib/profiles/pin";
import type { ProfileRow } from "@/lib/supabase/types";

export function WebProfileGate({ profiles }: { profiles: ProfileRow[] }) {
  const router = useRouter();
  const [pinProfile, setPinProfile] = useState<ProfileRow | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const enter = (profileId: string) => {
    writeStoredProfileId(profileId);
    router.replace(withProfileQuery("/web/home", profileId));
  };

  // Auto-resume: a previously chosen, unlocked profile skips the gate.
  useEffect(() => {
    const stored = readStoredProfileId();
    if (!stored) return;
    const match = profiles.find((profile) => profile.profile_id === stored);
    if (match && !match.is_locked) enter(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (profile: ProfileRow) => {
    setError(null);
    if (profile.is_locked) {
      setPin("");
      setPinProfile(profile);
      return;
    }
    enter(profile.profile_id);
  };

  const submitPin = async () => {
    if (!pinProfile) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/web/profile-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: pinProfile.profile_id, pin })
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error || "PIN incorrect");
        setBusy(false);
        return;
      }
      enter(pinProfile.profile_id);
    } catch {
      setError("Connexion impossible");
      setBusy(false);
    }
  };

  if (pinProfile) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        <PresetAvatarCircle avatarId={pinProfile.avatar_id || 1} size="xl" label={pinProfile.name || "Profil"} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--mega-text)]">{pinProfile.name || "Profil verrouillé"}</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-[var(--mega-text-faint)]">
            <Lock className="h-4 w-4" /> Entrez le code PIN
          </p>
        </div>
        <input
          autoFocus
          inputMode="numeric"
          value={pin}
          onChange={(event) => setPin(formatPinInput(event.target.value))}
          onKeyDown={(event) => event.key === "Enter" && submitPin()}
          placeholder="••••"
          className="focus-ring w-40 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-4 py-3 text-center text-2xl tracking-[0.5em] text-[var(--mega-text)] outline-none"
        />
        {error ? <p className="text-sm text-[var(--mega-red)]">{error}</p> : null}
        <div className="flex items-center gap-3">
          <MegaButton variant="ghost" onClick={() => setPinProfile(null)} disabled={busy}>
            Retour
          </MegaButton>
          <MegaButton onClick={submitPin} disabled={busy || pin.length < 4}>
            {busy ? "Vérification…" : "Déverrouiller"}
          </MegaButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-10">
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--mega-text-faint)]">
          <PlayCircle className="h-4 w-4" /> MegaTv Web
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--mega-text)] sm:text-4xl">Qui regarde&nbsp;?</h1>
      </div>
      {profiles.length === 0 ? (
        <p className="text-[var(--mega-text-faint)]">Aucun profil MegaTv. Créez-en un depuis MegaCompagnon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {profiles.map((profile) => (
            <button
              key={profile.profile_id}
              type="button"
              onClick={() => choose(profile)}
              className={clsx(
                "focus-ring group flex flex-col items-center gap-3 rounded-3xl p-3 transition hover:bg-[var(--mega-card-bg)]"
              )}
            >
              <span className="relative transition duration-300 group-hover:scale-105">
                <PresetAvatarCircle avatarId={profile.avatar_id || 1} size="xl" label={profile.name || "Profil"} />
                {profile.is_locked ? (
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] text-[var(--mega-text)] backdrop-blur">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </span>
              <span className="max-w-[8rem] truncate text-sm font-semibold text-[var(--mega-text-muted)] group-hover:text-[var(--mega-text)]">
                {profile.name || "Profil MegaTv"}
              </span>
              {profile.is_kids_profile ? (
                <span className="rounded-full bg-[var(--mega-card-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-green)]">
                  Enfant
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
