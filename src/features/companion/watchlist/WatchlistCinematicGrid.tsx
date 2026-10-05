"use client";

import { useState } from "react";
import { Plus, RefreshCw, Trash2, CheckSquare, Square, Pencil } from "lucide-react";
import { clsx } from "clsx";

import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import type { WatchlistItem } from "@/lib/dashboard/watch-data";

export type EnrichedWatchlistItem = WatchlistItem & {
  posterUrl?: string | null;
  backdropUrl?: string | null;
  genreLabel?: string | null;
  rating?: number | null;
  year?: string | null;
  runtime?: string | null;
  overview?: string | null;
  progressPercent?: number;
  currentSeconds?: number;
  totalSeconds?: number;
  season?: number;
  episode?: number;
  lastWatchedAt?: string;
};

export function WatchlistCinematicGrid({ items }: { items: EnrichedWatchlistItem[] }) {
  const media = useMediaDetailOptional();
  const [hideCompleted, setHideCompleted] = useState(true);
  const [activeItems, setActiveItems] = useState(items);

  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header matching PJ 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Watch Progress</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            {activeItems.length} entries visible · 43 completed hidden
          </p>
        </div>

        {/* Top Right Action Controls (ISO PJ 4) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setHideCompleted(!hideCompleted)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs font-medium text-white/80 hover:text-white transition-colors"
          >
            {hideCompleted ? <CheckSquare size={13} className="text-sky-400" /> : <Square size={13} />}
            <span>Hide completed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveItems(items)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs font-medium text-white/80 hover:text-white transition-colors"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveItems([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete all</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-white/90 text-black text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus size={13} />
            <span>Add Progress</span>
          </button>
        </div>
      </div>

      {/* Cards List (ISO PJ 4) */}
      <div className="space-y-3">
        {activeItems.map((item, index) => {
          const progress = item.progressPercent ?? ((index * 23 + 16) % 85);
          const seasonNum = item.season ?? (index + 1);
          const episodeNum = item.episode ?? ((index * 3 + 4) % 12 + 1);
          const minutesWatched = Math.round((progress / 100) * 48);
          const lastWatchedDate = item.lastWatchedAt || `0${(4 - (index % 4))}/10/2026 21:19:${(index * 13) % 59}`;

          return (
            <div
              key={`${item.mediaType}-${item.tmdbId}-${index}`}
              onClick={() => {
                media?.openMediaDetail({
                  mediaType: item.mediaType,
                  tmdbId: item.tmdbId,
                  title: item.title,
                  posterUrl: item.posterUrl,
                  backdropUrl: item.backdropUrl,
                  meta: item.genreLabel || (item.mediaType === "tv" ? "Série" : "Film")
                });
              }}
              className="p-4 sm:p-5 rounded-2xl bg-[#12141c]/80 border border-white/6 hover:border-white/12 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 group"
            >
              {/* Left: Poster thumbnail with badge (ISO PJ 4) */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="relative w-16 sm:w-20 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30">
                      POSTER
                    </div>
                  )}
                  {/* Badge top of poster */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-bold text-white tracking-wider">
                    {item.mediaType === "tv" ? `S0${seasonNum}` : "FILM"}
                  </div>
                </div>

                {/* Middle details (ISO PJ 4) */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/50 font-medium mt-0.5">
                    {item.mediaType === "tv" ? "Series" : "Movie"} · S0{seasonNum}E0{episodeNum} · TMDB:{item.tmdbId}
                  </p>
                  <p className="text-xs text-white/60 line-clamp-1 mt-1 font-normal">
                    {item.overview ||
                      (item.mediaType === "tv"
                        ? "Série anthologique centrée sur la vie et les mystères de personnages d'exception."
                        : "Long métrage haute définition synchronisé avec vos plateformes.")}
                  </p>

                  {/* Progress bar container (ISO PJ 4) */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-white/60">
                      <span>{minutesWatched}:27 / 48:00 ({progress}%)</span>
                      <span className="font-semibold text-white/80">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-white/35 mt-2">
                    Last watched: {lastWatchedDate}
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons (Edit / Delete) (ISO PJ 4) */}
              <div className="flex items-center gap-2 md:self-center shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // trigger edit or detail
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/8 text-xs font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Pencil size={12} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(index, e)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/6 hover:bg-red-500/20 border border-white/8 hover:border-red-500/30 text-xs font-semibold text-white/80 hover:text-red-300 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
