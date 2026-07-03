"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Lightweight route transition: re-keys on pathname so the enter animation
 * replays on navigation. CSS-only (no framer-motion) — see `.web-route-enter`.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="web-route-enter">
      {children}
    </div>
  );
}
