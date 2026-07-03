import { gunzipSync } from "node:zlib";

/**
 * Simplified XMLTV "now / next" EPG for the web Live TV viewer.
 *
 * Deliberately lightweight (no full grid): we fetch the XMLTV once per epg URL,
 * keep only programmes overlapping a short window around "now", and derive a
 * now/next pair per channel (keyed by tvg-id). Results are cached in-process
 * with a TTL so we never re-fetch aggressively (Free Tier / bandwidth).
 */
export type EpgSlot = { title: string; start: number; stop: number };
export type EpgNowNext = { now: EpgSlot | null; next: EpgSlot | null };
export type EpgMap = Record<string, EpgNowNext>;

const FETCH_TIMEOUT_MS = 20000;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min
const MAX_BYTES = 60 * 1024 * 1024;
const WINDOW_PAST_MS = 60 * 60 * 1000; // keep programmes up to 1h in the past
const WINDOW_AHEAD_MS = 12 * 60 * 60 * 1000; // and 12h ahead
const MAX_PROGRAMMES = 200000;

type CacheEntry = { at: number; map: EpgMap };
const cache = new Map<string, CacheEntry>();

/** XMLTV timestamps: `YYYYMMDDHHMMSS +ZZZZ` (offset optional). */
function parseXmltvDate(value: string): number {
  const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{4})?/.exec(value.trim());
  if (!match) return NaN;
  const [, y, mo, d, h, mi, s, tz] = match;
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s || "00"}`;
  if (tz) {
    const sign = tz[0] === "-" ? "-" : "+";
    return Date.parse(`${iso}${sign}${tz.slice(1, 3)}:${tz.slice(3, 5)}`);
  }
  return Date.parse(`${iso}Z`);
}

function decodeEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .trim();
}

async function fetchXmltv(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "MegaTvWeb/1.0", accept: "*/*" },
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) throw new Error("EPG trop volumineux");
    // Handle raw gzip payloads (.xml.gz) that fetch does not auto-inflate.
    const gzipped = /\.gz($|\?)/i.test(url) || (buffer[0] === 0x1f && buffer[1] === 0x8b);
    return (gzipped ? gunzipSync(buffer) : buffer).toString("utf8");
  } finally {
    clearTimeout(timer);
  }
}

function parseNowNext(xml: string): EpgMap {
  const now = Date.now();
  const windowStart = now - WINDOW_PAST_MS;
  const windowEnd = now + WINDOW_AHEAD_MS;
  const byChannel = new Map<string, EpgSlot[]>();

  const programmeRe = /<programme\b([^>]*)>([\s\S]*?)<\/programme>/gi;
  let match: RegExpExecArray | null;
  let processed = 0;
  while ((match = programmeRe.exec(xml))) {
    if (++processed > MAX_PROGRAMMES) break;
    const attrs = match[1];
    const body = match[2];
    const channel = /channel="([^"]*)"/i.exec(attrs)?.[1];
    if (!channel) continue;
    const start = parseXmltvDate(/start="([^"]*)"/i.exec(attrs)?.[1] || "");
    const stop = parseXmltvDate(/stop="([^"]*)"/i.exec(attrs)?.[1] || "");
    if (!Number.isFinite(start) || !Number.isFinite(stop)) continue;
    if (stop < windowStart || start > windowEnd) continue; // outside the window
    const title = decodeEntities((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1] || "").replace(/<[^>]+>/g, ""));
    const list = byChannel.get(channel) || [];
    list.push({ title: title || "Programme", start, stop });
    byChannel.set(channel, list);
  }

  const out: EpgMap = {};
  for (const [channel, slots] of byChannel) {
    slots.sort((a, b) => a.start - b.start);
    const current = slots.find((slot) => slot.start <= now && slot.stop > now) || null;
    const upcoming = slots.find((slot) => slot.start > now) || null;
    out[channel] = { now: current, next: upcoming };
  }
  return out;
}

/** Returns a now/next map keyed by tvg-id. Never throws (returns {} on error). */
export async function loadEpgNowNext(epgUrl: string): Promise<EpgMap> {
  const url = epgUrl.trim();
  if (!url) return {};
  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.map;
  try {
    const xml = await fetchXmltv(url);
    const map = parseNowNext(xml);
    cache.set(url, { at: Date.now(), map });
    return map;
  } catch {
    // Best-effort: EPG is optional enrichment, never blocks the channel list.
    cache.set(url, { at: Date.now(), map: {} });
    return {};
  }
}
