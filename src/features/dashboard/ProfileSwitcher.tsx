import Link from "next/link";
import { clsx } from "clsx";

import { ProfileAvatar } from "@/features/dashboard/ProfileAvatar";
import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profiles: ProfileRow[];
  activeProfileId?: string | null;
  profileAvatarUrlsById?: Record<string, string>;
  basePath?: string;
};

export function ProfileSwitcher({ profiles, activeProfileId, profileAvatarUrlsById = {}, basePath = "/companion" }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 text-sm text-white/48">
        Aucun profil cloud détecté pour le moment.
      </div>
    );
  }

  const allHref = basePath;
  const showAll = basePath === "/companion";

  return (
    <div className="flex max-w-full snap-x gap-3 overflow-x-auto pb-2">
      {showAll ? <ProfilePill href={allHref} label="Tous" active={!activeProfileId} /> : null}
      {profiles.map((profile) => (
        <ProfilePill
          key={profile.profile_id}
          href={`${basePath}?profile=${encodeURIComponent(profile.profile_id)}`}
          label={profile.name || "Profil"}
          active={activeProfileId === profile.profile_id}
          profile={profile}
          avatarUrl={profileAvatarUrlsById[profile.profile_id]}
        />
      ))}
    </div>
  );
}

function ProfilePill({
  href,
  label,
  active,
  profile,
  avatarUrl
}: {
  href: string;
  label: string;
  active: boolean;
  profile?: ProfileRow;
  avatarUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "focus-ring flex max-w-[78vw] shrink-0 snap-start items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition",
        active ? "border-white/30 bg-white/14 text-white" : "border-white/10 bg-white/[0.045] text-white/55 hover:text-white"
      )}
    >
      {profile ? (
        <ProfileAvatar profile={profile} avatarUrl={avatarUrl} size="sm" />
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#3f9ae6,#d8497f)] text-xs font-black text-white">T</span>
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}
