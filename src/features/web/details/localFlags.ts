"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Optimistic local Vu / Watchlist flags for the web details page.
 *
 * The web client has NO safe batched cloud-write path for the watchlist/watched
 * slices yet (reads go through the `v_account_sync_*` views; the only cloud write
 * is the debounced connection-track RPC). To respect the Supabase Free-Tier we
 * persist these toggles to localStorage per profile and expose them reactively
 * via `useSyncExternalStore` (same pattern as `iptv-favorites` / `prefs`).
 *
 * TODO: wire to a batched cloud write (slice upsert / dedicated RPC) once one
 * exists, so Vu/Watchlist sync with the Android app + MegaCompagnon.
 */

export type LocalFlagKind = "watched" | "watchlist";

const EMPTY: string[] = [];
const listeners = new Set<() => void>();
const snapshotCache = new Map<string, { raw: string; value: string[] }>();

function keyFor(kind: LocalFlagKind, profileId: string) {
  return `megatv_web_${kind}_${profileId}`;
}

function read(kind: LocalFlagKind, profileId: string): string[] {
  if (typeof window === "undefined" || !profileId) return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(kind, profileId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(kind: LocalFlagKind, profileId: string): string[] {
  if (typeof window === "undefined" || !profileId) return EMPTY;
  const raw = window.localStorage.getItem(keyFor(kind, profileId)) || "";
  const cacheKey = keyFor(kind, profileId);
  const cached = snapshotCache.get(cacheKey);
  if (cached && cached.raw === raw) return cached.value;
  const value = read(kind, profileId);
  snapshotCache.set(cacheKey, { raw, value });
  return value;
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = () => callback();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function setFlag(kind: LocalFlagKind, profileId: string, mediaId: string, active: boolean) {
  if (typeof window === "undefined" || !profileId) return;
  const set = new Set(read(kind, profileId));
  if (active) set.add(mediaId);
  else set.delete(mediaId);
  try {
    window.localStorage.setItem(keyFor(kind, profileId), JSON.stringify([...set]));
  } catch {
    /* quota / private mode — non-fatal */
  }
  notify();
}

/** Reactive optimistic flag hook → `[active, toggle]`, localStorage-backed. */
export function useLocalFlag(kind: LocalFlagKind, profileId: string, mediaId: string): [boolean, () => void] {
  const flags = useSyncExternalStore(
    subscribe,
    () => getSnapshot(kind, profileId),
    () => EMPTY
  );
  const active = flags.includes(mediaId);
  const toggle = useCallback(() => setFlag(kind, profileId, mediaId, !active), [kind, profileId, mediaId, active]);
  return [active, toggle];
}
