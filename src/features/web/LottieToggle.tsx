"use client";

import { clsx } from "clsx";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef, useState } from "react";

/**
 * Lottie-animated switch mirroring the Android app's `autoplay_toggle.lottie`
 * (the "Discord toggle": grey ⇄ green knob slide). Frames 0→70 = OFF→ON, so we
 * play forward on ON and reverse on OFF. Falls back to a polished spring toggle
 * if the animation JSON can't be loaded (keeps the same checked/onChange/label
 * API so `WebSettings` can swap either way).
 */

const ANIMATION_URL = "/lottie/autoplay_toggle.json";
const START_FRAME = 0;
const END_FRAME = 70;

// Module-level cache so every toggle shares a single fetch of the JSON.
let cachedData: object | null = null;
let inFlight: Promise<object | null> | null = null;

function loadAnimation(): Promise<object | null> {
  if (cachedData) return Promise.resolve(cachedData);
  if (inFlight) return inFlight;
  inFlight = fetch(ANIMATION_URL)
    .then((res) => (res.ok ? res.json() : null))
    .then((json: object | null) => {
      cachedData = json;
      return json;
    })
    .catch(() => null);
  return inFlight;
}

type Props = { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean };

export function LottieToggle({ checked, onChange, label, disabled = false }: Props) {
  const [animationData, setAnimationData] = useState<object | null>(cachedData);
  const [failed, setFailed] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const primed = useRef(false);

  useEffect(() => {
    let alive = true;
    loadAnimation().then((data) => {
      if (!alive) return;
      if (data) setAnimationData(data);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Snap to the correct resting frame first, then animate on subsequent toggles.
  useEffect(() => {
    const lottie = lottieRef.current;
    if (!lottie || !animationData) return;
    if (!primed.current) {
      primed.current = true;
      lottie.goToAndStop(checked ? END_FRAME : START_FRAME, true);
      return;
    }
    lottie.setDirection(checked ? 1 : -1);
    lottie.play();
  }, [checked, animationData]);

  const toggle = () => {
    if (!disabled) onChange(!checked);
  };

  if (animationData && !failed) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={toggle}
        className="focus-ring relative grid h-7 w-12 place-items-center rounded-full disabled:opacity-50"
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          autoplay={false}
          loop={false}
          className="h-full w-full"
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        />
      </button>
    );
  }

  // Graceful fallback: polished spring-like CSS toggle, same footprint.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={toggle}
      className={clsx(
        "focus-ring relative h-7 w-12 rounded-full border transition-colors duration-300 disabled:opacity-50",
        checked ? "border-transparent bg-[var(--mega-green)]" : "border-[var(--mega-border-strong)] bg-[var(--mega-input-bg)]"
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          checked ? "translate-x-[1.4rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
