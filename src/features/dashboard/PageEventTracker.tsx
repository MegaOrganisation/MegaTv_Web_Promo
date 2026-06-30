"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageEventTracker({ page }: { page: string }) {
  const pathname = usePathname();
  const startedAt = useRef<Date | null>(null);

  useEffect(() => {
    startedAt.current = new Date();

    return () => {
      const start = startedAt.current;
      if (!start) return;
      const now = new Date();
      const payload = JSON.stringify({
        page,
        route: pathname,
        openedAt: start.toISOString(),
        closedAt: now.toISOString(),
        durationMs: now.getTime() - start.getTime()
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/dashboard/events", new Blob([payload], { type: "application/json" }));
        return;
      }

      void fetch("/api/dashboard/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      });
    };
  }, [page, pathname]);

  return null;
}
