import { requireUser } from "@/lib/auth/require-user";
import { isSafeRemoteUrl, safeFetch, verifyProxyToken } from "@/lib/web/stream-proxy";
import { toVtt } from "@/lib/web/subtitles";

export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 12000;
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Signed subtitle proxy: fetches an external subtitle file (CORS-blocked
 * origins), converts SRT → WebVTT, and serves it as `text/vtt` for a `<track>`.
 * Same signature scheme + SSRF guard as the stream proxy (not an open proxy).
 */
export async function GET(request: Request) {
  await requireUser("/web");

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url")?.trim() || "";
  const sig = searchParams.get("sig")?.trim() || "";

  if (!target || !verifyProxyToken(target, sig) || !isSafeRemoteUrl(target)) {
    return new Response("Forbidden", { status: 403 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const upstream = await safeFetch(target, {
      signal: controller.signal,
      headers: { "user-agent": "MegaTvWeb/1.0", accept: "*/*" },
      cache: "no-store"
    });
    if (!upstream.ok) return new Response(`Upstream ${upstream.status}`, { status: 502 });

    const len = Number(upstream.headers.get("content-length") || 0);
    if (len && len > MAX_BYTES) return new Response("Subtitle too large", { status: 413 });

    const raw = await readCapped(upstream, MAX_BYTES);
    if (raw === null) return new Response("Subtitle too large", { status: 413 });
    const vtt = toVtt(raw);
    return new Response(vtt, {
      status: 200,
      headers: { "content-type": "text/vtt; charset=utf-8", "cache-control": "public, max-age=3600" }
    });
  } catch {
    return new Response("Proxy error", { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}

/** Reads a response body as text, aborting if it exceeds `max` bytes (guards
 * against servers that omit content-length). Returns null when over the cap. */
async function readCapped(res: Response, max: number): Promise<string | null> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > max) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  }
  return new TextDecoder("utf-8").decode(concatChunks(chunks, total));
}

function concatChunks(chunks: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
