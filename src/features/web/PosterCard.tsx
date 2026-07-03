"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { ImageOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PosterContextMenu } from "@/features/web/PosterContextMenu";
import { MegaTvIcon } from "@/features/web/icons/MegaTvIcon";
import { fetchCardEnrich, fetchTitleLogo, fetchTrailerKey } from "@/features/web/mediaClient";
import { useYoutubeTrailerSound } from "@/features/web/useYoutubeTrailerSound";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs, type WebLayout } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

const HOVER_STABLE_MS = 700;
const EXPAND_WIDTH = 400;

function isGenericPosterLabel(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  return !trimmed || trimmed === "poster" || trimmed === "backdrop";
}

/** Web equivalent of TV D-pad focus: hover scale + ring, lazy logo/trailer. */
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
  showPlay?: boolean;
  fullWidth?: boolean;
}) {
  const { withProfile, activeProfileId } = useWebProfile();
  const { prefs } = useWebPrefs(activeProfileId);

  const landscape = layout === "landscape";
  const displayTitle = isGenericPosterLabel(item.title) ? "" : item.title;

  const [backdropUrl, setBackdropUrl] = useState<string | null>(item.backdropUrl ?? null);
  const [resolvedTitle, setResolvedTitle] = useState(displayTitle);
  const [logo, setLogo] = useState<string | null>(item.logoUrl ?? null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "playing">("idle");
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoAsked = useRef(false);
  const enrichAsked = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const widthClass = fullWidth ? "w-full" : landscape ? "w-[240px] sm:w-[280px]" : "w-[130px] sm:w-[150px]";
  const rawProgress = typeof item.progress === "number" ? item.progress : 0;
  const progress = Math.min(100, Math.max(0, rawProgress <= 1 ? rawProgress * 100 : rawProgress));

  const canExpand = !fullWidth;
  const expanded = phase === "playing" && !landscape && canExpand;
  const showVideo = phase === "playing" && Boolean(trailerKey);
  const videoLandscape = landscape || expanded;

  const landscapeImage = landscape
    ? backdropUrl || item.backdropUrl || item.posterUrl || null
    : item.posterUrl;
  const portraitImage = item.posterUrl;
  const image = landscape ? landscapeImage : portraitImage;
  const usingPosterFallback = landscape && !backdropUrl && !item.backdropUrl && Boolean(item.posterUrl);

  useYoutubeTrailerSound(iframeRef, showVideo, prefs.trailerSound);

  useEffect(() => {
    if (!landscape || enrichAsked.current) return;
    if (backdropUrl || item.backdropUrl) return;
    enrichAsked.current = true;
    void fetchCardEnrich(item.mediaId).then((enrich) => {
      if (enrich.backdropUrl) setBackdropUrl(enrich.backdropUrl);
      if (!displayTitle && enrich.title) setResolvedTitle(enrich.title);
    });
  }, [landscape, item.mediaId, item.backdropUrl, backdropUrl, displayTitle]);

  useEffect(() => {
    if (!landscape || logo || logoAsked.current) return;
    logoAsked.current = true;
    void fetchTitleLogo(item.mediaId).then((value) => value && setLogo(value));
  }, [landscape, logo, item.mediaId]);

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

  const detailsHref = withProfile(`/web/details/${item.mediaId}`);
  const label = resolvedTitle || displayTitle || "Contenu";

  return (
    <div
      className={clsx("group/poster relative", fullWidth ? "" : "shrink-0", className)}
      style={expanded ? { width: EXPAND_WIDTH } : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenu({ x: event.clientX, y: event.clientY });
      }}
    >
      <div className={clsx("transition-[width] duration-500 ease-out", expanded ? "" : widthClass)}>
        <Link href={detailsHref} prefetch={false} className="focus-ring block" title={label}>
          <div
            className={clsx(
              "mega-poster-radius mega-poster-hover-glow relative overflow-hidden border border-[var(--mega-border)] bg-[var(--mega-surface)]",
              expanded ? "" : "group-hover/poster:scale-[1.05]",
              videoLandscape ? "aspect-video" : "aspect-[2/3]"
            )}
          >
            {image ? (
              <Image
                src={image}
                alt=""
                fill
                unoptimized
                sizes={videoLandscape ? "400px" : "150px"}
                className={clsx("object-cover", usingPosterFallback ? "scale-110 object-top" : "")}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center text-[var(--mega-text-faint)]">
                <ImageOff className="h-6 w-6" />
              </div>
            )}

            {landscape ? (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,10,0.72)_0%,transparent_58%)]" />
            ) : null}

            {showVideo ? (
              <div className="web-logo-in absolute inset-0">
                <iframe
                  ref={iframeRef}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2"
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${trailerKey}&enablejsapi=1&iv_load_policy=3`}
                  title={`${label} — bande-annonce`}
                  allow="autoplay; encrypted-media"
                  frameBorder={0}
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,10,0.85)_0%,transparent_50%)]" />
              </div>
            ) : null}

            {landscape && logo ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 px-2.5 pb-[18px] pl-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt=""
                  className="web-logo-in max-h-12 max-w-[52%] object-contain object-left-bottom drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
                />
              </div>
            ) : landscape && resolvedTitle ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
                <p className="line-clamp-2 max-w-[52%] text-sm font-bold text-[var(--mega-text)] drop-shadow">
                  {resolvedTitle}
                </p>
              </div>
            ) : null}

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
            aria-label={`Lire ${label}`}
            className="focus-ring absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-shell-nav)] text-[var(--mega-text)] opacity-0 backdrop-blur transition hover:bg-[var(--mega-card-bg)] group-hover/poster:opacity-100 focus-visible:opacity-100"
          >
            <MegaTvIcon name="play" filled className="h-4 w-4" />
          </Link>
        ) : null}

        {!landscape && resolvedTitle ? (
          <Link href={detailsHref} prefetch={false} className="block">
            <p className="mt-2 line-clamp-1 text-xs font-medium text-[var(--mega-text-muted)] group-hover/poster:text-[var(--mega-text)]">
              {resolvedTitle}
            </p>
            {item.subtitle ? <p className="line-clamp-1 text-[10px] text-[var(--mega-text-faint)]">{item.subtitle}</p> : null}
          </Link>
        ) : null}
      </div>

      {menu ? <PosterContextMenu item={item} x={menu.x} y={menu.y} onClose={() => setMenu(null)} /> : null}
    </div>
  );
}
