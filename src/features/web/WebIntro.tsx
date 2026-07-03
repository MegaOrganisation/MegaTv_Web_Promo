"use client";

import { useEffect, useRef } from "react";

const INTRO_MS = 3600;

/** Boot intro — animated WebP parity `megatv_intro_once` (Android SplashScreen). */
export function WebIntro({ onFinished }: { onFinished: () => void }) {
  const done = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onFinished();
    }, INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#10191C]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/megatv_intro_once.webp"
        alt=""
        className="h-full w-full max-h-screen object-contain"
        draggable={false}
      />
    </div>
  );
}
