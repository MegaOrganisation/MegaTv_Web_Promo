"use client";

import { useEffect, useState } from "react";
import { FastForward, X } from "lucide-react";

type Props = {
  visible: boolean;
  onSkip: () => void;
  onDismiss: () => void;
};

/**
 * Bouton "Passer l'intro" (parité SkipIntroButton.kt Android MegaTV) :
 * Apparaît de façon élégante en bas à droite entre 0:45 et 2:15 pour les séries,
 * avec raccourci clavier S et animation capsule verre givré.
 */
export function SkipIntroButton({ visible, onSkip, onDismiss }: Props) {
  const [autoHidden, setAutoHidden] = useState(false);

  // Auto-masquage après 15 secondes d'inactivité (identique au lecteur Android)
  useEffect(() => {
    if (!visible) {
      setAutoHidden(false);
      return;
    }
    const timer = setTimeout(() => {
      setAutoHidden(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || autoHidden) return null;

  return (
    <div className="pointer-events-auto absolute bottom-24 right-6 z-30 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        type="button"
        onClick={onSkip}
        className="group focus-ring flex items-center gap-2.5 rounded-full border border-white/20 bg-black/75 px-5 py-2.5 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl transition hover:border-white/35 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.98]"
        title="Passer l'intro (Touche S)"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mega-red)] text-white shadow-[0_0_10px_rgba(229,57,53,0.6)] transition group-hover:scale-110">
          <FastForward className="h-3.5 w-3.5" fill="currentColor" />
        </span>
        <span className="tracking-wide">Passer l'intro</span>
        <kbd className="hidden sm:inline-block rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-white/70">
          S
        </kbd>
      </button>

      {/* Bouton fermeture / ignorer */}
      <button
        type="button"
        onClick={onDismiss}
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/60 backdrop-blur-lg transition hover:bg-white/20 hover:text-white"
        title="Ignorer"
        aria-label="Fermer le bouton passer l'intro"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
