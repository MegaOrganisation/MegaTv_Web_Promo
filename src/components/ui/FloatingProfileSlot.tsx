"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION_MS = 380;

type Rect = { top: number; left: number; width: number; height: number };

function readRect(node: HTMLElement | null): Rect | null {
  if (!node) return null;
  const box = node.getBoundingClientRect();
  return { top: box.top, left: box.left, width: box.width, height: box.height };
}

export function FloatingProfileSlot({
  docked,
  children,
  headerRef,
  dockRef
}: {
  docked: boolean;
  children: ReactNode;
  headerRef: RefObject<HTMLElement | null>;
  dockRef: RefObject<HTMLElement | null>;
}) {
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const target = docked ? dockRef.current : headerRef.current;
    const next = readRect(target);
    if (!next) return;

    setRect(next);
    setAnimate(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [docked, dockRef, headerRef]);

  useEffect(() => {
    const sync = () => {
      const target = docked ? dockRef.current : headerRef.current;
      const next = readRect(target);
      if (next) setRect(next);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [docked, dockRef, headerRef]);

  const floating =
    mounted && rect
      ? createPortal(
          <div
            className="pointer-events-auto fixed z-[92] lg:hidden"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              transition: animate
                ? `top ${DURATION_MS}ms ${EASE}, left ${DURATION_MS}ms ${EASE}, width ${DURATION_MS}ms ${EASE}, height ${DURATION_MS}ms ${EASE}, transform ${DURATION_MS}ms ${EASE}`
                : "none",
              transform: animate ? "translate3d(0,0,0) scale(1)" : "translate3d(0,0,0) scale(0.96)"
            }}
          >
            {children}
          </div>,
          document.body
        )
      : null;

  return floating;
}
