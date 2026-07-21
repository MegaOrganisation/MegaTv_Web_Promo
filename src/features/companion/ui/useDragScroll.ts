"use client";

import { useEffect, type RefObject } from "react";

type Options = {
  enabled?: boolean;
  /** `x` = drag + molette horizontale ; `y` = scroll natif uniquement. */
  axis?: "x" | "y";
};

const INTERACTIVE =
  "button,a,input,textarea,select,label,[role='button'],[data-no-drag-scroll]";

/** Scroll horizontal au clic-maintenu (desktop) + molette ; tactile natif. */
export function useDragScroll(ref: RefObject<HTMLElement | null>, options: Options | boolean = true) {
  const enabled = typeof options === "boolean" ? options : (options.enabled ?? true);
  const axis = typeof options === "boolean" ? "x" : (options.axis ?? "x");

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || axis !== "x") return;

    let pointerDown = false;
    let dragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let pointerId: number | null = null;

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest?.(INTERACTIVE)) return;

      pointerDown = true;
      dragging = false;
      startX = e.clientX;
      scrollLeft = el!.scrollLeft;
      pointerId = e.pointerId;
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointerDown || pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 6) return;
        dragging = true;
        try {
          el!.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        el!.classList.add("is-dragging");
      }
      el!.scrollLeft = scrollLeft - dx;
    }

    function onPointerUp(e: PointerEvent) {
      if (pointerId !== null && e.pointerId !== pointerId) return;
      pointerDown = false;
      pointerId = null;
      if (dragging) {
        dragging = false;
        el!.classList.remove("is-dragging");
        try {
          el!.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    }

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el!.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [ref, enabled, axis]);
}
