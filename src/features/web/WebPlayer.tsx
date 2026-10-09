"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { ResolvedStream } from "@/lib/web/stream-resolver";
import { encodeMediaId, type WebMediaType } from "@/lib/web/media";
import { withProfileQuery } from "@/lib/companion/profile-scope";

import {
  PlayerGlassHud,
  type AspectRatioMode,
  type AudioTrackOption,
  type SubtitleSize,
  formatTime
} from "./player/PlayerGlassHud";
import { PlayerAmbilight } from "./player/PlayerAmbilight";
import { DoubleTapRipple } from "./player/DoubleTapRipple";
import { SkipIntroButton } from "./player/SkipIntroButton";
import { NextEpisodeBanner } from "./player/NextEpisodeBanner";
import { StreamInfoOverlay, type StreamTechnicalInfo } from "./player/StreamInfoOverlay";

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
  /** Called after direct + proxy both fail — parent can try the next source. */
  onPlaybackFailed?: () => void;
  logoUrl?: string | null;
  onNextEpisode?: () => void;
};

const CLOUD_SAVE_INTERVAL_MS = 20000;
const AMBILIGHT_STORAGE_KEY = "megatv_web_ambilight";

export function WebPlayer({
  stream,
  title,
  backHref,
  resumeKey,
  subtitles = [],
  track,
  topRightSlot,
  onPlaybackFailed,
  onNextEpisode
}: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failedNotified = useRef(false);
  const triedModes = useRef<Set<"direct" | "proxy">>(new Set());
  /** Ignores spurious `<video>` errors from clear/load before a real URL is attached. */
  const attachGeneration = useRef(0);
  const mediaAttached = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Sous-titres
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [subOffset, setSubOffset] = useState(0);
  const [subSize, setSubSize] = useState<SubtitleSize>("medium");

  // Audio tracks
  const [audioTracks, setAudioTracks] = useState<AudioTrackOption[]>([]);
  const [activeAudioTrack, setActiveAudioTrack] = useState<string | number | null>(0);

  // Vitesse de lecture
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("contain");

  // Ambilight
  const [ambilightEnabled, setAmbilightEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = window.localStorage.getItem(AMBILIGHT_STORAGE_KEY);
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  // Overlays additionnels
  const [streamInfoOpen, setStreamInfoOpen] = useState(false);
  const [skipIntroDismissed, setSkipIntroDismissed] = useState(false);
  const [nextEpisodeDismissed, setNextEpisodeDismissed] = useState(false);

  // Debrid CDNs usually block browser CORS on the direct URL — start proxied.
  const preferProxyFirst = Boolean(
    stream.proxiedUrl && /alldebrid|real-debrid|premiumize|torbox|debrid/i.test(stream.url)
  );
  const [sourceMode, setSourceMode] = useState<"direct" | "proxy">(preferProxyFirst ? "proxy" : "direct");
  const [needsGesture, setNeedsGesture] = useState(false);

  const sourceUrl =
    sourceMode === "proxy" && stream.proxiedUrl ? stream.proxiedUrl : stream.url;

  const notifyFailed = useCallback(
    (message: string) => {
      if (!failedNotified.current && onPlaybackFailed) {
        failedNotified.current = true;
        onPlaybackFailed();
        return;
      }
      setError(message);
    },
    [onPlaybackFailed]
  );

  const switchPlaybackMode = useCallback(
    (message: string) => {
      triedModes.current.add(sourceMode);
      const alt: "direct" | "proxy" = sourceMode === "direct" ? "proxy" : "direct";
      const canProxy = Boolean(stream.proxiedUrl && stream.url !== stream.proxiedUrl);
      if (alt === "proxy" && canProxy && !triedModes.current.has("proxy")) {
        setSourceMode("proxy");
        return;
      }
      if (alt === "direct" && !triedModes.current.has("direct")) {
        setSourceMode("direct");
        return;
      }
      notifyFailed(message);
    },
    [sourceMode, stream.proxiedUrl, stream.url, notifyFailed]
  );

  const handleMediaError = useCallback(() => {
    if (!mediaAttached.current) return;
    const video = videoRef.current;
    if (!video?.currentSrc && !video?.src) return;
    switchPlaybackMode(
      "Impossible de lire ce flux dans le navigateur (format ou CDN incompatible). Essayez une autre source."
    );
  }, [switchPlaybackMode]);

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(backHref);
  }, [router, backHref]);

  // Attach source: native HLS (Safari) or hls.js. Retries direct URL if proxy fails.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let destroyed = false;
    const generation = ++attachGeneration.current;
    mediaAttached.current = false;
    setReady(false);
    setError(null);
    failedNotified.current = false;
    setAudioTracks([]);
    setActiveAudioTrack(null);
    if (!triedModes.current.size) triedModes.current.add(sourceMode);

    const failToProxy = (message: string) => {
      if (attachGeneration.current !== generation) return;
      switchPlaybackMode(message);
    };

    async function attach() {
      if (!video) return;
      const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
      if (stream.type === "mp4" || canNativeHls) {
        video.pause();
        video.src = sourceUrl;
        mediaAttached.current = true;
        setReady(true);
        return;
      }
      try {
        const mod = await import("hls.js");
        const Hls = mod.default;
        if (destroyed || attachGeneration.current !== generation) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, maxBufferLength: 30 });
          hlsRef.current = hls;
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          mediaAttached.current = true;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (attachGeneration.current === generation) {
              setReady(true);
              // Récupérer les pistes audio HLS
              if (hls.audioTracks && hls.audioTracks.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const tracks: AudioTrackOption[] = hls.audioTracks.map((t: any, idx: number) => ({
                  id: idx,
                  label: t.name || t.lang || `Piste ${idx + 1}`,
                  lang: t.lang
                }));
                setAudioTracks(tracks);
                setActiveAudioTrack(hls.audioTrack);
              }
            }
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_event: any, data: { audioTracks: any[] }) => {
            if (data?.audioTracks?.length) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tracks: AudioTrackOption[] = data.audioTracks.map((t: any, idx: number) => ({
                id: idx,
                label: t.name || t.lang || `Piste ${idx + 1}`,
                lang: t.lang
              }));
              setAudioTracks(tracks);
              setActiveAudioTrack(hls.audioTrack);
            }
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_event: any, data: { id: number }) => {
            setActiveAudioTrack(data.id);
          });

          hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal?: boolean }) => {
            if (data?.fatal) failToProxy("Lecture impossible (flux indisponible ou bloqué).");
          });
        } else {
          video.src = sourceUrl;
          mediaAttached.current = true;
          setReady(true);
        }
      } catch {
        notifyFailed("Moteur de lecture indisponible.");
      }
    }

    attach();
    return () => {
      destroyed = true;
      mediaAttached.current = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sourceUrl, stream.type, stream.proxiedUrl, stream.url, sourceMode, notifyFailed, switchPlaybackMode]);

  useEffect(() => {
    if (!ready) return;
    const video = videoRef.current;
    if (!video) return;
    setNeedsGesture(false);
    void video.play().catch(() => setNeedsGesture(true));
  }, [ready, sourceUrl]);

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

  // Persist resume & mise à jour tampon
  const updateBuffered = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.buffered.length) return;
    const cur = video.currentTime;
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= cur && cur <= video.buffered.end(i)) {
        setBufferedEnd(video.buffered.end(i));
        return;
      }
    }
    setBufferedEnd(video.buffered.end(video.buffered.length - 1));
  }, []);

  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrent(video.currentTime);
    updateBuffered();
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
  }, [resumeKey, saveProgressToCloud, updateBuffered]);

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

  // ---- Subtitle track activation & Offset ----
  const applySubtitle = useCallback((id: string | null) => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      const t = tracks[i];
      t.mode = id && t.id === id ? "showing" : "hidden";
    }
    setActiveSub(id);
  }, []);

  const adjustSubtitleOffset = useCallback((deltaSeconds: number) => {
    setSubOffset((prev) => {
      const next = Math.round((prev + deltaSeconds) * 10) / 10;
      const video = videoRef.current;
      if (video) {
        for (let i = 0; i < video.textTracks.length; i++) {
          const t = video.textTracks[i];
          if (t.cues) {
            for (let j = 0; j < t.cues.length; j++) {
              const cue = t.cues[j] as VTTCue;
              cue.startTime += deltaSeconds;
              cue.endTime += deltaSeconds;
            }
          }
        }
      }
      return next;
    });
  }, []);

  const resetSubtitleOffset = useCallback(() => {
    adjustSubtitleOffset(-subOffset);
  }, [adjustSubtitleOffset, subOffset]);

  // ---- Audio Track Switcher ----
  const selectAudioTrack = useCallback((id: string | number) => {
    const idx = Number(id);
    if (hlsRef.current && Number.isFinite(idx)) {
      hlsRef.current.audioTrack = idx;
      setActiveAudioTrack(idx);
    }
  }, []);

  // ---- Playback Speed ----
  const changePlaybackSpeed = useCallback((spd: number) => {
    setPlaybackSpeed(spd);
    if (videoRef.current) {
      videoRef.current.playbackRate = spd;
    }
  }, []);

  // ---- Controls / Seeking ----
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play()
        .then(() => {
          setNeedsGesture(false);
          setError(null);
        })
        .catch(() => setNeedsGesture(true));
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const changeVolume = useCallback((val: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, val));
    video.volume = clamped;
    video.muted = clamped === 0;
    setVolume(clamped);
    setMuted(clamped === 0);
  }, []);

  const seekAbsolute = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || Infinity, seconds));
  }, []);

  const seekRelative = useCallback((deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || Infinity, video.currentTime + deltaSeconds));
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
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3200);
  }, []);

  // Ambilight toggle avec sauvegarde locale
  const toggleAmbilight = useCallback(() => {
    setAmbilightEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(AMBILIGHT_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Passer l'intro (avance de 85 secondes)
  const handleSkipIntro = useCallback(() => {
    seekRelative(85);
    setSkipIntroDismissed(true);
  }, [seekRelative]);

  // Navigation Épisode Suivant
  const handlePlayNextEpisode = useCallback(() => {
    if (onNextEpisode) {
      onNextEpisode();
      return;
    }
    if (
      track?.mediaType === "tv" &&
      typeof track.season === "number" &&
      typeof track.episode === "number" &&
      track.profileId
    ) {
      const nextMediaId = encodeMediaId("tv", track.tmdbId, track.season, track.episode + 1);
      const nextHref = withProfileQuery(`/web/player/${nextMediaId}`, track.profileId);
      router.push(nextHref);
    }
  }, [onNextEpisode, track, router]);

  // Raccourcis clavier cinéma avancés
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Ignorer si l'utilisateur tape dans un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      const video = videoRef.current;
      if (!video) return;

      switch (event.key) {
        case " ":
        case "k":
        case "K":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          event.preventDefault();
          seekRelative(10);
          break;
        case "ArrowLeft":
          event.preventDefault();
          seekRelative(-10);
          break;
        case "ArrowUp":
          event.preventDefault();
          changeVolume(video.volume + 0.05);
          break;
        case "ArrowDown":
          event.preventDefault();
          changeVolume(video.volume - 0.05);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "s":
        case "S":
          // Passer l'intro
          event.preventDefault();
          handleSkipIntro();
          break;
        case "i":
        case "I":
          // Infos techniques
          event.preventDefault();
          setStreamInfoOpen((v) => !v);
          break;
        case "c":
        case "C":
          // Toggle premier sous-titre disponible
          event.preventDefault();
          if (subtitles.length > 0) {
            applySubtitle(activeSub ? null : subtitles[0].id);
          }
          break;
        case "d":
        case "D":
          // Décalage sous-titres : D = +100ms, Shift+D = -100ms
          event.preventDefault();
          adjustSubtitleOffset(event.shiftKey ? -0.1 : 0.1);
          break;
        default:
          return;
      }
      revealControls();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    togglePlay,
    seekRelative,
    changeVolume,
    toggleFullscreen,
    toggleMute,
    handleSkipIntro,
    subtitles,
    activeSub,
    applySubtitle,
    adjustSubtitleOffset,
    revealControls
  ]);

  // Détection Skip Intro
  // Apparaît de 45s à 135s (2:15) pour les séries TV
  const isSeries = track?.mediaType === "tv" || Boolean(track?.season && track?.episode);
  const showSkipIntro =
    isSeries &&
    !skipIntroDismissed &&
    current >= 45 &&
    current <= 135 &&
    duration > 180;

  // Détection Épisode Suivant
  // Apparaît dans les 30 dernières secondes d'un épisode (ou sur Ended) si season & episode connus
  const hasNextEpisode =
    Boolean(onNextEpisode) ||
    (track?.mediaType === "tv" && typeof track?.season === "number" && typeof track?.episode === "number");
  const showNextEpisode =
    hasNextEpisode &&
    !nextEpisodeDismissed &&
    duration > 60 &&
    (current >= duration - 30 || videoRef.current?.ended === true);

  // Aspect Ratio Video Class
  const videoAspectClass = useMemo(() => {
    switch (aspectRatio) {
      case "cover":
        return "h-full w-full object-cover";
      case "16-9":
        return "w-full max-h-full aspect-video object-contain";
      case "21-9":
        return "w-full max-h-full aspect-[21/9] object-cover";
      case "contain":
      default:
        return "h-full w-full object-contain";
    }
  }, [aspectRatio]);

  // Métadonnées techniques pour l'overlay (StreamInfoOverlay)
  const technicalInfo: StreamTechnicalInfo = useMemo(() => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    let bitrateLabel: string | null = null;
    if (hls?.levels && hls?.currentLevel >= 0) {
      const lvl = hls.levels[hls.currentLevel];
      if (lvl?.bitrate) {
        bitrateLabel = `${(lvl.bitrate / 1_000_000).toFixed(2)} Mbps`;
      }
    }
    const activeSubObj = subtitles.find((s) => s.id === activeSub);
    const activeAudioObj = audioTracks.find((a) => String(a.id) === String(activeAudioTrack));

    return {
      title,
      streamLabel: stream.label,
      sourceMode,
      streamType: stream.type,
      sourceUrl,
      videoWidth: video?.videoWidth || 0,
      videoHeight: video?.videoHeight || 0,
      bufferedSeconds: Math.max(0, bufferedEnd - current),
      currentBitrate: bitrateLabel,
      audioTrackLabel: activeAudioObj?.label || (audioTracks.length > 0 ? audioTracks[0].label : "Stéréo natif"),
      subtitleLabel: activeSubObj?.label || (activeSub ? "Actif" : "Désactivés"),
      subtitleOffset: subOffset,
      engine: hls ? "hls.js" : "native",
      playbackRate: playbackSpeed,
      aspectRatio
    };
  }, [
    title,
    stream.label,
    stream.type,
    sourceMode,
    sourceUrl,
    bufferedEnd,
    current,
    subtitles,
    activeSub,
    audioTracks,
    activeAudioTrack,
    subOffset,
    playbackSpeed,
    aspectRatio
  ]);

  return (
    <div
      ref={shellRef}
      className="player-video-container relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black select-none"
      onMouseMove={revealControls}
      onClick={revealControls}
    >
      {/* Style dynamique pour la personnalisation des sous-titres (taille) */}
      <style>{`
        .player-video-container video::cue {
          font-size: ${subSize === "small" ? "15px" : subSize === "large" ? "26px" : "19px"} !important;
          background-color: rgba(0, 0, 0, 0.8) !important;
          color: #ffffff !important;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9) !important;
          line-height: 1.4 !important;
          border-radius: 4px !important;
          padding: 2px 8px !important;
        }
      `}</style>

      {/* Mode Ambilight (Éclairage Ambiant Cinéma) */}
      <PlayerAmbilight
        videoRef={videoRef}
        enabled={ambilightEnabled}
        backdropUrl={track?.backdropPath ? `https://image.tmdb.org/t/p/w780${track.backdropPath}` : null}
      />

      {/* Élément Vidéo HTML5 Principal */}
      <video
        ref={videoRef}
        className={clsx("relative z-10 transition-all duration-300", videoAspectClass)}
        playsInline
        {...(subtitles.length > 0 ? { crossOrigin: "anonymous" as const } : {})}
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
          // Si épisode suivant disponible, l'afficher
          if (hasNextEpisode) {
            setNextEpisodeDismissed(false);
          }
        }}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onProgress={updateBuffered}
        onError={handleMediaError}
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

      {/* Gestes tactiles : Double-Tap ±10s avec ondes Ripple */}
      <DoubleTapRipple
        onSeekRelative={seekRelative}
        onSingleTap={() => {
          togglePlay();
          revealControls();
        }}
        disabled={!ready || Boolean(error)}
      />

      {/* Spinner de chargement */}
      {!ready && !error ? (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--mega-red)] drop-shadow-[0_0_12px_rgba(229,57,53,0.8)]" />
        </div>
      ) : null}

      {/* Fallback geste utilisateur pour autoplay bloqué */}
      {needsGesture && !error ? (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/40">
          <button
            type="button"
            onClick={togglePlay}
            className="focus-ring pointer-events-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 text-white backdrop-blur-xl border border-white/20 shadow-2xl transition hover:scale-105 hover:bg-white/30 active:scale-95"
            aria-label="Lire"
          >
            <Play className="h-10 w-10 fill-current translate-x-0.5" />
          </button>
        </div>
      ) : null}

      {/* Message d'erreur avec bouton retour */}
      {error ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/80 p-6 text-center backdrop-blur-md">
          <div className="max-w-md space-y-4 rounded-3xl border border-white/15 bg-[#14181f]/90 p-8 shadow-2xl backdrop-blur-2xl">
            <p className="text-lg font-bold text-white">{error}</p>
            <p className="text-xs text-white/50">
              Le format de ce flux n'a pas pu être décodé par le navigateur ou la source a rejeté la connexion.
            </p>
            <button
              type="button"
              onClick={goBack}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/25 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
          </div>
        </div>
      ) : null}

      {/* Bouton "Passer l'intro" (SkipIntroButton) */}
      <SkipIntroButton
        visible={showSkipIntro}
        onSkip={handleSkipIntro}
        onDismiss={() => setSkipIntroDismissed(true)}
      />

      {/* Bannière "Épisode Suivant" (NextEpisodeBanner) */}
      {showNextEpisode && track?.season && track?.episode ? (
        <NextEpisodeBanner
          season={track.season}
          episode={track.episode}
          onPlayNext={handlePlayNextEpisode}
          onDismiss={() => setNextEpisodeDismissed(true)}
        />
      ) : null}

      {/* Overlay Informations Techniques (StreamInfoOverlay - Touche I) */}
      <StreamInfoOverlay
        open={streamInfoOpen}
        onClose={() => setStreamInfoOpen(false)}
        info={technicalInfo}
      />

      {/* Refonte HUD Verre Givré (PlayerGlassHud) */}
      <PlayerGlassHud
        title={title}
        streamLabel={stream.label}
        sourceMode={sourceMode}
        playing={playing}
        muted={muted}
        volume={volume}
        current={current}
        duration={duration}
        bufferedEnd={bufferedEnd}
        fullscreen={fullscreen}
        visible={controlsVisible}
        topRightSlot={topRightSlot}
        // Sous-titres
        subtitles={subtitles}
        activeSub={activeSub}
        subOffset={subOffset}
        subSize={subSize}
        onSelectSubtitle={applySubtitle}
        onAdjustSubOffset={adjustSubtitleOffset}
        onResetSubOffset={resetSubtitleOffset}
        onChangeSubSize={setSubSize}
        // Audio
        audioTracks={audioTracks}
        activeAudioTrack={activeAudioTrack}
        onSelectAudioTrack={selectAudioTrack}
        // Vitesse
        playbackSpeed={playbackSpeed}
        onChangePlaybackSpeed={changePlaybackSpeed}
        // Ratio
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
        // Ambilight
        ambilightEnabled={ambilightEnabled}
        onToggleAmbilight={toggleAmbilight}
        // Actions
        onGoBack={goBack}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onChangeVolume={changeVolume}
        onSeek={seekAbsolute}
        onSeekRelative={seekRelative}
        onToggleFullscreen={toggleFullscreen}
        onOpenStreamInfo={() => setStreamInfoOpen(true)}
      />
    </div>
  );
}
