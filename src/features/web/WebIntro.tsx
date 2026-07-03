"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MegaTv web boot intro (P1) — a self-contained React port of the Android
 * `assets/intro/web` pack (see `intro_video_demarrage`). Signature beat: the
 * triangle mark winds up and strikes the "MegaTV" wordmark, which crossfades
 * from grey to the brand gradient with a synthesized "ta-dum". Plays once per
 * web session (the caller gates on sessionStorage). No CDN/DC runtime.
 */

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const easeOutCubic = (t: number) => --t * t * t + 1;
const easeInCubic = (t: number) => t * t * t;
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const MTV = { ANTIC: 1.55, JUMP: 1.8, IMPACT1: 2.1, REBOUND: 2.24, IMPACT2: 2.56, DUR: 4.0 };
const MTV_GRAY = "#5c6168";
const MTV_LIGHT = "#e9ebee";
const MEGATV_BG = "#10191C";
const TV_GRADIENT = "linear-gradient(95deg,#36b54a 0%,#ffd34d 20%,#f7931e 38%,#ef4136 56%,#ec268f 74%,#8a4dbb 87%,#4a90e2 100%)";

// ── Synthesized audio (Web Audio, no files) ─────────────────────────────────
type AC = AudioContext & { __closed?: boolean };
function getAC(ref: { current: AC | null }) {
  if (typeof window === "undefined") return null;
  if (!ref.current) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ref.current = new Ctor() as AC;
  }
  if (ref.current.state === "suspended") ref.current.resume().catch(() => undefined);
  return ref.current;
}

function dum(ac: AudioContext, pitch: number, vol: number) {
  const t0 = ac.currentTime;
  const out = ac.createGain();
  out.gain.value = vol;
  out.connect(ac.destination);
  const o = ac.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(185 * pitch, t0);
  o.frequency.exponentialRampToValueAtTime(38 * pitch, t0 + 0.3);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.9, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
  o.connect(g);
  g.connect(out);
  o.start(t0);
  o.stop(t0 + 0.6);
}

function swell(ac: AudioContext) {
  const t0 = ac.currentTime;
  const out = ac.createGain();
  out.connect(ac.destination);
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(0.14, t0 + 0.5);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(280, t0);
  lp.frequency.exponentialRampToValueAtTime(1500, t0 + 0.7);
  lp.connect(out);
  [73.42, 110, 146.83, 220].forEach((f, i) => {
    const o = ac.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.detune.value = i % 2 ? 7 : -7;
    const g = ac.createGain();
    g.gain.value = 0.22;
    o.connect(g);
    g.connect(lp);
    o.start(t0);
    o.stop(t0 + 2.3);
  });
}

function triXform(t: number, jdx: number) {
  const { ANTIC, JUMP, IMPACT1, REBOUND, IMPACT2 } = MTV;
  let dx = 0,
    sx = 1,
    sy = 1,
    op = 1;
  if (t < 0.85) {
    const p = easeOutCubic(clamp(t / 0.7, 0, 1));
    op = p;
    const s = 0.8 + 0.2 * p;
    sx = s;
    sy = s;
  } else if (t < ANTIC) {
    // rest
  } else if (t < JUMP) {
    const p = (t - ANTIC) / (JUMP - ANTIC);
    dx = -34 * easeOutCubic(p);
    sx = 1 + 0.05 * Math.sin(p * Math.PI);
  } else if (t < IMPACT1) {
    const p = (t - JUMP) / (IMPACT1 - JUMP);
    const e = easeInCubic(p);
    dx = -34 + (jdx + 34) * e;
    sx = 1 + 0.12 * e;
    sy = 1 - 0.06 * e;
  } else if (t < REBOUND) {
    dx = jdx;
    const a = 0.26 * Math.exp(-(t - IMPACT1) * 16);
    sx = 1 - a;
    sy = 1 + a * 0.7;
  } else if (t < IMPACT2) {
    const p = (t - REBOUND) / (IMPACT2 - REBOUND);
    dx = jdx * (1 - easeOutCubic(p));
  } else {
    const d = t - IMPACT2;
    const a = 0.1 * Math.exp(-d * 12) * Math.cos(d * 16);
    sx = 1 - Math.max(a, -0.05);
    sy = 1 + Math.max(a, -0.05) * 0.6;
  }
  const origin = t >= IMPACT1 ? "right center" : "center center";
  return { dx, sx, sy, op, origin };
}

function Letter({ ch, tv, idx, t }: { ch: string; tv?: boolean; idx: number; t: number }) {
  const reveal = clamp((t - (0.55 + idx * 0.12)) / 0.35, 0, 1);
  const cp = clamp((t - (MTV.IMPACT1 + 0.04 + idx * 0.07)) / 0.3, 0, 1);
  const pop = 1 + 0.09 * Math.sin(cp * Math.PI);
  const finalStyle = tv
    ? { backgroundImage: TV_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }
    : { color: MTV_LIGHT };
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        opacity: reveal,
        transform: `translateX(${-32 * (1 - easeOutCubic(reveal))}px) scale(${pop})`,
        transformOrigin: "center 78%"
      }}
    >
      <span style={{ color: MTV_GRAY, opacity: 1 - cp }}>{ch}</span>
      <span aria-hidden style={{ position: "absolute", inset: 0, opacity: cp, ...(finalStyle as React.CSSProperties) }}>
        {ch}
      </span>
    </span>
  );
}

export function WebIntro({ onFinished }: { onFinished: () => void }) {
  const [t, setT] = useState(0);
  const [scale, setScale] = useState(1);
  const acRef = useRef<AC | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const finishedRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinished();
  };

  // Load the brand display font (Baloo 2) once.
  useEffect(() => {
    const id = "megatv-intro-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Scale the 1280×720 stage to the viewport (contain).
  useEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      setScale(Math.max(0.01, Math.min(el.clientWidth / 1280, el.clientHeight / 720)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Resume audio on first user gesture (autoplay policies).
  useEffect(() => {
    const resume = () => getAC(acRef);
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    getAC(acRef);
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  // rAF timeline + audio cue firing.
  useEffect(() => {
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const time = (ts - startRef.current) / 1000;
      setT(time);

      const ac = acRef.current;
      if (ac && ac.state === "running") {
        const fire = (key: string, at: number, fn: () => void) => {
          if (time >= at && !firedRef.current.has(key)) {
            firedRef.current.add(key);
            fn();
          }
        };
        fire("i1", MTV.IMPACT1, () => dum(ac, 1, 1));
        fire("i2", MTV.IMPACT2, () => {
          dum(ac, 0.78, 0.85);
          swell(ac);
        });
      }

      if (time >= MTV.DUR) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    const rafHandle = rafRef;
    const acHandle = acRef;
    return () => {
      if (rafHandle.current) cancelAnimationFrame(rafHandle.current);
      const ac = acHandle.current;
      if (ac && !ac.__closed) {
        ac.__closed = true;
        ac.close().catch(() => undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jdx = 150; // dash distance into the "M"
  const x = triXform(t, jdx);
  const triColor = clamp((t - MTV.IMPACT1) / 0.35, 0, 1);
  const glowIn = clamp((t - MTV.IMPACT1) / 1.2, 0, 1);
  const flashD = t - MTV.IMPACT1;
  const flash = flashD > 0 ? Math.exp(-flashD * 7) : 0;
  const zoom = 1 + 0.05 * easeInOutSine(clamp((t - 2.6) / 1.4, 0, 1));

  let shx = 0;
  let shy = 0;
  ([[MTV.IMPACT1, 9], [MTV.IMPACT2, 5]] as const).forEach(([ti, amp]) => {
    if (t > ti) {
      const d = t - ti;
      const a = amp * Math.exp(-d * 13);
      shx += a * 1.2 * Math.sin(d * 120);
      shy += a * 0.45 * Math.cos(d * 97);
    }
  });

  const letters: { ch: string; tv?: boolean }[] = [{ ch: "M" }, { ch: "e" }, { ch: "G" }, { ch: "a" }, { ch: "TV", tv: true }];
  const fade = t > MTV.DUR - 0.4 ? clamp((MTV.DUR - t) / 0.4, 0, 1) : 1;

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center overflow-hidden"
      style={{ background: MEGATV_BG, opacity: fade, transition: "opacity 120ms linear" }}
      role="dialog"
      aria-label="Intro MegaTv"
    >
      <button
        type="button"
        onClick={finish}
        className="focus-ring absolute right-5 top-5 z-10 rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-shell-nav)] px-4 py-1.5 text-xs font-semibold text-[var(--mega-text)] backdrop-blur"
      >
        Passer
      </button>

      <div ref={stageRef} className="relative h-full w-full">
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 1280,
            height: 720,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center"
          }}
        >
          <div style={{ position: "absolute", inset: 0, transform: `translate(${shx}px, ${shy}px) scale(${zoom})` }}>
            {/* rainbow glow */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 980,
                height: 380,
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(50% 50% at 30% 50%, rgba(80,160,255,0.5), transparent 70%), radial-gradient(50% 50% at 70% 50%, rgba(255,110,60,0.45), transparent 70%), radial-gradient(40% 50% at 50% 60%, rgba(60,200,120,0.4), transparent 70%)",
                filter: "blur(70px)",
                opacity: glowIn * 0.5
              }}
            />
            {/* logo row */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 46 }}>
              <div
                style={{
                  width: 200,
                  height: 190,
                  flex: "0 0 auto",
                  transform: `translateX(${x.dx}px) scale(${x.sx}, ${x.sy})`,
                  transformOrigin: x.origin,
                  opacity: x.op
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/companion/triangle-mark-trimmed.png"
                  alt="MegaTv"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                    filter: `grayscale(${1 - triColor}) brightness(${1.08 - 0.08 * triColor})`
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  fontFamily: "'Baloo 2', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: 150,
                  lineHeight: 1,
                  paddingBottom: 10,
                  whiteSpace: "nowrap"
                }}
              >
                {letters.map((l, i) => (
                  <Letter key={l.ch} ch={l.ch} tv={l.tv} idx={i} t={t} />
                ))}
              </div>
            </div>

            {/* impact flash */}
            {flash > 0.01 ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 460,
                  height: 460,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.8), transparent 65%)",
                  opacity: flash * 0.75,
                  filter: "blur(6px)",
                  pointerEvents: "none"
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
