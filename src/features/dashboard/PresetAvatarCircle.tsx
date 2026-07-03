import Image from "next/image";
import { clsx } from "clsx";

import { avatarAssetPath, avatarGradientCss } from "@/lib/profiles/avatars";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

const pixelSizes: Record<Size, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96
};

/** Single source of truth for MegaTv preset avatars (list, picker, chips). */
export function PresetAvatarCircle({
  avatarId,
  size = "md",
  className,
  label = "Avatar MegaTv"
}: {
  avatarId: number;
  size?: Size;
  className?: string;
  label?: string;
}) {
  const resolvedId = avatarId > 0 ? avatarId : 1;

  return (
    <span
      className={clsx(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 p-0.5",
        sizeClasses[size],
        className
      )}
      style={{ background: avatarGradientCss(resolvedId) }}
      aria-hidden={!label}
      aria-label={label}
    >
      <Image
        key={`preset-avatar-${resolvedId}`}
        src={avatarAssetPath(resolvedId)}
        alt={label}
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        unoptimized
        className="h-full w-full rounded-full object-cover"
      />
    </span>
  );
}
