"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

type SyncState = "ok" | "syncing" | "offline";

/**
 * Pastille sync cloud — lecture locale / navigator.onLine (Free Tier : pas de spam réseau).
 */
export function CompanionSyncPulse() {
  const [state, setState] = useState<SyncState>("ok");

  useEffect(() => {
    const apply = () => setState(navigator.onLine ? "ok" : "offline");
    apply();
    window.addEventListener("online", apply);
    window.addEventListener("offline", apply);

    const onVis = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      setState("syncing");
      window.setTimeout(() => setState(navigator.onLine ? "ok" : "offline"), 900);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("online", apply);
      window.removeEventListener("offline", apply);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const label = state === "offline" ? "Hors ligne" : state === "syncing" ? "Sync…" : "À jour";

  return (
    <span
      className={clsx("companion-sync-pulse", state === "offline" && "is-offline", state === "syncing" && "is-syncing")}
      title={label}
      aria-label={`Cloud : ${label}`}
    >
      <span className="companion-sync-pulse__dot" aria-hidden />
      <span className="companion-sync-pulse__label">{label}</span>
    </span>
  );
}
