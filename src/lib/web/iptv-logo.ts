/**
 * Same-origin IPTV logo URLs — many playlist hosts block browser hotlinking
 * (Referer / User-Agent). Route through `/api/web/iptv/logo` (VLC UA).
 * Client-safe (no Node crypto imports).
 */
export function iptvLogoProxyUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/api/")) return trimmed;

  let absolute = trimmed;
  if (trimmed.startsWith("//")) absolute = `https:${trimmed}`;

  try {
    const parsed = new URL(absolute);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const host = parsed.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
      return null;
    }
  } catch {
    return null;
  }

  return `/api/web/iptv/logo?url=${encodeURIComponent(absolute)}`;
}
