"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Cpu, Film, Info, Radio, Volume2, X } from "lucide-react";

export type StreamTechnicalInfo = {
  title: string;
  streamLabel: string;
  sourceMode: "direct" | "proxy";
  streamType?: string;
  sourceUrl: string;
  videoWidth: number;
  videoHeight: number;
  bufferedSeconds: number;
  currentBitrate?: string | null;
  audioTrackLabel?: string | null;
  subtitleLabel?: string | null;
  subtitleOffset?: number;
  engine: "hls.js" | "native";
  playbackRate: number;
  aspectRatio: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  info: StreamTechnicalInfo;
};

export function StreamInfoOverlay({ open, onClose, info }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "i" || e.key === "I") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(info.sourceUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resolutionLabel =
    info.videoWidth > 0 && info.videoHeight > 0
      ? `${info.videoWidth} × ${info.videoHeight} (${info.videoHeight >= 2160 ? "4K UHD" : info.videoHeight >= 1080 ? "1080p FHD" : info.videoHeight >= 720 ? "720p HD" : "SD"})`
      : "Chargement...";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#12161b]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[var(--mega-red)] shadow-inner">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FLUX ACTIF
                </span>
                <span className="text-xs text-white/50">{info.engine === "hls.js" ? "HLS.js Worker" : "HTML5 Media"}</span>
              </div>
              <h2 className="mt-0.5 text-lg font-bold text-white tracking-tight">{info.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grille de métadonnées */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Section Vidéo */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
              <Film className="h-4 w-4 text-[var(--mega-red)]" />
              <span>Vidéo</span>
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-white/60">Résolution :</dt>
                <dd className="font-mono font-medium text-white">{resolutionLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Format d'affichage :</dt>
                <dd className="font-mono text-white/90 capitalize">{info.aspectRatio}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Bitrate estimé :</dt>
                <dd className="font-mono text-emerald-400">{info.currentBitrate || "Dynamique / ABR"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Vitesse de lecture :</dt>
                <dd className="font-mono text-white/90">{info.playbackRate}x</dd>
              </div>
            </dl>
          </div>

          {/* Section Audio & Sous-titres */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
              <Volume2 className="h-4 w-4 text-[var(--mega-accent)]" />
              <span>Audio & Sous-titres</span>
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-white/60">Piste audio :</dt>
                <dd className="font-medium text-white truncate max-w-[140px] text-right">{info.audioTrackLabel || "Stéréo par défaut"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Sous-titres :</dt>
                <dd className="font-medium text-white truncate max-w-[140px] text-right">{info.subtitleLabel || "Désactivés"}</dd>
              </div>
              {info.subtitleOffset !== undefined && info.subtitleOffset !== 0 ? (
                <div className="flex justify-between">
                  <dt className="text-white/60">Décalage sous-titres :</dt>
                  <dd className="font-mono text-amber-400 font-semibold">{info.subtitleOffset > 0 ? `+${info.subtitleOffset}s` : `${info.subtitleOffset}s`}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-white/60">Tampon préchargé :</dt>
                <dd className="font-mono text-white/90">{Math.round(info.bufferedSeconds)} secondes</dd>
              </div>
            </dl>
          </div>

          {/* Section Source & Réseau */}
          <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
              <Radio className="h-4 w-4 text-purple-400" />
              <span>Réseau & Source</span>
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <dt className="text-white/60">Mode de transit :</dt>
                <dd>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 font-semibold text-[11px] ${
                      info.sourceMode === "proxy"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        : "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                    }`}
                  >
                    {info.sourceMode === "proxy" ? "Proxy MegaTv sécurisé (anti-CORS)" : "Direct CDN sans relais"}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Conteneur / Profil :</dt>
                <dd className="font-mono text-white/90 uppercase">{info.streamType || "HLS / Stream"}</dd>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                <dt className="text-white/60">URL du flux :</dt>
                <dd className="flex items-center gap-2 max-w-[65%]">
                  <span className="truncate font-mono text-[11px] text-white/40">{info.sourceUrl}</span>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="focus-ring flex items-center gap-1 rounded border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/80 hover:bg-white/20 transition"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copié" : "Copier"}</span>
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Raccourcis clavier pratiques */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            <Info className="h-3.5 w-3.5" />
            <span>Raccourcis clavier cinéma</span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-white/70">
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">Espace</kbd> / <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">K</kbd> Play / Pause</div>
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">←</kbd> / <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">→</kbd> -10s / +10s</div>
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">F</kbd> Plein écran</div>
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">M</kbd> Muet</div>
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">S</kbd> Passer l'intro</div>
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">I</kbd> Infos flux</div>
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">C</kbd> Sous-titres On/Off</div>
            <div><kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">D</kbd> Décalage sous-titres</div>
          </div>
        </div>
      </div>
    </div>
  );
}
