"use client";

import { decodeMediaId } from "@/lib/web/media";

/**
 * Client-side lazy fetchers for TMDB title logos + trailer keys (P2 visual
 * parity). These power the landscape logo overlay, hero logo, and trailer-in-
 * poster / hero playback.
 *
 * Free Tier discipline: every result is cached twice — a process-lifetime module
 * `Map` (dedupes concurrent + repeat calls within a session) and `localStorage`
 * (survives reloads) — so a given title is asked for at most once. Nothing is
 * fetched until the user actually hovers/focuses the item.
 */

const logoMem = new Map<string, string | null>();
const trailerMem = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

const LOGO_LS = "megatv_web_logo_";
const TRAILER_LS = "megatv_web_trailer_";
const ENRICH_LS = "megatv_web_enrich_v2_";
const enrichMem = new Map<string, { title: string | null; backdropUrl: string | null }>();

function readLs(prefix: string, key: string): string | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(prefix + key);
    if (raw == null) return undefined;
    return JSON.parse(raw) as string | null;
  } catch {
    return undefined;
  }
}

function writeLs(prefix: string, key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(prefix + key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

async function resolve(
  mediaId: string,
  mem: Map<string, string | null>,
  lsPrefix: string,
  endpoint: string,
  field: "logo" | "key"
): Promise<string | null> {
  const ref = decodeMediaId(mediaId);
  if (!ref) return null;
  const key = `${ref.mediaType}-${ref.tmdbId}`;

  if (mem.has(key)) return mem.get(key) ?? null;

  const stored = readLs(lsPrefix, key);
  if (stored !== undefined) {
    mem.set(key, stored);
    return stored;
  }

  const existing = inflight.get(lsPrefix + key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(`${endpoint}?type=${ref.mediaType}&id=${ref.tmdbId}`);
      if (!res.ok) return null;
      const json = (await res.json()) as Record<string, string | null>;
      const value = json[field] ?? null;
      mem.set(key, value);
      writeLs(lsPrefix, key, value);
      return value;
    } catch {
      return null;
    } finally {
      inflight.delete(lsPrefix + key);
    }
  })();

  inflight.set(lsPrefix + key, promise);
  return promise;
}

/** TMDB title-logo URL for a web `mediaId` (cached), or null. */
export function fetchTitleLogo(mediaId: string): Promise<string | null> {
  return resolve(mediaId, logoMem, LOGO_LS, "/api/web/title-logo", "logo");
}

/** YouTube trailer key for a web `mediaId` (cached), or null. */
export function fetchTrailerKey(mediaId: string): Promise<string | null> {
  return resolve(mediaId, trailerMem, TRAILER_LS, "/api/web/trailer", "key");
}

/** Seeds the caches from a value already fetched server-side (hero first item). */
export function seedTitleLogo(mediaId: string, logo: string | null) {
  const ref = decodeMediaId(mediaId);
  if (!ref) return;
  const key = `${ref.mediaType}-${ref.tmdbId}`;
  if (!logoMem.has(key)) {
    logoMem.set(key, logo);
    writeLs(LOGO_LS, key, logo);
  }
}

export function seedTrailerKey(mediaId: string, trailerKey: string | null) {
  const ref = decodeMediaId(mediaId);
  if (!ref) return;
  const key = `${ref.mediaType}-${ref.tmdbId}`;
  if (!trailerMem.has(key)) {
    trailerMem.set(key, trailerKey);
    writeLs(TRAILER_LS, key, trailerKey);
  }
}

type CardEnrich = { title: string | null; backdropUrl: string | null };

/** TMDB title + backdrop for landscape cards (cached, one network read per title). */
export async function fetchCardEnrich(mediaId: string): Promise<CardEnrich> {
  const ref = decodeMediaId(mediaId);
  if (!ref) return { title: null, backdropUrl: null };
  const key = `${ref.mediaType}-${ref.tmdbId}`;
  if (enrichMem.has(key)) return enrichMem.get(key)!;

  const stored = typeof window !== "undefined" ? window.localStorage.getItem(ENRICH_LS + key) : null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as CardEnrich;
      enrichMem.set(key, parsed);
      return parsed;
    } catch {
      /* ignore */
    }
  }

  try {
    const res = await fetch(`/api/web/card-enrich?type=${ref.mediaType}&id=${ref.tmdbId}`);
    if (!res.ok) {
      return { title: null, backdropUrl: null };
    }
    const json = (await res.json()) as { title?: string; backdropUrl?: string | null };
    const value = {
      title: json.title?.trim() || null,
      backdropUrl: json.backdropUrl || null
    };
    if (value.backdropUrl || value.title) {
      enrichMem.set(key, value);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(ENRICH_LS + key, JSON.stringify(value));
        } catch {
          /* ignore */
        }
      }
    }
    return value;
  } catch {
    return { title: null, backdropUrl: null };
  }
}
