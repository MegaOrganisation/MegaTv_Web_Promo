"use client";

import Link from "next/link";
import { Users } from "lucide-react";

import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { FriendRailEntry } from "@/lib/web/friends-rail";

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
                <PresetAvatarCircle avatarId={friend.avatarId || 1} size="lg" label={friend.displayName} />
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
