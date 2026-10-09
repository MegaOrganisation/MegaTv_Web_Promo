"use client";

import { useEffect, useState, useRef } from "react";
import { Play, SkipForward, X } from "lucide-react";

type Props = {
  season: number;
  episode: number;
  onPlayNext: () => void;
  onDismiss: () => void;
  countdownSeconds?: number;
};

/**
 * Bannière "Épisode Suivant" (parité Android MegaTV) :
 * Apparaît dans les 30 dernières secondes d'un épisode ou sur onEnded,
 * affiche une carte glass avec bouton "Lire l'épisode suivant" et compte à rebours de 10s.
 */
export function NextEpisodeBanner({
  season,
  episode,
  onPlayNext,
  onDismiss,
  countdownSeconds = 10
}: Props) {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTimeLeft(countdownSeconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onPlayNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdownSeconds, onPlayNext]);

  const progressPercent = Math.max(0, Math.min(100, ((countdownSeconds - timeLeft) / countdownSeconds) * 100));
  const nextEpisodeNumber = episode + 1;

  return (
    <div className="pointer-events-auto absolute bottom-24 right-6 z-30 w-80 max-w-[calc(100vw-3rem)] rounded-2xl border border-white/20 bg-black/80 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-6 duration-300">
      {/* Barre de compte à rebours supérieure */}
      <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full bg-[var(--mega-red)] transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(229,57,53,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/60">
            <SkipForward className="h-3.5 w-3.5 text-[var(--mega-red)]" />
            <span>Épisode suivant dans {timeLeft}s</span>
          </div>
          <p className="mt-1 text-base font-bold text-white tracking-wide">
            Saison {season} · Épisode {nextEpisodeNumber}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/15 hover:text-white"
          title="Annuler"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onPlayNext}
          className="group focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black shadow-lg transition hover:bg-white/90 active:scale-[0.98]"
        >
          <Play className="h-3.5 w-3.5 fill-current transition group-hover:scale-110" />
          <span>Lire maintenant</span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          Rester
        </button>
      </div>
    </div>
  );
}
