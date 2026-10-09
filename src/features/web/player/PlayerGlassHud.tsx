"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import {
  ArrowLeft,
  Check,
  FastForward,
  Film,
  Gauge,
  Info,
  Maximize,
  Minimize,
  Moon,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Scan,
  SlidersHorizontal,
  Sparkles,
  Subtitles,
  Volume2,
  VolumeX,
  Volume1
} from "lucide-react";
import type { PlayerSubtitle } from "@/features/web/WebPlayer";

export type AspectRatioMode = "contain" | "cover" | "16-9" | "21-9";
export type SubtitleSize = "small" | "medium" | "large";

export type AudioTrackOption = {
  id: number | string;
  label: string;
  lang?: string;
};

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

type Props = {
  title: string;
  streamLabel: string;
  sourceMode: "direct" | "proxy";
  playing: boolean;
  muted: boolean;
  volume: number;
  current: number;
  duration: number;
  bufferedEnd: number;
  fullscreen: boolean;
  visible: boolean;
  topRightSlot?: React.ReactNode;
  // Subtitles
  subtitles: PlayerSubtitle[];
  activeSub: string | null;
  subOffset: number;
  subSize: SubtitleSize;
  onSelectSubtitle: (id: string | null) => void;
  onAdjustSubOffset: (deltaSeconds: number) => void;
  onResetSubOffset: () => void;
  onChangeSubSize: (size: SubtitleSize) => void;
  // Audio
  audioTracks: AudioTrackOption[];
  activeAudioTrack: string | number | null;
  onSelectAudioTrack: (id: string | number) => void;
  // Playback speed
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  // Aspect ratio
  aspectRatio: AspectRatioMode;
  onChangeAspectRatio: (mode: AspectRatioMode) => void;
  // Ambilight
  ambilightEnabled: boolean;
  onToggleAmbilight: () => void;
  // Actions
  onGoBack: () => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onChangeVolume: (volume: number) => void;
  onSeek: (seconds: number) => void;
  onSeekRelative: (seconds: number) => void;
  onToggleFullscreen: () => void;
  onOpenStreamInfo: () => void;
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const ASPECT_OPTIONS: { id: AspectRatioMode; label: string }[] = [
  { id: "contain", label: "Adapter (Contain)" },
  { id: "cover", label: "Remplir (Cover)" },
  { id: "16-9", label: "16:9 Standard" },
  { id: "21-9", label: "21:9 Cinéma" }
];

export function PlayerGlassHud({
  title,
  streamLabel,
  sourceMode,
  playing,
  muted,
  volume,
  current,
  duration,
  bufferedEnd,
  fullscreen,
  visible,
  topRightSlot,
  subtitles,
  activeSub,
  subOffset,
  subSize,
  onSelectSubtitle,
  onAdjustSubOffset,
  onResetSubOffset,
  onChangeSubSize,
  audioTracks,
  activeAudioTrack,
  onSelectAudioTrack,
  playbackSpeed,
  onChangePlaybackSpeed,
  aspectRatio,
  onChangeAspectRatio,
  ambilightEnabled,
  onToggleAmbilight,
  onGoBack,
  onTogglePlay,
  onToggleMute,
  onChangeVolume,
  onSeek,
  onSeekRelative,
  onToggleFullscreen,
  onOpenStreamInfo
}: Props) {
  // Mode horodatage : temps écoulé / durée totale OU temps écoulé / temps restant (-MM:SS)
  const [showRemainingTime, setShowRemainingTime] = useState(false);

  // Menus popover ouverts
  const [openMenu, setOpenMenu] = useState<"speed" | "subs" | "audio" | "aspect" | null>(null);

  // Scrubber hover state (infobulle)
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<{ xPercent: number; time: number } | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Fermer les menus lors d'un clic en dehors
  useEffect(() => {
    if (!openMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-player-popover]")) {
        setOpenMenu(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenu]);

  // Calcul du scrubber
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;
  const bufferPercent = duration > 0 ? Math.min(100, Math.max(0, (bufferedEnd / duration) * 100)) : 0;

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = (x / rect.width) * 100;
    const time = (x / rect.width) * duration;
    setHoverPosition({ xPercent: percent, time });

    if (isScrubbing) {
      onSeek(time);
    }
  };

  const handleScrubberMouseLeave = () => {
    if (!isScrubbing) setHoverPosition(null);
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    setIsScrubbing(true);
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const time = (x / rect.width) * duration;
    onSeek(time);

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!scrubberRef.current) return;
      const curRect = scrubberRef.current.getBoundingClientRect();
      const curX = Math.max(0, Math.min(curRect.width, moveEvent.clientX - curRect.left));
      const curPercent = (curX / curRect.width) * 100;
      const curTime = (curX / curRect.width) * duration;
      setHoverPosition({ xPercent: curPercent, time: curTime });
      onSeek(curTime);
    };

    const onGlobalMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };

    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);
  };

  const activeSubLabel = useMemo(
    () => subtitles.find((s) => s.id === activeSub)?.label ?? "Désactivés",
    [subtitles, activeSub]
  );

  const activeAudioLabel = useMemo(
    () => audioTracks.find((a) => String(a.id) === String(activeAudioTrack))?.label ?? "Piste par défaut",
    [audioTracks, activeAudioTrack]
  );

  const remainingSeconds = Math.max(0, duration - current);
  const timeDisplay = showRemainingTime
    ? `${formatTime(current)} / -${formatTime(remainingSeconds)}`
    : `${formatTime(current)} / ${formatTime(duration)}`;

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 transition-all duration-300 select-none",
        visible || !playing ? "opacity-100" : "opacity-0"
      )}
    >
      {/* ─── Top Bar Capsule Flottante ─── */}
      <div className="flex items-center justify-between gap-3">
        {/* Capsule gauche : Retour + Titre + Badges */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/15 bg-black/60 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={onGoBack}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            aria-label="Retour"
            title="Retour à la fiche"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 pr-2">
            <h1 className="max-w-[280px] sm:max-w-md truncate text-sm font-bold text-white tracking-wide">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-white/60">
              <span className="truncate max-w-[200px]">{streamLabel}</span>
              {sourceMode === "proxy" ? (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                  PROXY
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Capsule droite : Actions secondaires rapides */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-white/15 bg-black/60 px-2 py-1.5 sm:px-3 sm:py-2 shadow-2xl backdrop-blur-xl">
          {topRightSlot ? <div>{topRightSlot}</div> : null}

          {/* Toggle Ambilight */}
          <button
            type="button"
            onClick={onToggleAmbilight}
            className={clsx(
              "focus-ring relative flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/20",
              ambilightEnabled ? "text-amber-300 bg-amber-400/20" : "text-white/70 hover:text-white"
            )}
            title={ambilightEnabled ? "Désactiver l'éclairage Ambilight" : "Activer l'éclairage Ambilight"}
            aria-label="Ambilight"
          >
            <Sparkles className="h-4 w-4" />
            {ambilightEnabled ? (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            ) : null}
          </button>

          {/* Bouton Infos Techniques (I) */}
          <button
            type="button"
            onClick={onOpenStreamInfo}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition"
            title="Informations techniques du flux (Touche I)"
            aria-label="Informations techniques"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── Center Transport Touch / Quick Jump (Optionnel sur grand écran) ─── */}
      <div className="pointer-events-none flex items-center justify-center">
        {/* Bouton Play/Pause central lors des interactions tactiles ou en pause */}
        {!playing ? (
          <button
            type="button"
            onClick={onTogglePlay}
            className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:bg-white/20 active:scale-95 animate-in zoom-in-75 duration-200"
            aria-label="Lecture"
          >
            <Play className="h-10 w-10 fill-current translate-x-0.5 text-white" />
          </button>
        ) : null}
      </div>

      {/* ─── Bottom Bar Flottante Glassmorphism ─── */}
      <div className="pointer-events-auto flex flex-col gap-3 rounded-3xl border border-white/15 bg-black/65 p-3.5 sm:p-5 shadow-2xl backdrop-blur-2xl">
        {/* Scrubber / Barre de progression moderne */}
        <div
          ref={scrubberRef}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
          onMouseDown={handleScrubberMouseDown}
          className="group relative flex h-6 w-full cursor-pointer items-center"
          aria-label="Barre de défilement temporel"
        >
          {/* Tooltip minutage au survol */}
          {hoverPosition && (
            <div
              className="pointer-events-none absolute bottom-8 -translate-x-1/2 rounded-lg border border-white/20 bg-black/85 px-2.5 py-1 text-xs font-mono font-bold text-white shadow-xl backdrop-blur-xl transition-transform"
              style={{ left: `${hoverPosition.xPercent}%` }}
            >
              <span>{formatTime(hoverPosition.time)}</span>
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/85" />
            </div>
          )}

          {/* Rail d'arrière-plan */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20 transition-all duration-200 group-hover:h-3">
            {/* Jauge de tampon préchargé (Buffer) */}
            <div
              className="absolute left-0 top-0 h-full bg-white/35 transition-all duration-300"
              style={{ width: `${bufferPercent}%` }}
            />
            {/* Jauge de lecture active */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--mega-red)] to-red-400 shadow-[0_0_10px_rgba(229,57,53,0.7)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Curseur de progression (Thumb) */}
          <div
            className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-2 ring-[var(--mega-red)] transition-transform duration-150 group-hover:scale-125"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Ligne des contrôles principaux */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-white">
          {/* Bloc Gauche : Transport & Volume */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Lecture / Pause */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="focus-ring flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25 active:scale-95"
              aria-label={playing ? "Pause" : "Lire"}
            >
              {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}
            </button>

            {/* Recul 10s */}
            <button
              type="button"
              onClick={() => onSeekRelative(-10)}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95"
              title="Reculer de 10s (←)"
              aria-label="Reculer 10s"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Avance 10s */}
            <button
              type="button"
              onClick={() => onSeekRelative(10)}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95"
              title="Avancer de 10s (→)"
              aria-label="Avancer 10s"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Son & Slider Volume */}
            <div className="group/vol flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
                title={muted ? "Activer le son (M)" : "Couper le son (M)"}
                aria-label="Volume"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-white/60" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                className="hidden sm:block h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-[var(--mega-red)] transition-all group-hover/vol:w-24"
                aria-label="Niveau du volume"
              />
            </div>

            {/* Horodatage avec bascule temps écoulé / temps restant */}
            <button
              type="button"
              onClick={() => setShowRemainingTime((v) => !v)}
              className="focus-ring ml-1 rounded-lg px-2 py-1 text-xs font-mono font-medium text-white/80 hover:bg-white/10 transition"
              title="Cliquer pour basculer temps restant / temps total"
            >
              {timeDisplay}
            </button>
          </div>

          {/* Bloc Droit : Sélecteurs avancés (Audio, Sous-titres, Vitesse, Ratio, Plein écran) */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
            {/* 1. Sélecteur Piste Audio */}
            {audioTracks.length > 1 && (
              <div className="relative" data-player-popover>
                <button
                  type="button"
                  onClick={() => setOpenMenu((cur) => (cur === "audio" ? null : "audio"))}
                  className={clsx(
                    "focus-ring flex h-9 px-2.5 items-center gap-1.5 rounded-xl text-xs font-semibold transition",
                    openMenu === "audio" ? "bg-white/25 text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                  )}
                  title={`Piste audio : ${activeAudioLabel}`}
                  aria-label="Audio"
                >
                  <Film className="h-3.5 w-3.5" />
                  <span className="hidden md:inline max-w-[80px] truncate">{activeAudioLabel}</span>
                </button>

                {openMenu === "audio" && (
                  <div className="absolute bottom-12 right-0 z-40 w-56 rounded-2xl border border-white/20 bg-black/90 p-2 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                      Pistes Audio
                    </div>
                    <div className="mt-1 space-y-1 max-h-56 overflow-y-auto">
                      {audioTracks.map((track) => {
                        const isSelected = String(track.id) === String(activeAudioTrack);
                        return (
                          <button
                            key={String(track.id)}
                            type="button"
                            onClick={() => {
                              onSelectAudioTrack(track.id);
                              setOpenMenu(null);
                            }}
                            className={clsx(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition",
                              isSelected ? "bg-[var(--mega-red)] font-bold text-white" : "text-white/80 hover:bg-white/10"
                            )}
                          >
                            <span className="truncate">{track.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Sous-titres & Resynchronisation */}
            {subtitles.length > 0 && (
              <div className="relative" data-player-popover>
                <button
                  type="button"
                  onClick={() => setOpenMenu((cur) => (cur === "subs" ? null : "subs"))}
                  className={clsx(
                    "focus-ring flex h-9 px-2.5 items-center gap-1.5 rounded-xl text-xs font-semibold transition",
                    activeSub ? "bg-[var(--mega-red)]/30 text-[var(--mega-red)] border border-[var(--mega-red)]/40" : "bg-white/10 text-white/80 hover:bg-white/20",
                    openMenu === "subs" ? "bg-white/25 text-white" : ""
                  )}
                  title={`Sous-titres : ${activeSubLabel} (Touche C)`}
                  aria-label="Sous-titres"
                >
                  <Subtitles className="h-4 w-4" />
                  <span className="hidden md:inline max-w-[80px] truncate">{activeSub ? activeSubLabel : "CC"}</span>
                </button>

                {openMenu === "subs" && (
                  <div className="absolute bottom-12 right-0 z-40 w-72 rounded-2xl border border-white/20 bg-black/90 p-3 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
                      Sous-titres
                    </div>

                    {/* Liste des pistes */}
                    <div className="mt-1 space-y-1 max-h-44 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubtitle(null);
                        }}
                        className={clsx(
                          "flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition",
                          !activeSub ? "bg-white/15 font-bold text-white" : "text-white/70 hover:bg-white/10"
                        )}
                      >
                        <span>Désactivés</span>
                        {!activeSub && <Check className="h-3.5 w-3.5" />}
                      </button>

                      {subtitles.map((sub) => {
                        const isSelected = activeSub === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              onSelectSubtitle(sub.id);
                            }}
                            className={clsx(
                              "flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition",
                              isSelected ? "bg-[var(--mega-red)] font-bold text-white" : "text-white/80 hover:bg-white/10"
                            )}
                          >
                            <span className="truncate">{sub.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Resynchronisation / Décalage temporel */}
                    {activeSub && (
                      <div className="mt-3 border-t border-white/10 pt-2.5">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-semibold text-white/60">Décalage</span>
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {subOffset > 0 ? `+${subOffset.toFixed(1)}s` : `${subOffset.toFixed(1)}s`}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => onAdjustSubOffset(-0.5)}
                            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-mono text-white hover:bg-white/20 transition"
                            title="-500ms"
                          >
                            -0.5s
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustSubOffset(-0.1)}
                            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-mono text-white hover:bg-white/20 transition"
                            title="-100ms"
                          >
                            -0.1s
                          </button>
                          <button
                            type="button"
                            onClick={onResetSubOffset}
                            className="rounded-lg border border-white/20 px-2 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/10 transition"
                            title="Réinitialiser à 0s"
                          >
                            0s
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustSubOffset(0.1)}
                            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-mono text-white hover:bg-white/20 transition"
                            title="+100ms"
                          >
                            +0.1s
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustSubOffset(0.5)}
                            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-mono text-white hover:bg-white/20 transition"
                            title="+500ms"
                          >
                            +0.5s
                          </button>
                        </div>

                        {/* Taille des sous-titres */}
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <div className="px-1 text-[11px] font-semibold text-white/60">Taille</div>
                          <div className="mt-1.5 grid grid-cols-3 gap-1">
                            {(["small", "medium", "large"] as SubtitleSize[]).map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => onChangeSubSize(size)}
                                className={clsx(
                                  "rounded-lg py-1 text-center text-xs font-semibold capitalize transition",
                                  subSize === size ? "bg-white/25 text-white" : "bg-white/5 text-white/60 hover:bg-white/15"
                                )}
                              >
                                {size === "small" ? "Petite" : size === "medium" ? "Moyenne" : "Grande"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Sélecteur Vitesse de lecture */}
            <div className="relative" data-player-popover>
              <button
                type="button"
                onClick={() => setOpenMenu((cur) => (cur === "speed" ? null : "speed"))}
                className={clsx(
                  "focus-ring flex h-9 px-2.5 items-center gap-1 rounded-xl text-xs font-mono font-bold transition",
                  openMenu === "speed" ? "bg-white/25 text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                )}
                title="Vitesse de lecture"
                aria-label="Vitesse"
              >
                <Gauge className="h-3.5 w-3.5" />
                <span>{playbackSpeed}x</span>
              </button>

              {openMenu === "speed" && (
                <div className="absolute bottom-12 right-0 z-40 w-44 rounded-2xl border border-white/20 bg-black/90 p-2 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                    Vitesse
                  </div>
                  <div className="space-y-1">
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          onChangePlaybackSpeed(spd);
                          setOpenMenu(null);
                        }}
                        className={clsx(
                          "flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-mono font-semibold transition",
                          playbackSpeed === spd ? "bg-[var(--mega-red)] text-white" : "text-white/80 hover:bg-white/10"
                        )}
                      >
                        <span>{spd}x {spd === 1 ? "(Normal)" : ""}</span>
                        {playbackSpeed === spd && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Ratio d'affichage (Aspect Ratio) */}
            <div className="relative" data-player-popover>
              <button
                type="button"
                onClick={() => setOpenMenu((cur) => (cur === "aspect" ? null : "aspect"))}
                className={clsx(
                  "focus-ring flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition",
                  openMenu === "aspect" ? "bg-white/25 text-white" : "bg-white/10 hover:bg-white/20"
                )}
                title="Format d'affichage vidéo"
                aria-label="Aspect Ratio"
              >
                <Scan className="h-4 w-4" />
              </button>

              {openMenu === "aspect" && (
                <div className="absolute bottom-12 right-0 z-40 w-52 rounded-2xl border border-white/20 bg-black/90 p-2 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                    Format d'image
                  </div>
                  <div className="space-y-1">
                    {ASPECT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onChangeAspectRatio(opt.id);
                          setOpenMenu(null);
                        }}
                        className={clsx(
                          "flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-semibold transition",
                          aspectRatio === opt.id ? "bg-[var(--mega-red)] text-white" : "text-white/80 hover:bg-white/10"
                        )}
                      >
                        <span>{opt.label}</span>
                        {aspectRatio === opt.id && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Plein écran */}
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              title={fullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
              aria-label="Plein écran"
            >
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
