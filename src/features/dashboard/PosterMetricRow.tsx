import Image from "next/image";

import { WatchProgressBar } from "@/features/dashboard/WatchProgressBar";
import { formatDuration } from "@/lib/format";
import { pickDisplayTitle, tmdbImageUrl } from "@/lib/tmdb";

type PosterItem = {
  media_type?: string | null;
  title?: string | null;
  episode_title?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  progress?: number | null;
  watch_seconds?: number | null;
  progress_seconds?: number | null;
  total_duration_seconds?: number | null;
  season?: number | null;
  episode?: number | null;
};

export function PosterMetricRow({ item, rank }: { item: PosterItem; rank?: number }) {
  const poster = tmdbImageUrl(item.poster_path, "w185") || "/assets/mark.png";
  const title = pickDisplayTitle(item);
  const seconds = item.watch_seconds ?? item.progress_seconds ?? 0;
  const progress = item.progress ?? deriveProgress(item.progress_seconds, item.total_duration_seconds);

  return (
    <div className="mega-surface mega-surface-elevated mega-hover-lift grid grid-cols-[54px_minmax(0,1fr)] gap-3 rounded-[22px] p-3">
      <div className="relative h-20 overflow-hidden rounded-2xl bg-white/8 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.65)]">
        {rank ? (
          <span className="absolute left-1 top-1 z-10 rounded-full border border-white/20 bg-black/70 px-1.5 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
            #{rank}
          </span>
        ) : null}
        <Image src={poster} alt="" fill sizes="54px" className="object-cover" />
      </div>
      <div className="relative min-w-0 py-1">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--mega-text)]">{title}</p>
            <p className="mt-1 text-xs text-[var(--mega-text-faint)]">
              {item.media_type === "tv" ? `S${item.season ?? "?"} · E${item.episode ?? "?"}` : "Film"} · {formatDuration(seconds)}
            </p>
          </div>
        </div>
        <WatchProgressBar value={progress} />
      </div>
    </div>
  );
}

function deriveProgress(position?: number | null, duration?: number | null) {
  if (!position || !duration) return 0;
  return Math.max(0, Math.min(1, position / duration));
}
