"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Info, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

/** Debounce before we consider the hover "stable" and start pre-buffering. */
const HOVER_STABLE_MS = 650;
/** Delay between pre-buffer (armed) and revealing the video over the backdrop. */
const HERO_REVEAL_DELAY_MS = 1200;
/** Inactivity before chrome (rails/topbar/metadata gradients) hides in playback. */
const CHROME_HIDE_MS = 5000;

type Phase = "idle" | "armed" | "playing";

/**
 * Immersive hero (P1): mirrors the Android home hero trailer contract
 * (see `page_accueil_et_hero` / `moteur_de_lecture_video`):
 *  - pre-buffer the trailer on *stable* hover/focus (debounced, not micro-moves)
 *  - reveal the video after `HERO_REVEAL_DELAY_MS`
 *  - hide chrome after ~5s of inactivity during playback, restore on move/key
 *  - sound driven by the persisted `trailerSound` preference
 */
export function WebHero({ item, trailerKey }: { item: WebMediaItem; trailerKey?: string | null }) {
  const { withProfile, activeProfileId } = useWebProfile();
  const { prefs, update } = useWebPrefs(activeProfileId);
  const backdrop = item.backdropUrl || item.posterUrl;

  const [phase, setPhase] = useState<Phase>("idle");
  const [chromeHidden, setChromeHidden] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chromeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canPlay = Boolean(trailerKey) && prefs.trailerAutoplay;

  const post = useCallback((func: "mute" | "unMute") => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  }, []);

  const clearTimers = useCallback(() => {
    for (const ref of [hoverTimer, revealTimer, chromeTimer]) {
      if (ref.current) clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setChromeHidden(false);
  }, [clearTimers]);

  const arm = useCallback(() => {
    if (!canPlay || phase !== "idle") return;
    hoverTimer.current = setTimeout(() => {
      setPhase("armed");
      revealTimer.current = setTimeout(() => setPhase("playing"), HERO_REVEAL_DELAY_MS);
    }, HOVER_STABLE_MS);
  }, [canPlay, phase]);

  // During playback: hide chrome after inactivity; restore on any activity.
  const bumpActivity = useCallback(() => {
    if (phase !== "playing") return;
    setChromeHidden(false);
    if (chromeTimer.current) clearTimeout(chromeTimer.current);
    chromeTimer.current = setTimeout(() => setChromeHidden(true), CHROME_HIDE_MS);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    // Apply persisted sound preference once the player is live, then arm the
    // inactivity timer that hides the chrome (setState only from the timer).
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

  const toggleSound = () => update({ trailerSound: !prefs.trailerSound });

  const showVideo = phase === "playing" || phase === "armed";

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-[var(--mega-border)]"
      onMouseEnter={arm}
      onMouseLeave={stop}
      onFocus={arm}
      onBlur={stop}
      onMouseMove={bumpActivity}
      onKeyDown={bumpActivity}
      tabIndex={-1}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt={item.title} className="h-full w-full object-cover" />
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
          "absolute inset-0 flex flex-col justify-end gap-4 p-5 transition-opacity duration-500 sm:max-w-xl sm:p-8",
          chromeHidden ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        <h1 className="text-2xl font-black leading-tight text-[var(--mega-text)] drop-shadow sm:text-4xl">{item.title}</h1>
        {item.overview ? (
          <p className="line-clamp-3 text-sm text-[var(--mega-text-muted)] sm:text-base">{item.overview}</p>
        ) : null}
        <div className="flex items-center gap-3">
          <Link
            href={withProfile(`/web/player/${item.mediaId}`)}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--mega-text)] px-6 py-2.5 text-sm font-bold text-[var(--mega-background-deep)] transition hover:-translate-y-0.5"
          >
            <Play className="h-4 w-4" fill="currentColor" /> Lire
          </Link>
          <Link
            href={withProfile(`/web/details/${item.mediaId}`)}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-shell-nav)] px-5 py-2.5 text-sm font-semibold text-[var(--mega-text)] backdrop-blur transition hover:bg-[var(--mega-card-bg)]"
          >
            <Info className="h-4 w-4" /> Détails
          </Link>
        </div>
      </div>

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
