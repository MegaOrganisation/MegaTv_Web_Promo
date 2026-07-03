"use client";

import { useEffect, useRef, useState } from "react";

import type { RailItemMeta } from "@/lib/web/rail-meta";

const mem = new Map<string, RailItemMeta>();

export function useRailMeta(mediaIds: string[], enabled: boolean) {
  const [meta, setMeta] = useState<Record<string, RailItemMeta>>({});
  const [loading, setLoading] = useState(false);
  const asked = useRef("");

  useEffect(() => {
    if (!enabled || mediaIds.length === 0) return;

    const key = mediaIds.join("|");
    if (asked.current === key) return;
    asked.current = key;

    const cached: Record<string, RailItemMeta> = {};
    const missing: string[] = [];
    for (const id of mediaIds) {
      const hit = mem.get(id);
      if (hit) cached[id] = hit;
      else missing.push(id);
    }
    if (Object.keys(cached).length) setMeta((prev) => ({ ...prev, ...cached }));
    if (missing.length === 0) return;

    let cancelled = false;
    setLoading(true);
    void fetch("/api/web/rail-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: missing })
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { meta?: Record<string, RailItemMeta> } | null) => {
        if (cancelled || !json?.meta) return;
        for (const [id, value] of Object.entries(json.meta)) mem.set(id, value);
        setMeta((prev) => ({ ...prev, ...json.meta }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, mediaIds]);

  return { meta, loading };
}
