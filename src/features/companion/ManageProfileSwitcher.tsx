"use client";

import { usePathname } from "next/navigation";

import { ProfileSwitcher } from "@/features/dashboard/ProfileSwitcher";
import type { ProfileRow } from "@/lib/supabase/types";

export function ManageProfileSwitcher({
  profiles,
  activeProfileId,
  profileAvatarUrlsById = {}
}: {
  profiles: ProfileRow[];
  activeProfileId?: string | null;
  profileAvatarUrlsById?: Record<string, string>;
}) {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/companion/manage/") ? pathname : "/companion/manage/iptv";

  return (
    <ProfileSwitcher
      profiles={profiles}
      activeProfileId={activeProfileId}
      basePath={basePath}
      profileAvatarUrlsById={profileAvatarUrlsById}
    />
  );
}
