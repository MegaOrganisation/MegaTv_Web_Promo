"use client";

import { useEffect, useRef } from "react";

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  backdropUrl?: string | null;
};

/**
 * Mode Ambilight (Éclairage Ambiant) :
 * Projette un flou doux et immersif des couleurs des bords de la vidéo
 * derrière le lecteur avec un canvas miniature haute performance (32x18).
 * En cas de restriction CORS (CDN strict), bascule sur un halo dynamique sans planter.
 */
export function PlayerAmbilight({ videoRef, enabled, backdropUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const corsBlockedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    let isRunning = true;
    let lastDraw = 0;
    const DRAW_INTERVAL_MS = 66; // ~15 FPS suffisant pour l'ambiance et 0 overhead CPU

    function renderLoop(time: number) {
      if (!isRunning) return;

      const video = videoRef.current;
      if (
        video &&
        !video.paused &&
        !video.ended &&
        video.readyState >= 2 &&
        !corsBlockedRef.current &&
        time - lastDraw >= DRAW_INTERVAL_MS
      ) {
        lastDraw = time;
        try {
          // Dessine la frame vidéo dans un canvas basse résolution 32x18
          if (ctx) {
            ctx.drawImage(video, 0, 0, 32, 18);
          }
        } catch {
          // Si le flux vidéo est CORS-tainted, on évite les exceptions répétées
          corsBlockedRef.current = true;
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    }

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, videoRef]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center select-none"
    >
      {/* Canvas Ambilight dynamique */}
      <canvas
        ref={canvasRef}
        width={32}
        height={18}
        className="absolute h-[115%] w-[115%] object-cover opacity-60 transition-opacity duration-700"
        style={{
          filter: "blur(70px) saturate(190%) brightness(1.1)",
          transform: "scale(1.2) translateZ(0)",
          willChange: "transform, opacity"
        }}
      />

      {/* Fallback halo doux avec backdrop si CORS restreint ou avant le premier dessin */}
      {backdropUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${backdropUrl})`,
            filter: "blur(90px) saturate(160%)"
          }}
        />
      ) : null}

      {/* Halo radial de profondeur cinéma */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
    </div>
  );
}
