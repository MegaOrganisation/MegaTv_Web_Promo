import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";

/**
 * A poster with (when available) its clickable media identity. `mediaId` uses
 * the web route encoding (`movie-<id>` / `tv-<id>`) so `/web` rails can link to
 * `/web/details`. Trakt + direct TMDB refs expose ids; MDBList scraping does not
 * (posters only) → `mediaId` stays null and those tiles remain visual.
 */
type PreviewItem = { posterUrl: string; mediaId: string | null; title: string | null };
type PreviewResult = {
  title: string;
  posterUrl: string | null;
  posterUrls: string[];
  items?: PreviewItem[];
  hint: string | null;
};

/** Ensures `items` always exists (falls back to posterUrls without identity). */
function withItems(result: PreviewResult): PreviewResult {
  if (result.items) return result;
  return { ...result, items: result.posterUrls.map((posterUrl) => ({ posterUrl, mediaId: null, title: null })) };
}

export async function GET(request: Request) {
  await requireUser("/companion");

  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get("url")?.trim() || "";
  const title = searchParams.get("title")?.trim() || "Catalogue";

  if (!sourceUrl) {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  // Route by *validated host* (never substring): `http://169.254.169.254/mdblist.com`
  // must NOT be treated as MDBList and server-fetched (SSRF guard).
  if (hostMatches(sourceUrl, "mdblist.com")) {
    return NextResponse.json(withItems(await previewMdblist(sourceUrl, title)));
  }

  if (hostMatches(sourceUrl, "trakt.tv")) {
    return NextResponse.json(withItems(await previewTrakt(sourceUrl, title)));
  }

  const tmdbMatch = sourceUrl.match(/tmdb:(movie|tv):(\d+)/i);
  if (tmdbMatch) {
    const mediaType = tmdbMatch[1].toLowerCase() === "tv" ? "tv" : "movie";
    const tmdbId = Number(tmdbMatch[2]);
    const res = await fetch(`${new URL(request.url).origin}/api/tmdb/enrich?media_type=${mediaType}&tmdb_id=${tmdbId}`, {
      headers: request.headers
    });
    if (res.ok) {
      const json = await res.json();
      const mediaId = `${mediaType}-${tmdbId}`;
      return NextResponse.json({
        title: json.title || title,
        posterUrl: json.posterUrl,
        posterUrls: json.posterUrl ? [json.posterUrl] : [],
        items: json.posterUrl ? [{ posterUrl: json.posterUrl, mediaId, title: json.title || null }] : [],
        hint: null
      } satisfies PreviewResult);
    }
  }

  return NextResponse.json({
    title,
    posterUrl: null,
    posterUrls: [] as string[],
    items: [],
    hint: "Aperçu disponible pour les listes MDBList, Trakt ou références TMDB."
  } satisfies PreviewResult);
}

async function previewMdblist(sourceUrl: string, title: string) {
  const parsed = new URL(sourceUrl);
  const appendParams = new URLSearchParams({
    append: "yes",
    filter: "",
    new_items: "false",
    show_hidden: "false",
    item_filter: "",
    mediatype: "",
    sort: "srank",
    sortorder: "asc",
    q_current_page: "0"
  });
  const appendUrl = `${parsed.origin}${parsed.pathname}?${appendParams.toString()}`;

  const response = await fetch(appendUrl, {
    headers: { "User-Agent": "MegaCompagnon", Accept: "text/html" },
    next: { revalidate: 600 }
  });

  if (!response.ok) {
    return { title, posterUrl: null, posterUrls: [] as string[], hint: "Impossible de charger la liste MDBList." };
  }

  const html = await response.text();
  const posterUrls = [...html.matchAll(/class="[^"]*poster-card[^"]*"[^>]+src="([^"]+)"/gi)]
    .map((match) => normalizePosterUrl(match[1]))
    .filter((url) => /image\.tmdb\.org/i.test(url))
    .filter((url, index, all) => all.indexOf(url) === index)
    .slice(0, 8);

  if (posterUrls.length === 0) {
    const fallback = [...html.matchAll(/<img[^>]+(?:data-src|src)="([^"]+)"[^>]*>/gi)]
      .map((match) => normalizePosterUrl(match[1]))
      .filter((url) => /poster|image\.tmdb/i.test(url))
      .filter((url, index, all) => all.indexOf(url) === index)
      .slice(0, 8);
    posterUrls.push(...fallback);
  }

  const pageTitle = html.match(/class="header movie-title"[^>]*title="([^"]+)"/i)?.[1]?.trim();
  const items = buildMdblistItems(html, posterUrls);

  return {
    title: pageTitle || title,
    posterUrl: posterUrls[0] || null,
    posterUrls,
    items,
    hint: posterUrls.length ? null : "Liste MDBList détectée — posters non exposés sur cette page."
  };
}

/** Pair TMDB refs + optional titles with poster URLs (same order). */
function buildMdblistItems(html: string, posterUrls: string[]): PreviewItem[] {
  const refs: Array<{ mediaType: "movie" | "tv"; tmdbId: number }> = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/(?:mdblist\.com\/title\/|themoviedb\.org\/)(movie|tv)\/(\d+)/gi)) {
    const mediaType = match[1].toLowerCase() === "tv" ? "tv" : "movie";
    const tmdbId = Number(match[2]);
    const key = `${mediaType}-${tmdbId}`;
    if (!Number.isInteger(tmdbId) || seen.has(key)) continue;
    seen.add(key);
    refs.push({ mediaType, tmdbId });
  }

  const titlesByPoster = extractMdblistPosterTitles(html);

  return posterUrls.map((posterUrl, index) => {
    const ref = refs[index];
    return {
      posterUrl,
      mediaId: ref ? `${ref.mediaType}-${ref.tmdbId}` : null,
      title: titlesByPoster.get(posterUrl) || null
    };
  });
}

/** Reads `alt` on poster-card images when MDBList exposes a title. */
function extractMdblistPosterTitles(html: string): Map<string, string> {
  const titles = new Map<string, string>();
  for (const match of html.matchAll(
    /<img[^>]*class="[^"]*poster-card[^"]*"[^>]*>/gi
  )) {
    const tag = match[0];
    const src = tag.match(/\bsrc="([^"]+)"/i)?.[1];
    const alt = tag.match(/\balt="([^"]+)"/i)?.[1]?.trim();
    if (!src || !alt || /^(poster|backdrop)$/i.test(alt)) continue;
    const posterUrl = normalizePosterUrl(src);
    if (posterUrl && !titles.has(posterUrl)) titles.set(posterUrl, alt);
  }
  return titles;
}

async function previewTrakt(sourceUrl: string, title: string) {
  const match = sourceUrl.match(/trakt\.tv\/users\/([^/]+)\/lists\/([^/?#]+)/i);
  if (!match) {
    return { title, posterUrl: null, posterUrls: [] as string[], hint: "URL Trakt invalide." };
  }

  const [, userSlug, listSlug] = match;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return { title, posterUrl: null, posterUrls: [] as string[], hint: "Proxy Trakt indisponible." };
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/trakt-proxy`;
  const url = new URL(endpoint);
  url.searchParams.set("path", `/users/${userSlug}/lists/${listSlug}/items`);
  url.searchParams.set("extended", "images");
  url.searchParams.set("limit", "8");

  const response = await fetch(url.toString(), {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    next: { revalidate: 600 }
  });

  if (!response.ok) {
    return { title, posterUrl: null, posterUrls: [] as string[], hint: "Impossible de charger la liste Trakt." };
  }

  const rows = (await response.json()) as Array<{
    type?: string;
    movie?: { title?: string; ids?: { tmdb?: number }; images?: { poster?: { full?: string } } };
    show?: { title?: string; ids?: { tmdb?: number }; images?: { poster?: { full?: string } } };
  }>;

  const items: PreviewItem[] = rows
    .map((row) => {
      const isShow = (row.type || "").toLowerCase() === "show" || Boolean(row.show);
      const entry = isShow ? row.show : row.movie;
      const poster = entry?.images?.poster?.full;
      if (!poster) return null;
      const tmdb = entry?.ids?.tmdb;
      return {
        posterUrl: normalizePosterUrl(poster),
        mediaId: tmdb ? `${isShow ? "tv" : "movie"}-${tmdb}` : null,
        title: entry?.title?.trim() || null
      } satisfies PreviewItem;
    })
    .filter((item): item is PreviewItem => item != null)
    .slice(0, 8);

  const posterUrls = items.map((item) => item.posterUrl);
  const firstTitle = rows[0]?.movie?.title || rows[0]?.show?.title;

  return {
    title: firstTitle ? `${title} · ${firstTitle}` : title,
    posterUrl: posterUrls[0] || null,
    posterUrls,
    items,
    hint: posterUrls.length ? null : "Liste Trakt chargée sans images poster."
  };
}

/** True only when `sourceUrl` is an http(s) URL whose host is exactly `domain`
 * or a subdomain of it — parsed, not substring-matched (SSRF-safe routing). */
function hostMatches(sourceUrl: string, domain: string): boolean {
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

function normalizePosterUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http")) return trimmed;
  return `https://${trimmed}`;
}
