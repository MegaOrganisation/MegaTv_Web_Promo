"use client";

import { ProfileAvatar } from "@/features/dashboard/ProfileAvatar";
import type { AdminAccountProfile } from "@/features/admin/accounts/types";
import type { ProfileRow } from "@/lib/supabase/types";

export function AdminProfileAvatar({
  profile,
  size = "sm"
}: {
  profile: AdminAccountProfile;
  size?: "sm" | "md" | "lg";
}) {
  const avatarId = profile.avatar_id && profile.avatar_id > 0 ? profile.avatar_id : 0;
  const hasCustom = Boolean(profile.avatar_url) && avatarId === 0;
  const row: ProfileRow = {
    user_id: "",
    profile_id: profile.profile_id,
    name: profile.name,
    avatar_color: null,
    avatar_id: hasCustom ? 0 : avatarId || 1,
    avatar_image_version: hasCustom ? Math.max(profile.avatar_image_version || 1, 1) : 0,
    avatar_image_storage_path: null,
    is_kids_profile: profile.is_kids,
    is_locked: false,
    last_used_at: null,
    updated_at: null
  };

  return (
    <ProfileAvatar
      profile={row}
      avatarUrl={hasCustom ? profile.avatar_url : null}
      size={size}
      preferPreset={!hasCustom}
      label={profile.name || "Profil"}
    />
  );
}
