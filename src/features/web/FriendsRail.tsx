"use client";

import Link from "next/link";
import { Users } from "lucide-react";

import { ProfileAvatar } from "@/features/dashboard/ProfileAvatar";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { FriendRailEntry } from "@/lib/web/friends-rail";
import type { ProfileRow } from "@/lib/supabase/types";

function friendAsProfile(friend: FriendRailEntry): ProfileRow {
  return {
    profile_id: friend.friendProfileId || friend.friendUserId,
    user_id: friend.friendUserId,
    name: friend.displayName,
    avatar_id: friend.avatarId || 0,
    avatar_image_storage_path: friend.avatarImageStoragePath,
    avatar_image_version: friend.avatarImageVersion || 0,
    avatar_color: null,
    is_kids_profile: false,
    is_locked: false,
    last_used_at: null,
    updated_at: null
  };
}

function friendAvatarUrl(friend: FriendRailEntry): string | null {
  const profileId = friend.friendProfileId?.trim();
  if (!profileId) return null;
  const hasCustom =
    Boolean(friend.avatarImageStoragePath?.trim()) || (friend.avatarImageVersion || 0) > 0 || friend.avatarId === 0;
  if (!hasCustom) return null;
  return `/api/profiles/${encodeURIComponent(profileId)}/avatar?v=${friend.avatarImageVersion || 1}`;
}

export function FriendsRail({ friends }: { friends: FriendRailEntry[] }) {
  const { withProfile } = useWebProfile();
  if (!friends.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="mega-rail-bar" aria-hidden />
          <h2 className="text-lg font-bold text-[var(--mega-text)]">Vos amis</h2>
        </div>
        <Link
          href={withProfile("/web/social")}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--mega-text-muted)] transition hover:text-[var(--mega-text)]"
        >
          <Users className="h-3.5 w-3.5" />
          Voir tout
        </Link>
      </div>
      <div className="mega-rail-track flex gap-4 overflow-x-auto px-1 pb-2">
        {friends.map((friend) => {
          const href = withProfile(
            `/web/social?friend=${encodeURIComponent(friend.friendProfileId || friend.friendUserId)}`
          );
          const profile = friendAsProfile(friend);
          return (
            <Link
              key={`${friend.friendUserId}-${friend.friendProfileId || ""}`}
              href={href}
              className="focus-ring group flex w-[4.75rem] shrink-0 flex-col items-center gap-2"
              title={friend.nowPlayingTitle || friend.displayName}
            >
              <span
                className={
                  friend.ring === "active"
                    ? "rounded-full p-[3px] ring-2 ring-[var(--mega-green)] ring-offset-2 ring-offset-[var(--mega-background)]"
                    : "rounded-full p-[3px] ring-2 ring-white/25 ring-offset-2 ring-offset-[var(--mega-background)]"
                }
              >
                <ProfileAvatar
                  profile={profile}
                  avatarUrl={friendAvatarUrl(friend)}
                  size="lg"
                  label={friend.displayName}
                  preferPreset={(friend.avatarId || 0) > 0 && !friend.avatarImageStoragePath}
                />
              </span>
              <span className="w-full truncate text-center text-[11px] font-semibold text-[var(--mega-text-muted)] group-hover:text-[var(--mega-text)]">
                {friend.displayName}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
