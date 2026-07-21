"use client";

import { useRef, type ReactNode } from "react";
import { clsx } from "clsx";

import { useDragScroll } from "@/features/companion/ui/useDragScroll";

type Props = {
  children: ReactNode;
  className?: string;
  axis?: "x" | "y";
  showScrollbar?: boolean;
};

export function ScrollableRail({ children, className, axis = "x", showScrollbar = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Drag-scroll H only — on vertical rails it stole clicks (pointer capture).
  useDragScroll(ref, { axis, enabled: axis === "x" });

  return (
    <div
      ref={ref}
      className={clsx(
        "mega-scroll-rail",
        axis === "x" ? "mega-scroll-rail--x" : "mega-scroll-rail--y",
        showScrollbar && "mega-scroll-rail--scrollbar",
        className
      )}
    >
      {children}
    </div>
  );
}
