import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";

export type CatalogDiscoveryResult = {
  id: string;
  title: string;
  description: string | null;
  sourceType: "TRAKT" | "MDBLIST";
  sourceUrl: string;
  creatorName: string | null;
  creatorHandle: string | null;
  itemCount: number | null;
  likes: number | null;
  previewPosterUrls: string[];
};

type TraktListSearchRow = {
  list?: {
    name?: string;
    description?: string;
    privacy?: string;
    item_count?: number;
    likes?: number;
    updated_at?: string;
    user?: { username?: string; name?: string; ids?: { slug?: string } };
    ids?: { slug?: string };
    images?: { posters?: string[] };
  };
};

export async function GET(request: Request) {
  await requireUser("/companion");

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  if (query.length < 2) {
    return NextResponse.json({ results: [] as CatalogDiscoveryResult[], error: "Saisissez au moins 2 caractères" });
  }

  const [traktResults, mdblistResults] = await Promise.all([searchTraktLists(query), searchMdblistLists(query)]);
  const combined = [...traktResults, ...mdblistResults]
    .filter((item, index, all) => all.findIndex((x) => x.sourceUrl.toLowerCase() === item.sourceUrl.toLowerCase()) === index)
    .slice(0, 24);

  return NextResponse.json({ results: combined, error: combined.length === 0 ? "Aucune liste publique trouvée" : null });
}

async function searchTraktLists(query: string): Promise<CatalogDiscoveryResult[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return [];

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/trakt-proxy`;
  const url = new URL(endpoint);
  url.searchParams.set("path", "/search/list");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "40");
  url.searchParams.set("extended", "full");

  const response = await fetch(url.toString(), {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    next: { revalidate: 300 }
  });

  if (!response.ok) return [];

  const rows = (await response.json()) as TraktListSearchRow[];
  return rows
    .map((row) => {
      const list = row.list;
      if (!list || list.privacy?.toLowerCase() !== "public") return null;
      const userSlug = list.user?.ids?.slug || list.user?.username;
      const listSlug = list.ids?.slug;
      const title = list.name?.trim();
      if (!userSlug || !listSlug || !title) return null;
      const sourceUrl = `https://trakt.tv/users/${userSlug}/lists/${listSlug}`;
      return {
        id: `trakt:${userSlug}:${listSlug}`,
        title,
        description: list.description?.trim() || null,
        sourceType: "TRAKT" as const,
        sourceUrl,
        creatorName: list.user?.name?.trim() || null,
        creatorHandle: userSlug,
        itemCount: list.item_count ?? null,
        likes: list.likes ?? null,
        previewPosterUrls: (list.images?.posters || []).filter(Boolean).slice(0, 5)
      };
    })
    .filter(Boolean) as CatalogDiscoveryResult[];
}

async function searchMdblistLists(query: string): Promise<CatalogDiscoveryResult[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(`https://mdblist.com/toplists/?public_list_name=${encoded}&preferences=bot_test_message`, {
    headers: { "User-Agent": "MegaCompagnon" },
    next: { revalidate: 300 }
  });
  if (!response.ok) return [];

  const html = await response.text();
  const cards = [...html.matchAll(/<article class="related-list-card"[\s\S]*?<\/article>/g)];
  return cards
    .map((match) => parseMdblistCard(match[0]))
    .filter(Boolean)
    .slice(0, 12) as CatalogDiscoveryResult[];
}

function parseMdblistCard(html: string): CatalogDiscoveryResult | null {
  const titleMatch = html.match(/class="related-list-meta__title[^"]*">\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)</i);
  if (!titleMatch) return null;
  const href = titleMatch[1];
  const title = titleMatch[2].trim();
  if (!title) return null;
  const sourceUrl = href.startsWith("http") ? href : `https://mdblist.com${href.startsWith("/") ? href : `/${href}`}`;
  const posters = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]).filter((src) => src.includes("poster") || src.includes("image")).slice(0, 5);
  return {
    id: `mdblist:${sourceUrl}`,
    title,
    description: null,
    sourceType: "MDBLIST",
    sourceUrl,
    creatorName: null,
    creatorHandle: null,
    itemCount: null,
    likes: null,
    previewPosterUrls: posters
  };
}
