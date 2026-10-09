import { isSafeRemoteUrl, safeFetch } from "@/lib/web/stream-proxy";

export type ProbeVerdict = "playable" | "unplayable" | "unknown";

const PROBE_TIMEOUT_MS = 4500;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const PLAYABLE_CT =
  /mpegurl|application\/vnd\.apple\.mpegurl|video\/mp4|video\/webm|audio\/mp4|video\/x-m4v|application\/mp4/i;
const UNPLAYABLE_CT =
  /matroska|video\/x-msvideo|video\/avi|video\/x-ms-wmv|video\/x-flv|video\/quicktime|application\/x-rar|application\/zip/i;

/** True when URL / filename clearly looks like a browser-friendly container. */
export function looksBrowserFriendly(url: string, filename?: string | null): boolean {
  const text = `${url} ${filename || ""}`;
  return /\.(m3u8|mp4|m4v|webm)(\?|$)/i.test(text) || /\.(m3u8|mp4|m4v|webm)\b/i.test(text);
}

/** True when URL / filename is a container browsers typically cannot decode. */
export function looksBrowserHostile(url: string, filename?: string | null): boolean {
  const text = `${url} ${filename || ""}`;
  return /\.(mkv|avi|wmv|flv|ts|m2ts|mpg|mpeg|mov|iso|rar|zip)(\?|$)/i.test(text) ||
    /\.(mkv|avi|wmv|flv|m2ts)\b/i.test(text);
}

/**
 * Sniff Content-Type + magic bytes (Range 0–63) to decide if a remote URL is
 * likely playable in an HTML5 `<video>` (MP4 / WebM / HLS) vs MKV/AVI/etc.
 */
export async function probeBrowserPlayable(url: string): Promise<ProbeVerdict> {
  if (!isSafeRemoteUrl(url)) return "unplayable";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await safeFetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": BROWSER_UA,
        accept: "*/*",
        range: "bytes=0-63"
      },
      cache: "no-store"
    });

    if (!res.ok && res.status !== 206) return "unknown";

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const cd = (res.headers.get("content-disposition") || "").toLowerCase();
    const nameHint = `${url} ${cd}`;

    if (UNPLAYABLE_CT.test(ct) || looksBrowserHostile(url, cd)) return "unplayable";
    if (PLAYABLE_CT.test(ct) || looksBrowserFriendly(url, cd)) return "playable";

    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length >= 4) {
      // EBML → Matroska / WebM. WebM also starts with EBML; distinguish via DocType.
      if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
        const ascii = new TextDecoder("latin1").decode(buf);
        if (/webm/i.test(ascii)) return "playable";
        return "unplayable"; // typically MKV
      }
      // ISO BMFF (`….ftyp`) → MP4 / M4V / MOV
      if (buf.length >= 8) {
        const brand = String.fromCharCode(buf[4], buf[5], buf[6], buf[7]);
        if (brand === "ftyp") {
          // QuickTime `qt  ` is often not HTML5-friendly.
          const major = String.fromCharCode(buf[8] || 0, buf[9] || 0, buf[10] || 0, buf[11] || 0);
          if (major.startsWith("qt")) return "unplayable";
          return "playable";
        }
      }
      const head = new TextDecoder().decode(buf.subarray(0, Math.min(buf.length, 16)));
      if (head.startsWith("#EXTM3U")) return "playable";
      // MPEG-TS sync byte — not playable as progressive progressive without HLS remux.
      if (buf[0] === 0x47) return "unplayable";
    }

    if (/octet-stream|binary/i.test(ct) && looksBrowserHostile(nameHint)) return "unplayable";
    return "unknown";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

/** Probe many URLs with a small concurrency cap (Free Tier / debrid friendly). */
export async function probeBrowserPlayableMany(
  urls: string[],
  options?: { concurrency?: number; limit?: number }
): Promise<Map<string, ProbeVerdict>> {
  const concurrency = options?.concurrency ?? 5;
  const limit = options?.limit ?? 16;
  const targets = urls.slice(0, limit);
  const out = new Map<string, ProbeVerdict>();
  let index = 0;

  async function worker() {
    while (index < targets.length) {
      const current = targets[index];
      index += 1;
      out.set(current, await probeBrowserPlayable(current));
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, () => worker()));
  return out;
}
