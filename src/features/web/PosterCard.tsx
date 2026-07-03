"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { ImageOff, Play } from "lucide-react";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { WebLayout } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

/** Web equivalent of TV D-pad focus: hover scale + ring (no fast-scroll jank). */
export function PosterCard({
  item,
  className,
  layout = "poster",
  showPlay = false,
  fullWidth = false
}: {
  item: WebMediaItem;
  className?: string;
  layout?: WebLayout;
  /** When true, a direct "play" affordance overlays on hover (→ /web/player). */
  showPlay?: boolean;
  /** Fill the parent width (e.g. search/watchlist grids) instead of a fixed rail width. */
  fullWidth?: boolean;
}) {
  const { withProfile } = useWebProfile();
  const progress = typeof item.progress === "number" ? Math.min(100, Math.max(0, item.progress * (item.progress <= 1 ? 100 : 1))) : 0;

  const landscape = layout === "landscape";
  const image = landscape ? item.backdropUrl || item.posterUrl : item.posterUrl;
  const widthClass = fullWidth ? "w-full" : landscape ? "w-[240px] sm:w-[280px]" : "w-[130px] sm:w-[150px]";

  return (
    <div
      className={clsx(
        "group/poster relative",
        fullWidth ? "" : "shrink-0",
        widthClass,
        className
      )}
    >
      <Link
        href={withProfile(`/web/details/${item.mediaId}`)}
        prefetch={false}
        className="focus-ring block"
        title={item.title}
      >
        <div
          className={clsx(
            "relative overflow-hidden rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-surface)] transition duration-300 group-hover/poster:scale-[1.05] group-hover/poster:border-[var(--mega-border-strong)] group-hover/poster:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]",
            landscape ? "aspect-video" : "aspect-[2/3]"
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={item.title}
              fill
              unoptimized
              sizes={landscape ? "280px" : "150px"}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center text-[var(--mega-text-faint)]">
              <ImageOff className="h-6 w-6" />
              <span className="line-clamp-3 text-xs">{item.title}</span>
            </div>
          )}
          {progress > 0 ? (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
              <div className="h-full bg-[var(--mega-red)]" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
        </div>
      </Link>

      {showPlay ? (
        <Link
          href={withProfile(`/web/player/${item.mediaId}`)}
          prefetch={false}
          aria-label={`Lire ${item.title}`}
          className="focus-ring absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-shell-nav)] text-[var(--mega-text)] opacity-0 backdrop-blur transition hover:bg-[var(--mega-card-bg)] group-hover/poster:opacity-100 focus-visible:opacity-100"
        >
          <Play className="h-4 w-4" fill="currentColor" />
        </Link>
      ) : null}

      <Link href={withProfile(`/web/details/${item.mediaId}`)} prefetch={false} className="block">
        <p className="mt-2 line-clamp-1 text-xs font-medium text-[var(--mega-text-muted)] group-hover/poster:text-[var(--mega-text)]">
          {item.title}
        </p>
        {item.subtitle ? <p className="line-clamp-1 text-[10px] text-[var(--mega-text-faint)]">{item.subtitle}</p> : null}
      </Link>
    </div>
  );
}
