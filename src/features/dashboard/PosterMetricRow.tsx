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
    <div className="grid grid-cols-[54px_minmax(0,1fr)] gap-3 rounded-[20px] border border-white/8 bg-white/[0.035] p-3">
      <div className="relative h-20 overflow-hidden rounded-2xl bg-white/8 poster-shadow">
        {rank ? <span className="absolute left-1 top-1 z-10 rounded-full bg-black/62 px-1.5 py-0.5 text-[10px] font-black text-white">#{rank}</span> : null}
        <Image src={poster} alt="" fill sizes="54px" className="object-cover" />
      </div>
      <div className="min-w-0 py-1">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{title}</p>
            <p className="mt-1 text-xs text-white/38">
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
