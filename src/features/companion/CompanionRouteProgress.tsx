"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function CompanionRouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 500);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-[linear-gradient(90deg,#3f9ae6,#d8497f)] transition-transform duration-300 ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
    />
  );
}
