"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PosterContextMenu } from "@/features/web/PosterContextMenu";
import { SeriesInProgressBadge } from "@/features/web/SeriesInProgressBadge";
import { fetchTrailerKey } from "@/features/web/mediaClient";
import { useYoutubeTrailerSound } from "@/features/web/useYoutubeTrailerSound";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs } from "@/lib/web/prefs";
import {
  formatResumeClock,
  getContinueProgressFraction,
  getPlaybackTimeLabels
} from "@/lib/web/playbackTime";
import type { WebMediaItem } from "@/lib/web/media";

const HOVER_STABLE_MS = 700;

/**
 * "Reprendre" card — horizontal Infuse layout (poster left, metadata + progress right),
 * parity with Android `ContinueWatchingCard`.
 */
export function ContinueWatchingCard({ item }: { item: WebMediaItem }) {
  const { withProfile, activeProfileId } = useWebProfile();
  const { prefs } = useWebPrefs(activeProfileId);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "playing">("idle");
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const progressFraction = getContinueProgressFraction(item);
  const progressPercent = Math.min(
    99,
    Math.max(1, Math.round(progressFraction * 100) || (item.progress ? Math.round(item.progress <= 1 ? item.progress * 100 : item.progress) : 0))
  );
  const { elapsedLabel, remainingLabel, totalLabel } = getPlaybackTimeLabels(item, progressFraction);

  const posterUrl = item.posterUrl;
  const backdropUrl =
    item.backdropUrl && item.backdropUrl !== posterUrl
      ? item.backdropUrl.replace("/t/p/w1280/", "/t/p/w780/")
      : null;
  const showVideo = phase === "playing" && Boolean(trailerKey);

  const episodeInfo =
    item.subtitle ||
    (item.mediaType === "tv" && item.season
      ? item.episodeTitle
        ? `S${item.season} • E${item.episode ?? 1} - ${item.episodeTitle}`
        : `S${item.season}·E${item.episode ?? 1}`
      : item.progressSeconds
        ? `Continue from ${formatResumeClock(item.progressSeconds)}`
        : null);

  useYoutubeTrailerSound(iframeRef, showVideo, prefs.trailerSound);

  const clearHover = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);

  const onEnter = useCallback(() => {
    if (!prefs.trailerAutoplay) return;
    clearHover();
    hoverTimer.current = setTimeout(async () => {
      const key = trailerKey ?? (await fetchTrailerKey(item.mediaId));
      if (!key) return;
      setTrailerKey(key);
      setPhase("playing");
    }, HOVER_STABLE_MS);
  }, [prefs.trailerAutoplay, item.mediaId, trailerKey, clearHover]);

  const onLeave = useCallback(() => {
    clearHover();
    setPhase("idle");
  }, [clearHover]);

  useEffect(() => () => clearHover(), [clearHover]);

  const elapsedWidth = `${Math.max(progressFraction * 100, progressFraction > 0 ? 18 : 0)}%`;
  const showRemaining =
    Boolean(remainingLabel) && progressFraction <= 0.55 && progressFraction > 0;

  return (
    <div
      className="group/cw relative shrink-0"
      style={{ width: "var(--mega-cw-w)" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenu({ x: event.clientX, y: event.clientY });
      }}
    >
      <Link
        href={withProfile(`/web/player/${item.mediaId}`)}
        prefetch={false}
        className="focus-ring block rounded-[28px] focus-visible:outline-[var(--brand-magenta)]"
        title={item.title}
      >
        <div
          className="mega-cw-shell mega-pro-glass relative flex overflow-hidden rounded-[var(--mega-poster-radius)] border transition duration-300"
          style={{ height: "var(--mega-cw-h)" }}
        >
          {backdropUrl ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[65%] overflow-hidden">
              <Image
                src={backdropUrl}
                alt=""
                fill
                unoptimized
                sizes="200px"
                className="object-cover opacity-[0.15]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, #151618 0%, #151618 30%, rgba(21,22,24,0.85) 55%, rgba(21,22,24,0.3) 80%, transparent 100%)"
                }}
              />
            </div>
          ) : null}

          <div className="relative z-[1] flex h-full min-w-0 flex-1 items-center">
            <div
              className="relative h-full shrink-0 overflow-hidden rounded-l-[12px] rounded-r-lg bg-[var(--mega-surface)]"
              style={{ width: "var(--mega-cw-poster-w)" }}
            >
              {posterUrl ? (
                <Image src={posterUrl} alt={item.title} fill unoptimized sizes="96px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--mega-text-faint)]">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}

              {showVideo ? (
                <div className="absolute inset-0">
                  <iframe
                    ref={iframeRef}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2"
                    src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${trailerKey}&enablejsapi=1&iv_load_policy=3`}
                    title={`${item.title} — bande-annonce`}
                    allow="autoplay; encrypted-media"
                    frameBorder={0}
                  />
                </div>
              ) : null}

              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <SeriesInProgressBadge progressPercent={progressPercent} size={46} className="relative" />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col px-3 pt-2.5 pb-2">
              <p className="line-clamp-1 text-base font-bold leading-tight text-[var(--mega-text)] sm:text-[17px]">{item.title}</p>
              {episodeInfo ? (
                <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-[var(--mega-text-muted)] sm:text-[13px]">{episodeInfo}</p>
              ) : null}

              <div className="min-h-[0.35rem] flex-1" />

              <div className="relative mt-1 h-4 w-full rounded-full bg-[var(--mega-row)] p-px">
                <div
                  className="absolute inset-y-px left-px flex min-w-[48px] items-center justify-center rounded-full bg-[var(--mega-accent-gradient)]"
                  style={{ width: elapsedWidth }}
                >
                  <span className="px-1 text-[8px] font-bold leading-none text-[#041014] sm:text-[9px]">
                    {elapsedLabel}
                  </span>
                </div>
                {showRemaining ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-medium text-white/75 sm:text-[9px]">
                    {remainingLabel}
                  </span>
                ) : null}
                {totalLabel ? (
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[8px] font-medium text-white/75 sm:text-[9px]">
                    {totalLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {menu ? <PosterContextMenu item={item} x={menu.x} y={menu.y} onClose={() => setMenu(null)} /> : null}
    </div>
  );
}
