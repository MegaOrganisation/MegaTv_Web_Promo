"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * MegaTv Web client preferences (P1).
 *
 * Free Tier rule: prefs live in `localStorage` first (zero network). Profile
 * isolation rule: every key is scoped by the *emitted* profile id, never a
 * shared mutable singleton. Cloud batch push is deferred to P2/P3 (see
 * `megatv_web_client.md`); this module is the single source of truth locally.
 */
export type WebLayout = "poster" | "landscape";
/** Desktop shell: vertical hover-expand rail vs horizontal top-left pill dock (AppTopBar parity). */
export type WebNavLayout = "vertical" | "horizontal";

export type WebPrefs = {
  layout: WebLayout;
  navLayout: WebNavLayout;
  trailerAutoplay: boolean;
  trailerSound: boolean;
  language: string;
};

export const WEB_PREFS_DEFAULTS: WebPrefs = {
  layout: "poster",
  navLayout: "vertical",
  trailerAutoplay: true,
  trailerSound: false,
  language: "fr"
};

const EVENT = "megatv-web-prefs";
const keyFor = (profileId: string) => `megatv_web_prefs_${profileId}`;

function readPrefs(profileId: string): WebPrefs {
  if (typeof window === "undefined" || !profileId) return WEB_PREFS_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(keyFor(profileId));
    if (!raw) return WEB_PREFS_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<WebPrefs>;
    return {
      layout: parsed.layout === "landscape" ? "landscape" : "poster",
      navLayout: parsed.navLayout === "horizontal" ? "horizontal" : "vertical",
      trailerAutoplay: parsed.trailerAutoplay ?? WEB_PREFS_DEFAULTS.trailerAutoplay,
      trailerSound: parsed.trailerSound ?? WEB_PREFS_DEFAULTS.trailerSound,
      language: typeof parsed.language === "string" ? parsed.language : WEB_PREFS_DEFAULTS.language
    };
  } catch {
    return WEB_PREFS_DEFAULTS;
  }
}

function writePrefs(profileId: string, prefs: WebPrefs) {
  if (typeof window === "undefined" || !profileId) return;
  try {
    window.localStorage.setItem(keyFor(profileId), JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

// Snapshot cache so `getSnapshot` returns a stable reference until the stored
// value actually changes (required by useSyncExternalStore to avoid loops).
const snapshotCache = new Map<string, { raw: string; value: WebPrefs }>();

function getSnapshot(id: string): WebPrefs {
  if (typeof window === "undefined" || !id) return WEB_PREFS_DEFAULTS;
  const raw = window.localStorage.getItem(keyFor(id)) || "";
  const cached = snapshotCache.get(id);
  if (cached && cached.raw === raw) return cached.value;
  const value = readPrefs(id);
  snapshotCache.set(id, { raw, value });
  return value;
}

/**
 * Reactive prefs hook — reads localStorage for the given profile and stays in
 * sync across components/tabs via useSyncExternalStore. `update` persists a
 * partial patch immediately (localStorage-first, no network).
 */
export function useWebPrefs(profileId: string | null) {
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

  const prefs = useSyncExternalStore(
    subscribe,
    () => getSnapshot(id),
    () => WEB_PREFS_DEFAULTS
  );

  const update = useCallback(
    (patch: Partial<WebPrefs>) => {
      if (!id) return;
      writePrefs(id, { ...getSnapshot(id), ...patch });
    },
    [id]
  );

  return { prefs, update };
}
