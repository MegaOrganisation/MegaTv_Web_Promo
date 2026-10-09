"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { clsx } from "clsx";

type Props = {
  onSeekRelative: (seconds: number) => void;
  onSingleTap: () => void;
  disabled?: boolean;
};

interface RippleState {
  side: "left" | "right";
  seconds: number;
  id: number;
}

/**
 * Gestes tactiles sur mobile / tablette & desktop :
 * Double-tap à gauche pour reculer (-10s, -20s...),
 * Double-tap à droite pour avancer (+10s, +20s...),
 * avec animation d'onde ripple semi-circulaire et icône lumineuse.
 */
export function DoubleTapRipple({ onSeekRelative, onSingleTap, disabled = false }: Props) {
  const [ripple, setRipple] = useState<RippleState | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedSeconds = useRef<{ left: number; right: number }>({ left: 0, right: 0 });

  const clearRipple = useCallback(() => {
    setRipple(null);
    accumulatedSeconds.current = { left: 0, right: 0 };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Seulement clic gauche ou toucher
    if (e.button !== 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const isLeft = x < width * 0.35;
    const isRight = x > width * 0.65;

    if (!isLeft && !isRight) {
      // Zone centrale : simple tap/clic
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      onSingleTap();
      return;
    }

    const side = isLeft ? "left" : "right";

    if (clickTimer.current) {
      // Deuxième tap rapide détecté dans le délai (Double Tap)
      clearTimeout(clickTimer.current);
      clickTimer.current = null;

      const delta = side === "left" ? -10 : 10;
      onSeekRelative(delta);

      accumulatedSeconds.current[side] += Math.abs(delta);
      const totalSec = accumulatedSeconds.current[side];

      setRipple({
        side,
        seconds: totalSec,
        id: Date.now()
      });

      if (rippleTimer.current) clearTimeout(rippleTimer.current);
      rippleTimer.current = setTimeout(clearRipple, 750);
    } else {
      // Premier tap : démarrer le timer pour vérifier si un second tap suit
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        accumulatedSeconds.current = { left: 0, right: 0 };
        onSingleTap();
      }, 260);
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      if (rippleTimer.current) clearTimeout(rippleTimer.current);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-10 select-none touch-manipulation cursor-pointer"
      onPointerDown={handlePointerDown}
    >
      {/* Ripple animation à gauche */}
      {ripple && ripple.side === "left" && (
        <div
          key={ripple.id}
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-[42%] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent animate-pulse rounded-r-full" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 rounded-full bg-black/60 px-6 py-5 backdrop-blur-xl border border-white/20 shadow-2xl animate-out fade-out zoom-out-95 duration-700 fill-mode-forwards">
            <RotateCcw className="h-8 w-8 text-white animate-spin-once" />
            <span className="text-sm font-bold tracking-wider text-white">-{ripple.seconds}s</span>
          </div>
        </div>
      )}

      {/* Ripple animation à droite */}
      {ripple && ripple.side === "right" && (
        <div
          key={ripple.id}
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-[42%] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-l from-white/20 via-white/5 to-transparent animate-pulse rounded-l-full" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 rounded-full bg-black/60 px-6 py-5 backdrop-blur-xl border border-white/20 shadow-2xl animate-out fade-out zoom-out-95 duration-700 fill-mode-forwards">
            <RotateCw className="h-8 w-8 text-white animate-spin-once" />
            <span className="text-sm font-bold tracking-wider text-white">+{ripple.seconds}s</span>
          </div>
        </div>
      )}
    </div>
  );
}
