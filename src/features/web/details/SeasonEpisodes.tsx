"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Play,
  ShieldAlert
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Spinner } from "@/features/web/Spinner";
import { useLocalFlag } from "@/features/web/details/localFlags";
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

function formatAirDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function EpisodeRow({
  episode,
  showId,
  profileId,
  spoilerBlurEnabled,
  onPlay
}: {
  episode: WebEpisode;
  showId: number;
  profileId: string;
  spoilerBlurEnabled: boolean;
  onPlay: () => void;
}) {
  const episodeMediaId = encodeMediaId("tv", showId, episode.seasonNumber, episode.episodeNumber);
  const [isWatched, toggleWatched] = useLocalFlag("watched", profileId, episodeMediaId);
  const [revealed, setRevealed] = useState(false);

  // Parity with Android DetailsEpisodeUi.kt:
  // val isSpoilerBlurred = spoilerBlurEnabled && !episode.isWatched
  const isSpoilerBlurred = spoilerBlurEnabled && !isWatched && !revealed;

  return (
    <div className="group flex flex-col gap-2 rounded-xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/60 p-2.5 transition hover:border-[var(--mega-border-strong)] hover:bg-[var(--mega-surface)]/80 sm:flex-row sm:items-center">
      {/* Clickable thumbnail to play */}
      <button
        type="button"
        onClick={onPlay}
        className="focus-ring relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-[var(--mega-border)] bg-[var(--mega-surface)] sm:w-[160px]"
        aria-label={`Lire l'épisode ${episode.episodeNumber} - ${episode.name}`}
      >
        {episode.stillUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={episode.stillUrl}
            alt={episode.name}
            className={clsx(
              "h-full w-full object-cover transition duration-300 group-hover:scale-105",
              isSpoilerBlurred && "blur-md scale-110"
            )}
          />
        ) : null}

        {isSpoilerBlurred && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-[10px] font-semibold text-amber-300 backdrop-blur-xs">
            <span className="flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5">
              <EyeOff className="h-3 w-3" /> Anti-spoiler
            </span>
          </div>
        )}

        <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition group-hover:opacity-100">
          <Play className="h-6 w-6 text-white" fill="currentColor" />
        </span>
      </button>

      {/* Episode Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-black text-[var(--mega-text-muted)]">
            E{episode.episodeNumber}
          </span>
          <button
            type="button"
            onClick={onPlay}
            className="text-left text-sm font-bold text-[var(--mega-text)] hover:underline"
          >
            {episode.name}
          </button>

          {/* Runtime */}
          {episode.runtime ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--mega-text-faint)]">
              <Clock className="h-3 w-3" />
              {formatRuntimeMinutes(episode.runtime)}
            </span>
          ) : null}

          {/* Air Date */}
          {episode.airDate && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--mega-text-faint)]">
              <Calendar className="h-3 w-3" />
              {formatAirDate(episode.airDate)}
            </span>
          )}

          {/* Watched Action Pastille */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWatched();
              }}
              title={isWatched ? "Marqué comme vu (cliquer pour annuler)" : "Marquer comme vu"}
              className={clsx(
                "focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition",
                isWatched
                  ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:border-emerald-500/40 hover:text-emerald-300"
              )}
            >
              <Check className={clsx("h-3 w-3", isWatched ? "text-emerald-300" : "opacity-60")} />
              <span>{isWatched ? "Vu" : "Vu ?"}</span>
            </button>
          </div>
        </div>

        {/* Overview with Anti-Spoiler Blur */}
        <div className="mt-1.5">
          {isSpoilerBlurred ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(true);
                }}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Afficher le résumé (Anti-spoiler)</span>
              </button>
              <span className="text-[11px] text-[var(--mega-text-faint)]">
                Synopsis masqué pour éviter tout spoiler
              </span>
            </div>
          ) : (
            <p className="line-clamp-2 text-xs leading-relaxed text-[var(--mega-text-muted)]">
              {episode.overview || "Aucun synopsis disponible pour cet épisode."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SeasonEpisodes({ showId, profileId, seasons }: Props) {
  const router = useRouter();
  const [openSeason, setOpenSeason] = useState<number | null>(seasons[0]?.seasonNumber ?? null);
  const [cache, setCache] = useState<Record<number, EpisodeState>>({});

  // Spoiler Blur state persisted in localStorage (lazy initialized)
  const [spoilerBlurEnabled, setSpoilerBlurEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(`megatv_web_spoiler_blur_${profileId}`);
      if (stored != null) return stored === "true";
    } catch {
      /* ignore */
    }
    return true;
  });

  const toggleSpoilerBlur = () => {
    const next = !spoilerBlurEnabled;
    setSpoilerBlurEnabled(next);
    try {
      localStorage.setItem(`megatv_web_spoiler_blur_${profileId}`, String(next));
    } catch {
      /* ignore */
    }
  };

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

  // Automatically fetch first season on mount
  useEffect(() => {
    const first = seasons[0]?.seasonNumber;
    if (first == null) return;
    let active = true;

    fetch(`/api/web/episodes?showId=${showId}&season=${first}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("http"))))
      .then((data: { episodes?: WebEpisode[] }) => {
        if (!active) return;
        setCache((prev) => {
          if (prev[first]?.status === "ready") return prev;
          return { ...prev, [first]: { status: "ready", episodes: data.episodes || [] } };
        });
      })
      .catch(() => {
        if (!active) return;
        setCache((prev) => ({ ...prev, [first]: { status: "error" } }));
      });

    return () => {
      active = false;
    };
  }, [seasons, showId]);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--mega-text)]">Saisons ({seasons.length})</h2>

        {/* Global Anti-Spoiler Toggle */}
        <button
          type="button"
          onClick={toggleSpoilerBlur}
          className={clsx(
            "focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition border",
            spoilerBlurEnabled
              ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
              : "border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
          )}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Anti-spoiler : {spoilerBlurEnabled ? "Activé" : "Désactivé"}</span>
        </button>
      </div>

      {/* Season Cards Strip */}
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

      {/* Episodes List */}
      {openSeason != null ? (
        <div className="rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/40 p-3 sm:p-4">
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
              <ul className="space-y-2.5">
                {state.episodes.map((episode) => (
                  <li key={episode.id}>
                    <EpisodeRow
                      episode={episode}
                      showId={showId}
                      profileId={profileId}
                      spoilerBlurEnabled={spoilerBlurEnabled}
                      onPlay={() => playEpisode(episode.seasonNumber, episode.episodeNumber)}
                    />
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
