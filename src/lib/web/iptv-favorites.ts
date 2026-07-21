"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * IPTV favorites store for the web Live TV viewer (P2).
 *
 * Free Tier + profile isolation:
 * - Favorites are an ordered list of channel ids, kept authoritatively in
 *   `localStorage`, profile-scoped (`megatv_web_iptv_fav_<profileId>`).
 * - Toggles/reorders are instant + zero network. The cloud batch push
 *   (`/api/web/iptv/favorites`) is fired ONCE on exit/debounce by the caller,
 *   never per toggle. Anti-wipe is enforced server-side.
 * - Every key is scoped by the *emitted* profile id (no shared singleton).
 */
const EVENT = "megatv-web-iptv-fav";
const keyFor = (profileId: string) => `megatv_web_iptv_fav_${profileId}`;

function read(profileId: string): string[] {
  if (typeof window === "undefined" || !profileId) return [];
  try {
    const raw = window.localStorage.getItem(keyFor(profileId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function write(profileId: string, ids: string[]) {
  if (typeof window === "undefined" || !profileId) return;
  try {
    window.localStorage.setItem(keyFor(profileId), JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

const EMPTY: string[] = [];
const snapshotCache = new Map<string, { raw: string; value: string[] }>();

function getSnapshot(id: string): string[] {
  if (typeof window === "undefined" || !id) return EMPTY;
  const raw = window.localStorage.getItem(keyFor(id)) || "";
  const cached = snapshotCache.get(id);
  if (cached && cached.raw === raw) return cached.value;
  const value = read(id);
  snapshotCache.set(id, { raw, value });
  return value;
}

/** Seeds local favorites from the cloud read ONLY when local is still empty. */
export function seedFavoritesIfEmpty(profileId: string | null, cloudIds: string[]) {
  if (!profileId || typeof window === "undefined") return;
  if (window.localStorage.getItem(keyFor(profileId))) return;
  if (cloudIds.length === 0) return;
  write(profileId, cloudIds);
}

export function useIptvFavorites(profileId: string | null) {
  const id = profileId || "";

  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = () => onChange();
      const onStorage = (event: StorageEvent) => {
        if (event.key === keyFor(id)) onChange();
      };
      window.addEventListener(EVENT, handler);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(EVENT, handler);
        window.removeEventListener("storage", onStorage);
      };
    },
    [id]
  );

  const favorites = useSyncExternalStore(subscribe, () => getSnapshot(id), () => EMPTY);

  const toggle = useCallback(
    (channelId: string) => {
      if (!id || !channelId) return;
      const current = getSnapshot(id);
      write(id, current.includes(channelId) ? current.filter((x) => x !== channelId) : [...current, channelId]);
    },
    [id]
  );

  const reorder = useCallback(
    (nextOrder: string[]) => {
      if (!id) return;
      write(id, nextOrder);
    },
    [id]
  );

  const setAll = useCallback(
    (ids: string[]) => {
      if (!id) return;
      const seen = new Set<string>();
      const clean = ids.filter((x) => typeof x === "string" && x.trim() && !seen.has(x) && (seen.add(x), true));
      write(id, clean);
    },
    [id]
  );

  return { favorites, toggle, reorder, setAll };
}
