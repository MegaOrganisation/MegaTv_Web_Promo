"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Barre fine de progression — pas un full-page loading. */
export function CompanionRouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 280);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-[linear-gradient(90deg,#f2b43c,#ee6a54,#d8497f)] transition-[transform,opacity] duration-200 ${active ? "scale-x-100 opacity-80" : "scale-x-0 opacity-0"}`}
    />
  );
}
