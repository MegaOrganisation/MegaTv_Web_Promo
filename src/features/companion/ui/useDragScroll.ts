"use client";

import { useEffect, type RefObject } from "react";

/** Scroll horizontal au clic-maintenu (desktop) + molette shift ; tactile natif. */
export function useDragScroll(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let pointerDown = false;
    let startX = 0;
    let scrollLeft = 0;

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      pointerDown = true;
      startX = e.clientX;
      scrollLeft = el!.scrollLeft;
      el!.setPointerCapture(e.pointerId);
      el!.classList.add("is-dragging");
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointerDown) return;
      el!.scrollLeft = scrollLeft - (e.clientX - startX);
    }

    function onPointerUp(e: PointerEvent) {
      pointerDown = false;
      el!.classList.remove("is-dragging");
      try {
        el!.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
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
  }, [ref, enabled]);
}
