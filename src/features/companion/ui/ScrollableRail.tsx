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
  useDragScroll(ref);

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
