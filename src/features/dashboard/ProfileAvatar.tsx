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
  const hasCustomImage =
    !preferPreset &&
    (profile?.avatar_id || 0) === 0 &&
    Boolean(avatarUrl && (profile?.avatar_image_version || 0) > 0);

  if (hasCustomImage) {
    return (
      <span className={clsx("relative inline-grid shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10", sizeClasses[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase Storage URLs are private and already fixed-size avatar thumbnails. */}
        <img src={avatarUrl || ""} alt={resolvedLabel} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
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
