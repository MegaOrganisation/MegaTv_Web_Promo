import Link from "next/link";
import { clsx } from "clsx";

import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profiles: ProfileRow[];
  activeProfileId?: string | null;
};

export function ProfileSwitcher({ profiles, activeProfileId }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 text-sm text-white/48">
        Aucun profil cloud détecté pour le moment.
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <ProfilePill href="/companion" label="Tous" active={!activeProfileId} />
      {profiles.map((profile) => (
        <ProfilePill
          key={profile.profile_id}
          href={`/companion?profile=${encodeURIComponent(profile.profile_id)}`}
          label={profile.name || "Profil"}
          active={activeProfileId === profile.profile_id}
          color={profile.avatar_color}
        />
      ))}
    </div>
  );
}

function ProfilePill({ href, label, active, color }: { href: string; label: string; active: boolean; color?: number | null }) {
  return (
    <Link
      href={href}
      className={clsx(
        "focus-ring flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition",
        active ? "border-white/30 bg-white/14 text-white" : "border-white/10 bg-white/[0.045] text-white/55 hover:text-white"
      )}
    >
      <span className="grid h-7 w-7 place-items-center rounded-full text-xs font-black text-black" style={{ background: colorToCss(color) }}>
        {label.charAt(0).toUpperCase()}
      </span>
      {label}
    </Link>
  );
}

function colorToCss(value?: number | null) {
  if (!value) return "linear-gradient(135deg,#3f9ae6,#d8497f)";
  const hex = (value >>> 0).toString(16).padStart(8, "0").slice(-6);
  return `#${hex}`;
}
