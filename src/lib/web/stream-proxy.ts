import { createHmac, randomBytes } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Signed CORS/stream proxy helper.
 *
 * Security model (no open proxy / no SSRF):
 * - Only URLs signed by THIS server (HMAC) are proxied. A caller cannot point
 *   the proxy at an arbitrary host — the signature is minted server-side after
 *   the URL passed source resolution.
 * - `isSafeRemoteUrl` additionally blocks non-http(s) schemes and obvious
 *   private / loopback / link-local / metadata hosts (defence in depth against
 *   SSRF to internal addresses).
 *
 * The signing secret is `STREAM_PROXY_SECRET` when set, otherwise a per-process
 * random secret (still prevents open-proxy abuse — only URLs this instance
 * signed are accepted; they simply stop verifying after a restart).
 */
const SECRET = process.env.STREAM_PROXY_SECRET?.trim() || randomBytes(32).toString("hex");

if (!process.env.STREAM_PROXY_SECRET?.trim() && process.env.NODE_ENV === "production") {
  // Multi-instance Vercel: without a shared secret each instance signs with its
  // own ephemeral key → cross-instance proxy URLs intermittently 403. Set
  // STREAM_PROXY_SECRET in the environment for reliable playback.
  console.warn("[stream-proxy] STREAM_PROXY_SECRET is not set — proxy signatures won't verify across instances.");
}

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

/** Constant-time-ish comparison (short tokens; avoids early-exit leakage). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const PRIVATE_HOST_RE =
  /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|::1|\[::1\]|metadata\.google\.internal)/i;

function isPrivateIpv4(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function isSafeRemoteUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (!host) return false;
  if (PRIVATE_HOST_RE.test(host)) return false;
  if (isPrivateIpv4(host)) return false;
  if (host.endsWith(".local") || host.endsWith(".internal")) return false;
  return true;
}

/** Builds a same-origin proxied URL for a validated remote URL. Returns the
 * original url unchanged when it fails validation (caller decides fallback). */
export function proxyUrl(remoteUrl: string, kind: "m3u8" | "seg" = "seg"): string {
  if (!isSafeRemoteUrl(remoteUrl)) return remoteUrl;
  const token = sign(remoteUrl);
  const params = new URLSearchParams({ url: remoteUrl, sig: token, k: kind });
  return `/api/web/stream-proxy?${params.toString()}`;
}

export function verifyProxyToken(remoteUrl: string, token: string): boolean {
  if (!token) return false;
  return safeEqual(sign(remoteUrl), token);
}

/** Same-origin signed URL for an external subtitle file (fetched + converted to
 * WebVTT server-side to dodge CORS + SRT-only formats). */
export function subtitleProxyUrl(remoteUrl: string): string {
  if (!isSafeRemoteUrl(remoteUrl)) return remoteUrl;
  const token = sign(remoteUrl);
  return `/api/web/subtitle?${new URLSearchParams({ url: remoteUrl, sig: token }).toString()}`;
}

/** True for private/loopback/link-local/unique-local/metadata IP literals
 * (v4 + v6, incl. IPv4-mapped v6). Second layer of SSRF defence after the
 * hostname-shape check, applied to the *resolved* address. */
function isPrivateAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isPrivateIpv4(ip);
  if (family === 6) {
    const v6 = ip.toLowerCase();
    if (v6 === "::1" || v6 === "::") return true;
    if (v6.startsWith("fe80")) return true; // link-local
    if (v6.startsWith("fc") || v6.startsWith("fd")) return true; // unique-local fc00::/7
    const mapped = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(v6);
    if (mapped) return isPrivateIpv4(mapped[1]);
    return false;
  }
  return false;
}

/** Resolves the hostname and rejects it if ANY resolved address is private —
 * defends against DNS rebinding (public name → internal IP). */
async function hostResolvesSafe(hostname: string): Promise<boolean> {
  if (isIP(hostname)) return !isPrivateAddress(hostname);
  try {
    const records = await lookup(hostname, { all: true });
    if (records.length === 0) return false;
    return records.every((r) => !isPrivateAddress(r.address));
  } catch {
    return false;
  }
}

const MAX_REDIRECTS = 4;

/**
 * SSRF-hardened fetch for the stream/subtitle proxies:
 * - validates URL shape (`isSafeRemoteUrl`) AND resolved IP (`hostResolvesSafe`)
 *   at every hop;
 * - follows redirects manually (max {@link MAX_REDIRECTS}), re-validating each
 *   `Location` so a public origin can't 3xx the fetch into an internal host.
 */
export async function safeFetch(target: string, init: RequestInit): Promise<Response> {
  let current = target;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isSafeRemoteUrl(current)) throw new Error("unsafe url");
    if (!(await hostResolvesSafe(new URL(current).hostname))) throw new Error("unsafe host");
    const res = await fetch(current, { ...init, redirect: "manual" });
    const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!location) return res;
    current = new URL(location, current).toString();
  }
  throw new Error("too many redirects");
}
