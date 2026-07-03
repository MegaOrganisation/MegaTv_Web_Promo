"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { ChevronDown, Play } from "lucide-react";
import { useCallback, useState } from "react";

import { Spinner } from "@/features/web/Spinner";
import { withProfileQuery } from "@/lib/companion/profile-scope";
import { encodeMediaId } from "@/lib/web/media";
import { formatRuntimeMinutes } from "@/lib/tmdb";
import type { WebEpisode } from "@/app/api/web/episodes/route";

export type SeasonInput = {
  id: number;
  name: string;
  seasonNumber: number;
  episodeCount: number;
  posterUrl: string | null;
};

type Props = {
  showId: number;
  profileId: string;
  seasons: SeasonInput[];
};

type EpisodeState = { status: "loading" } | { status: "ready"; episodes: WebEpisode[] } | { status: "error" };

export function SeasonEpisodes({ showId, profileId, seasons }: Props) {
  const router = useRouter();
  const [openSeason, setOpenSeason] = useState<number | null>(null);
  // Client cache keyed by season number — only the clicked season is fetched.
  const [cache, setCache] = useState<Record<number, EpisodeState>>({});

  const selectSeason = useCallback(
    (seasonNumber: number) => {
      if (openSeason === seasonNumber) {
        setOpenSeason(null);
        return;
      }
      setOpenSeason(seasonNumber);
      if (cache[seasonNumber]?.status === "ready") return;

      setCache((prev) => ({ ...prev, [seasonNumber]: { status: "loading" } }));
      fetch(`/api/web/episodes?showId=${showId}&season=${seasonNumber}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("http"))))
        .then((data: { episodes?: WebEpisode[] }) => {
          setCache((prev) => ({ ...prev, [seasonNumber]: { status: "ready", episodes: data.episodes || [] } }));
        })
        .catch(() => {
          setCache((prev) => ({ ...prev, [seasonNumber]: { status: "error" } }));
        });
    },
    [openSeason, cache, showId]
  );

  const playEpisode = useCallback(
    (season: number, episode: number) => {
      const epMediaId = encodeMediaId("tv", showId, season, episode);
      router.push(withProfileQuery(`/web/player/${epMediaId}`, profileId));
    },
    [router, showId, profileId]
  );

  const state = openSeason != null ? cache[openSeason] : undefined;

  return (
    <section className="space-y-4 px-1">
      <h2 className="text-lg font-bold text-[var(--mega-text)]">Saisons ({seasons.length})</h2>

      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {seasons.map((season) => {
          const isOpen = openSeason === season.seasonNumber;
          return (
            <button
              key={season.id}
              type="button"
              onClick={() => selectSeason(season.seasonNumber)}
              aria-expanded={isOpen}
              className="focus-ring group mega-poster-w shrink-0 text-left"
            >
              <div
                className={clsx(
                  "mega-poster-shell mega-poster-frame aspect-[2/3] transition duration-300 group-hover:scale-[1.04]",
                  isOpen ? "border-[var(--mega-red)]/60" : "group-hover:border-[var(--mega-border-strong)]"
                )}
              >
                {season.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={season.posterUrl} alt={season.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-[var(--mega-text-faint)]">
                    {season.name}
                  </div>
                )}
                <div
                  className={clsx(
                    "absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-[var(--mega-background-deep)]/85 py-1.5 text-[11px] font-semibold text-[var(--mega-text)] transition",
                    isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  Épisodes <ChevronDown className={clsx("h-3.5 w-3.5 transition", isOpen && "rotate-180")} />
                </div>
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-medium text-[var(--mega-text-muted)]">{season.name}</p>
              <p className="text-[10px] text-[var(--mega-text-faint)]">{season.episodeCount} épisodes</p>
            </button>
          );
        })}
      </div>

      {openSeason != null ? (
        <div className="rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/50 p-3 sm:p-4">
          {state?.status === "loading" ? (
            <div className="grid place-items-center py-8">
              <Spinner size="md" />
            </div>
          ) : null}

          {state?.status === "error" ? (
            <p className="py-6 text-center text-sm text-[var(--mega-text-muted)]">
              Impossible de charger les épisodes de cette saison.
            </p>
          ) : null}

          {state?.status === "ready" ? (
            state.episodes.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--mega-text-muted)]">Aucun épisode disponible.</p>
            ) : (
              <ul className="space-y-2">
                {state.episodes.map((episode) => (
                  <li key={episode.id}>
                    <button
                      type="button"
                      onClick={() => playEpisode(episode.seasonNumber, episode.episodeNumber)}
                      className="focus-ring group flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition hover:border-[var(--mega-border)] hover:bg-[var(--mega-surface)]"
                    >
                      <div className="relative aspect-video w-[120px] shrink-0 overflow-hidden rounded-lg border border-[var(--mega-border)] bg-[var(--mega-surface)] sm:w-[150px]">
                        {episode.stillUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={episode.stillUrl} alt={episode.name} className="h-full w-full object-cover" />
                        ) : null}
                        <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                          <Play className="h-6 w-6 text-white" fill="currentColor" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--mega-text)]">
                          <span className="text-[var(--mega-text-muted)]">{episode.episodeNumber}.</span>
                          <span className="line-clamp-1">{episode.name}</span>
                          {episode.runtime ? (
                            <span className="ml-auto shrink-0 text-[11px] font-normal text-[var(--mega-text-faint)]">
                              {formatRuntimeMinutes(episode.runtime)}
                            </span>
                          ) : null}
                        </p>
                        {episode.overview ? (
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--mega-text-muted)]">{episode.overview}</p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
