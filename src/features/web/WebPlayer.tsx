"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ArrowLeft, Loader2, Maximize, Minimize, Pause, Play, Subtitles, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { ResolvedStream } from "@/lib/web/stream-resolver";
import type { WebMediaType } from "@/lib/web/media";

export type PlayerSubtitle = {
  id: string;
  label: string;
  lang: string;
  /** Ready-to-use (already proxied/converted) VTT URL. */
  src: string;
};

export type PlayerTrackMeta = {
  profileId: string;
  mediaType: WebMediaType;
  tmdbId: number;
  season?: number | null;
  episode?: number | null;
  imdbId?: string | null;
  title?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
};

type Props = {
  stream: ResolvedStream;
  title: string;
  backHref: string;
  /** localStorage key for minimal resume (profile-scoped by caller). */
  resumeKey: string;
  subtitles?: PlayerSubtitle[];
  /** Enables Continue Watching cloud write + Trakt scrobble when present. */
  track?: PlayerTrackMeta | null;
  /** Optional overlay control (e.g. a "Sources" button) rendered top-right. */
  topRightSlot?: ReactNode;
};

const CLOUD_SAVE_INTERVAL_MS = 20000;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function WebPlayer({ stream, title, backHref, resumeKey, subtitles = [], track, topRightSlot }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [usingProxy, setUsingProxy] = useState(false);

  // Effective source URL: falls back to the signed Edge proxy on CORS failure.
  const sourceUrl = usingProxy && stream.proxiedUrl ? stream.proxiedUrl : stream.url;

  // Attach source: native HLS (Safari) or hls.js. Retries once via proxy on a
  // fatal error when a proxied URL is available.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;
    setReady(false);
    setError(null);

    const failToProxy = (message: string) => {
      if (!usingProxy && stream.proxiedUrl) {
        setUsingProxy(true);
        return;
      }
      setError(message);
    };

    async function attach() {
      if (!video) return;
      const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
      if (stream.type === "mp4" || canNativeHls) {
        video.src = sourceUrl;
        setReady(true);
        return;
      }
      try {
        const mod = await import("hls.js");
        const Hls = mod.default;
        if (destroyed) return;
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => setReady(true));
          hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal?: boolean }) => {
            if (data?.fatal) failToProxy("Lecture impossible (flux indisponible ou bloqué).");
          });
        } else {
          video.src = sourceUrl;
          setReady(true);
        }
      } catch {
        setError("Moteur de lecture indisponible.");
      }
    }

    attach();
    return () => {
      destroyed = true;
      if (hls) hls.destroy();
    };
  }, [sourceUrl, stream.type, stream.proxiedUrl, usingProxy]);

  // Restore resume position once metadata is known.
  const restoredRef = useRef(false);
  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const saved = Number(window.localStorage.getItem(resumeKey) || 0);
      if (saved > 5 && (!video.duration || saved < video.duration - 10)) video.currentTime = saved;
    } catch {
      /* ignore */
    }
  }, [resumeKey]);

  // ---- Continue Watching (cloud) + Trakt scrobble, batched/coalesced ----
  const lastCloudSaveRef = useRef(0);
  const scrobbledStartRef = useRef(false);

  const buildTrackBody = useCallback(() => {
    const video = videoRef.current;
    if (!track || !video) return null;
    const dur = video.duration || 0;
    const progress = dur > 0 ? Math.min(1, video.currentTime / dur) : 0;
    return {
      profile: track.profileId,
      mediaType: track.mediaType,
      tmdbId: track.tmdbId,
      season: track.season ?? null,
      episode: track.episode ?? null,
      progress,
      progressSeconds: Math.floor(video.currentTime),
      totalDurationSeconds: Math.floor(dur),
      title: track.title ?? null,
      posterPath: track.posterPath ?? null,
      backdropPath: track.backdropPath ?? null
    };
  }, [track]);

  const saveProgressToCloud = useCallback(
    (keepalive = false) => {
      const body = buildTrackBody();
      if (!body || body.progressSeconds < 5) return;
      try {
        void fetch("/api/web/continue-watching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive
        });
      } catch {
        /* non-fatal: local resume stays authoritative */
      }
    },
    [buildTrackBody]
  );

  const sendScrobble = useCallback(
    (action: "start" | "pause" | "stop" | "watched", keepalive = false) => {
      const video = videoRef.current;
      if (!track || !video) return;
      const dur = video.duration || 0;
      const progress = dur > 0 ? Math.min(100, (video.currentTime / dur) * 100) : 0;
      try {
        void fetch("/api/web/trakt/scrobble", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: track.profileId,
            action,
            mediaType: track.mediaType,
            tmdbId: track.tmdbId,
            imdbId: track.imdbId ?? null,
            season: track.season ?? null,
            episode: track.episode ?? null,
            progress
          }),
          keepalive
        });
      } catch {
        /* graceful degrade */
      }
    },
    [track]
  );

  // Persist resume (localStorage every tick; cloud throttled).
  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrent(video.currentTime);
    try {
      window.localStorage.setItem(resumeKey, String(Math.floor(video.currentTime)));
    } catch {
      /* ignore */
    }
    const now = Date.now();
    if (now - lastCloudSaveRef.current >= CLOUD_SAVE_INTERVAL_MS) {
      lastCloudSaveRef.current = now;
      saveProgressToCloud();
    }
  }, [resumeKey, saveProgressToCloud]);

  // Flush on unmount / tab hide (keepalive).
  useEffect(() => {
    const flush = () => {
      saveProgressToCloud(true);
      if (scrobbledStartRef.current) sendScrobble("stop", true);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [saveProgressToCloud, sendScrobble]);

  // ---- Subtitle track activation ----
  const applySubtitle = useCallback((id: string | null) => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      const t = tracks[i];
      t.mode = id && t.id === id ? "showing" : "hidden";
    }
    setActiveSub(id);
    setSubMenuOpen(false);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setError("Lecture bloquée par le navigateur."));
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else shell.requestFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2800);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (event.key) {
        case " ":
        case "k":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
          break;
        case "ArrowLeft":
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        default:
          return;
      }
      revealControls();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleFullscreen, toggleMute, revealControls]);

  const hasSubs = subtitles.length > 0;
  const subLabel = useMemo(
    () => subtitles.find((s) => s.id === activeSub)?.label ?? "Désactivés",
    [subtitles, activeSub]
  );

  return (
    <div
      ref={shellRef}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black"
      onMouseMove={revealControls}
      onClick={revealControls}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        crossOrigin="anonymous"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          scrobbledStartRef.current = true;
          sendScrobble("start");
        }}
        onPause={() => {
          setPlaying(false);
          sendScrobble("pause");
          saveProgressToCloud();
        }}
        onEnded={() => {
          sendScrobble("stop");
          sendScrobble("watched");
          saveProgressToCloud(true);
        }}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onVolumeChange={() => {
          const video = videoRef.current;
          if (video) {
            setMuted(video.muted);
            setVolume(video.volume);
          }
        }}
      >
        {subtitles.map((sub) => (
          <track key={sub.id} id={sub.id} kind="subtitles" src={sub.src} label={sub.label} srcLang={sub.lang} />
        ))}
      </video>

      {!ready && !error ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-white">{error}</p>
            <Link href={backHref} className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
          </div>
        </div>
      ) : null}

      {/* Controls overlay */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-300",
          controlsVisible || !playing ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="pointer-events-auto flex items-center gap-3 bg-[linear-gradient(180deg,rgba(0,0,0,0.6),transparent)] p-4">
          <Link href={backHref} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="truncate text-[11px] text-white/50">
              {stream.label}
              {usingProxy ? " · via proxy" : ""}
            </p>
          </div>
          {topRightSlot ? <div className="ml-auto">{topRightSlot}</div> : null}
        </div>

        <div className="pointer-events-auto flex flex-col gap-2 bg-[linear-gradient(0deg,rgba(0,0,0,0.7),transparent)] px-4 pb-4 pt-10">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(event) => {
              const video = videoRef.current;
              if (video) video.currentTime = Number(event.target.value);
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-[var(--mega-red)]"
            aria-label="Progression"
          />
          <div className="flex items-center gap-3 text-white">
            <button type="button" onClick={togglePlay} className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label={playing ? "Pause" : "Lire"}>
              {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
            </button>
            <button type="button" onClick={toggleMute} className="focus-ring grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10" aria-label={muted ? "Activer le son" : "Couper le son"}>
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                const video = videoRef.current;
                if (!video) return;
                const next = Number(event.target.value);
                video.volume = next;
                video.muted = next === 0;
              }}
              className="hidden h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-white/25 accent-white sm:block"
              aria-label="Volume"
            />
            <span className="ml-1 text-xs tabular-nums text-white/80">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {hasSubs ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSubMenuOpen((v) => !v)}
                    className="focus-ring grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10"
                    aria-label="Sous-titres"
                    title={`Sous-titres : ${subLabel}`}
                  >
                    <Subtitles className={clsx("h-5 w-5", activeSub ? "text-[var(--mega-red)]" : "")} />
                  </button>
                  {subMenuOpen ? (
                    <div className="absolute bottom-12 right-0 min-w-[180px] rounded-xl border border-white/10 bg-black/90 p-1.5 backdrop-blur">
                      <button
                        type="button"
                        onClick={() => applySubtitle(null)}
                        className={clsx(
                          "block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/10",
                          !activeSub ? "text-[var(--mega-red)]" : "text-white/80"
                        )}
                      >
                        Désactivés
                      </button>
                      {subtitles.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => applySubtitle(sub.id)}
                          className={clsx(
                            "block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/10",
                            activeSub === sub.id ? "text-[var(--mega-red)]" : "text-white/80"
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <button type="button" onClick={toggleFullscreen} className="focus-ring grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10" aria-label="Plein écran">
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
