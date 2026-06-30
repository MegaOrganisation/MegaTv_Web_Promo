import Image from "next/image";
import { clsx } from "clsx";

import { avatarAssetPath, avatarGradientCss, isLightProfileColor, profileColorToCss, profileInitial } from "@/lib/profiles/avatars";
import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profile?: ProfileRow | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
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

export function ProfileAvatar({ profile, avatarUrl, size = "md", className, label }: Props) {
  const resolvedLabel = label || profile?.name || "Profil MegaTv";
  const hasCustomImage = Boolean(avatarUrl && (profile?.avatar_image_version || 0) > 0);
  const hasPreset = !hasCustomImage && Boolean((profile?.avatar_id || 0) > 0);

  if (hasCustomImage) {
    return (
      <span className={clsx("relative inline-grid shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10", sizeClasses[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase Storage URLs are private and already fixed-size avatar thumbnails. */}
        <img src={avatarUrl || ""} alt={resolvedLabel} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
      </span>
    );
  }

  if (hasPreset) {
    return (
      <span
        className={clsx("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 p-0.5", sizeClasses[size], className)}
        style={{ background: avatarGradientCss(profile?.avatar_id) }}
      >
        <Image src={avatarAssetPath(profile?.avatar_id)} alt={resolvedLabel} width={avatarPixelSizes[size]} height={avatarPixelSizes[size]} className="h-full w-full rounded-full object-cover" />
      </span>
    );
  }

  const color = profileColorToCss(profile?.avatar_color);
  const darkText = isLightProfileColor(profile?.avatar_color);
  return (
    <span
      className={clsx("inline-grid shrink-0 place-items-center rounded-full border border-white/15 font-black", sizeClasses[size], className, darkText ? "text-black" : "text-white")}
      style={{ background: color }}
      aria-label={resolvedLabel}
    >
      {profileInitial(profile)}
    </span>
  );
}
