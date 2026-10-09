import { clsx } from "clsx";

import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";
import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profile?: ProfileRow | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
  /** Force MegaTv preset even if a legacy custom photo still exists in storage. */
  preferPreset?: boolean;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl"
};

const avatarPixelSizes = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96
};

export function ProfileAvatar({ profile, avatarUrl, size = "md", className, label, preferPreset = false }: Props) {
  const resolvedLabel = label || profile?.name || "Profil MegaTv";
  const avatarId = profile?.avatar_id && profile.avatar_id > 0 ? profile.avatar_id : 1;

  const storagePath = profile?.avatar_image_storage_path?.trim();
  const customSrc = !preferPreset ? (
    avatarUrl ||
    (storagePath && (storagePath.startsWith("http://") || storagePath.startsWith("https://")) ? storagePath : null) ||
    (profile?.profile_id && (storagePath || (profile?.avatar_image_version || 0) > 0)
      ? `/api/profiles/${encodeURIComponent(profile.profile_id)}/avatar?v=${profile.avatar_image_version || 1}`
      : null)
  ) : null;

  const hasCustomImage = Boolean(
    customSrc &&
    !customSrc.includes("/assets/avatars/avatar_") &&
    (profile?.avatar_id === 0 || Boolean(storagePath) || Boolean((profile?.avatar_image_version || 0) > 0) || Boolean(avatarUrl))
  );

  if (hasCustomImage && customSrc) {
    return (
      <span className={clsx("relative inline-block shrink-0 overflow-hidden rounded-full bg-white/10", sizeClasses[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customSrc}
          alt={resolvedLabel}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <PresetAvatarCircle
      avatarId={avatarId}
      size={size}
      className={className}
      label={resolvedLabel}
    />
  );
}
