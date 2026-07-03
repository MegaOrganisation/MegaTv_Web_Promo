import { requireUser } from "@/lib/auth/require-user";
import { isSafeRemoteUrl, proxyUrl, safeFetch, verifyProxyToken } from "@/lib/web/stream-proxy";

export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 20000;

/**
 * Signed CORS/stream proxy for remote HLS/HTTP media the browser can't reach
 * directly (CORS-blocked origins). Only URLs signed by this server are served
 * (see `stream-proxy.ts`) — not an open proxy, and private/internal hosts are
 * rejected (SSRF guard).
 *
 * - `k=m3u8` → fetch the manifest and rewrite child variant/segment/key URIs
 *   back through this proxy (so segments load without CORS too).
 * - `k=seg`  → stream bytes through, forwarding Range for seeking.
 *
 * Out of scope: remuxing raw MPEG-TS (`.ts` container that isn't HLS) into a
 * browser-playable stream — that needs a transcoder, not a proxy.
 */
export async function GET(request: Request) {
  await requireUser("/web");

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url")?.trim() || "";
  const sig = searchParams.get("sig")?.trim() || "";
  const kind = searchParams.get("k") === "m3u8" ? "m3u8" : "seg";

  if (!target || !verifyProxyToken(target, sig) || !isSafeRemoteUrl(target)) {
    return new Response("Forbidden", { status: 403 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const range = request.headers.get("range");
    const upstream = await safeFetch(target, {
      signal: controller.signal,
      headers: {
        // Present as VLC: many IPTV/Xtream panels reject non-player UAs (HTTP 884).
        "user-agent": "VLC/3.0.20 LibVLC/3.0.20",
        accept: "*/*",
        ...(range ? { range } : {})
      },
      cache: "no-store"
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response(`Upstream ${upstream.status}`, { status: 502 });
    }

    if (kind === "m3u8") {
      const text = await upstream.text();
      const rewritten = rewriteManifest(text, target);
      return new Response(rewritten, {
        status: 200,
        headers: {
          "content-type": "application/vnd.apple.mpegurl",
          "cache-control": "no-store"
        }
      });
    }

    const headers = new Headers();
    const passthrough = ["content-type", "content-length", "content-range", "accept-ranges", "etag"];
    for (const name of passthrough) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (!headers.has("content-type")) headers.set("content-type", "application/octet-stream");
    if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
    headers.set("cache-control", "no-store");

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response("Proxy error", { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}

/** Rewrites relative/absolute child URIs in an HLS manifest to signed proxy URLs. */
function rewriteManifest(text: string, manifestUrl: string): string {
  const base = manifestUrl;

  const resolve = (uri: string): string => {
    try {
      const abs = new URL(uri, base).toString();
      if (!isSafeRemoteUrl(abs)) return uri;
      const isPlaylist = /\.m3u8(\?|$)/i.test(abs);
      return proxyUrl(abs, isPlaylist ? "m3u8" : "seg");
    } catch {
      return uri;
    }
  };

  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      // Rewrite URI="..." attributes on tag lines (EXT-X-KEY / MEDIA / MAP …).
      if (trimmed.startsWith("#")) {
        if (/URI="/i.test(trimmed)) {
          return line.replace(/URI="([^"]+)"/gi, (_m, uri) => `URI="${resolve(uri)}"`);
        }
        return line;
      }

      // A bare line is a segment or variant playlist URI.
      return resolve(trimmed);
    })
    .join("\n");
}
