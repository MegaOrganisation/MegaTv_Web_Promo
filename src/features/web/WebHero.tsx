"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { fetchTitleLogo, fetchTrailerKey, seedTitleLogo, seedTrailerKey } from "@/features/web/mediaClient";
import { MegaTvIcon } from "@/features/web/icons/MegaTvIcon";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

/** Debounce before we consider the hover "stable" and start pre-buffering. */
const HOVER_STABLE_MS = 650;
/** Delay between pre-buffer (armed) and revealing the video over the backdrop. */
const HERO_REVEAL_DELAY_MS = 1200;
/** Inactivity before chrome (rails/topbar/metadata gradients) hides in playback. */
const CHROME_HIDE_MS = 5000;
/** Trending auto-advance interval when idle (paused on hover / during playback). */
const ROTATE_MS = 9000;

type Phase = "idle" | "armed" | "playing";

/**
 * Immersive hero (P2): trending loop of movies + series that auto-advances with
 * a crossfade and mirrors the Android home hero trailer contract:
 *  - rotate through `items` every ~9s (paused while hovered or playing)
 *  - pre-buffer the trailer on *stable* hover/focus (debounced) for the CURRENT
 *    item only — trailer + logo are fetched lazily per shown slide (Free Tier:
 *    no upfront fan-out), the first item is seeded from the server.
 *  - reveal the video after `HERO_REVEAL_DELAY_MS`, hide chrome after inactivity
 *  - show the TMDB title logo instead of the H1 text when available
 */
export function WebHero({
  items,
  initialTrailerKey = null,
  initialLogo = null
}: {
  items: WebMediaItem[];
  initialTrailerKey?: string | null;
  initialLogo?: string | null;
}) {
  const { withProfile, activeProfileId } = useWebProfile();
  const { prefs, update } = useWebPrefs(activeProfileId);

  const slides = items.filter((item) => item.backdropUrl || item.posterUrl);
  const [index, setIndex] = useState(0);
  const safeIndex = slides.length ? index % slides.length : 0;
  const item = slides[safeIndex];

  const [phase, setPhase] = useState<Phase>("idle");
  const [chromeHidden, setChromeHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(initialTrailerKey);
  const [logo, setLogo] = useState<string | null>(initialLogo);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chromeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed the shared client caches with the server-fetched first item (no refetch).
  useEffect(() => {
    if (slides[0]) {
      seedTrailerKey(slides[0].mediaId, initialTrailerKey);
      seedTitleLogo(slides[0].mediaId, initialLogo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearTimers = useCallback(() => {
    for (const ref of [hoverTimer, revealTimer, chromeTimer]) {
      if (ref.current) clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);

  // Switch slides: reset per-slide playback state (done in the handler, not in an
  // effect, so we don't trigger cascading renders on mount).
  const goTo = useCallback(
    (next: number) => {
      clearTimers();
      setPhase("idle");
      setChromeHidden(false);
      setLogo(null);
      setTrailerKey(null);
      setIndex(next);
    },
    [clearTimers]
  );

  // Resolve logo + trailer lazily for whichever slide is currently displayed.
  // (setState only inside async callbacks — allowed.)
  useEffect(() => {
    if (!item) return;
    let alive = true;
    fetchTitleLogo(item.mediaId).then((value) => alive && setLogo(value));
    fetchTrailerKey(item.mediaId).then((value) => alive && setTrailerKey(value));
    return () => {
      alive = false;
    };
  }, [item]);

  // Auto-advance the trending loop when idle.
  useEffect(() => {
    if (slides.length <= 1 || hovered || phase !== "idle") return;
    const timer = setTimeout(() => goTo((safeIndex + 1) % slides.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [slides.length, hovered, phase, safeIndex, goTo]);

  const canPlay = Boolean(trailerKey) && prefs.trailerAutoplay;

  const post = useCallback((func: "mute" | "unMute") => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  }, []);

  const arm = useCallback(() => {
    setHovered(true);
    if (!canPlay || phase !== "idle") return;
    hoverTimer.current = setTimeout(() => {
      setPhase("armed");
      revealTimer.current = setTimeout(() => setPhase("playing"), HERO_REVEAL_DELAY_MS);
    }, HOVER_STABLE_MS);
  }, [canPlay, phase]);

  const stop = useCallback(() => {
    setHovered(false);
    clearTimers();
    setPhase("idle");
    setChromeHidden(false);
  }, [clearTimers]);

  const bumpActivity = useCallback(() => {
    if (phase !== "playing") return;
    setChromeHidden(false);
    if (chromeTimer.current) clearTimeout(chromeTimer.current);
    chromeTimer.current = setTimeout(() => setChromeHidden(true), CHROME_HIDE_MS);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    post(prefs.trailerSound ? "unMute" : "mute");
    chromeTimer.current = setTimeout(() => setChromeHidden(true), CHROME_HIDE_MS);
    return () => {
      if (chromeTimer.current) clearTimeout(chromeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "playing") post(prefs.trailerSound ? "unMute" : "mute");
  }, [prefs.trailerSound, phase, post]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!item) return null;

  const backdrop = item.backdropUrl || item.posterUrl;
  const toggleSound = () => update({ trailerSound: !prefs.trailerSound });
  const showVideo = phase === "playing" || phase === "armed";

  return (
    <section
      className="mega-poster-radius relative overflow-hidden border border-[var(--mega-border)]"
      onMouseEnter={arm}
      onMouseLeave={stop}
      onFocus={arm}
      onBlur={stop}
      onMouseMove={bumpActivity}
      onKeyDown={bumpActivity}
      tabIndex={-1}
    >
      <div className="mega-hero-shell relative w-full overflow-hidden">
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.mediaId} src={backdrop} alt={item.title} className="web-fade-in h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[var(--mega-surface)]" />
        )}

        {showVideo && trailerKey ? (
          <div
            className={clsx(
              "absolute inset-0 transition-opacity duration-700",
              phase === "playing" ? "opacity-100" : "opacity-0"
            )}
          >
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

        <div
          className={clsx(
            "absolute inset-0 transition-opacity duration-500",
            chromeHidden ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,10,0.92)_0%,rgba(6,7,10,0.55)_45%,rgba(6,7,10,0.1)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,10,0.9)_0%,transparent_55%)]" />
        </div>
      </div>

      <div
        className={clsx(
          "absolute inset-0 flex flex-col justify-end gap-2 p-4 transition-opacity duration-500 sm:max-w-lg sm:gap-3 sm:p-5",
          chromeHidden ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`logo-${item.mediaId}`}
            src={logo}
            alt={item.title}
            className="web-logo-in max-h-14 max-w-[65%] object-contain object-left drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] sm:max-h-[4.5rem]"
          />
        ) : (
          <h1 className="text-xl font-black leading-tight text-[var(--mega-text)] drop-shadow sm:text-2xl">{item.title}</h1>
        )}
        {item.overview ? (
          <p className="line-clamp-2 text-xs text-[var(--mega-text-muted)] sm:text-sm">{item.overview}</p>
        ) : null}
        <div className="flex items-center gap-2.5">
          <Link
            href={withProfile(`/web/player/${item.mediaId}`)}
            className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-full bg-[var(--mega-text)] px-5 py-2 text-sm font-bold text-[var(--mega-background-deep)] transition hover:-translate-y-0.5"
          >
            <MegaTvIcon name="play" filled className="h-4 w-4" /> Lire
          </Link>
          <Link
            href={withProfile(`/web/details/${item.mediaId}`)}
            className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-shell-nav)] px-4 py-2 text-sm font-semibold text-[var(--mega-text)] backdrop-blur transition hover:bg-[var(--mega-card-bg)]"
          >
            <MegaTvIcon name="info" className="h-4 w-4" /> Détails
          </Link>
        </div>
      </div>

      {slides.length > 1 ? (
        <div
          className={clsx(
            "absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 transition-opacity duration-500 sm:left-auto sm:right-20 sm:translate-x-0",
            chromeHidden ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          {slides.map((slide, i) => (
            <button
              key={slide.mediaId}
              type="button"
              aria-label={`Aller à ${slide.title}`}
              onClick={() => goTo(i)}
              className={clsx(
                "h-1.5 rounded-full transition-all",
                i === safeIndex ? "w-6 bg-[var(--mega-text)]" : "w-1.5 bg-[var(--mega-border-strong)] hover:bg-[var(--mega-text-muted)]"
              )}
            />
          ))}
        </div>
      ) : null}

      {phase === "playing" && trailerKey ? (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={prefs.trailerSound ? "Couper le son" : "Activer le son"}
          className="focus-ring absolute bottom-5 right-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-shell-nav)] text-[var(--mega-text)] backdrop-blur transition hover:bg-[var(--mega-card-bg)]"
        >
          {prefs.trailerSound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      ) : null}
    </section>
  );
}
