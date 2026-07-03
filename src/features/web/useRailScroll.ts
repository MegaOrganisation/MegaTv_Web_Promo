"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RAIL_SCROLL_STEP } from "@/lib/web/rail";

export function useRailScroll() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const refresh = useCallback(() => {
    const node = trackRef.current;
    if (!node) return;
    const max = Math.max(0, node.scrollWidth - node.clientWidth);
    const left = node.scrollLeft;
    setCanLeft(left > 4);
    setCanRight(left < max - 4);
    setAtEnd(max <= 4 || left >= max - 4);
  }, []);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    refresh();
    node.addEventListener("scroll", refresh, { passive: true });
    const observer = new ResizeObserver(refresh);
    observer.observe(node);
    return () => {
      node.removeEventListener("scroll", refresh);
      observer.disconnect();
    };
  }, [refresh]);

  const scrollBy = useCallback((delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return {
    trackRef,
    canScrollLeft: canLeft,
    canScrollRight: canRight,
    atEnd,
    scrollLeft: () => scrollBy(-RAIL_SCROLL_STEP),
    scrollRight: () => scrollBy(RAIL_SCROLL_STEP),
    refresh
  };
}
