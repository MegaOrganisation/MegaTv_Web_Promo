/** Guide « Ce soir » via TVMaze schedule (gratuit, sans clé). */

export type TonightCountry = "FR" | "BE" | "CH" | "CA" | "US" | "GB" | "DE" | "ES" | "IT";

export const TONIGHT_COUNTRIES: Array<{ id: TonightCountry; label: string }> = [
  { id: "FR", label: "France" },
  { id: "BE", label: "Belgique" },
  { id: "CH", label: "Suisse" },
  { id: "CA", label: "Canada" },
  { id: "US", label: "États-Unis" },
  { id: "GB", label: "Royaume-Uni" },
  { id: "DE", label: "Allemagne" },
  { id: "ES", label: "Espagne" },
  { id: "IT", label: "Italie" }
];

/** Chaînes prioritaires (2–3 affichées + buffer pour le filtre). */
export const MAJOR_NETWORKS: Record<TonightCountry, string[]> = {
  FR: ["TF1", "France 2", "France 3", "M6", "Canal+", "France 5", "Arte", "TMC", "W9"],
  BE: ["La Une", "Tipik", "RTL-TVI", "AB3"],
  CH: ["RTS Un", "RTS Deux", "SRF 1", "TF1"],
  CA: ["CBC Television", "CTV", "TVA", "Global"],
  US: ["NBC", "ABC", "CBS", "FOX", "The CW"],
  GB: ["BBC One", "BBC Two", "ITV1", "ITV", "Channel 4", "Channel 5"],
  DE: ["Das Erste", "ZDF", "RTL", "Sat.1"],
  ES: ["La 1", "Antena 3", "Telecinco", "La Sexta"],
  IT: ["Rai 1", "Rai 2", "Canale 5", "Italia 1"]
};

export type TonightProgram = {
  id: string;
  title: string;
  network: string;
  airtime: string;
  runtime: number | null;
  season: number | null;
  episode: number | null;
  summary: string | null;
  posterUrl: string | null;
  tmdbId: number | null;
  mediaType: "tv";
};

type TvMazeEpisode = {
  id: number;
  name?: string;
  season?: number;
  number?: number;
  airtime?: string;
  airdate?: string;
  runtime?: number | null;
  summary?: string | null;
  show?: {
    id: number;
    name?: string;
    type?: string | null;
    summary?: string | null;
    externals?: { tmdb?: number | null } | null;
    image?: { medium?: string | null; original?: string | null } | null;
    network?: { name?: string | null } | null;
    webChannel?: { name?: string | null } | null;
  } | null;
};

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function networkRank(country: TonightCountry, name: string): number {
  const list = MAJOR_NETWORKS[country];
  const idx = list.findIndex(
    (n) => name.toLowerCase() === n.toLowerCase() || name.toLowerCase().includes(n.toLowerCase())
  );
  return idx >= 0 ? idx : 999;
}

function isEvening(airtime: string | undefined): boolean {
  if (!airtime || !/^\d{1,2}:\d{2}$/.test(airtime)) return true;
  const [h] = airtime.split(":").map(Number);
  return h >= 17 || h < 2;
}

function dayOffsetIso(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function isTonightCountry(value: string): value is TonightCountry {
  return TONIGHT_COUNTRIES.some((c) => c.id === value);
}

async function fetchScheduleRaw(country: TonightCountry, date: string): Promise<TvMazeEpisode[]> {
  const url = `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(date)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MegaTv-Companion" },
    next: { revalidate: 900 }
  });
  if (!res.ok) return [];
  return (await res.json()) as TvMazeEpisode[];
}

function mapEpisodes(rows: TvMazeEpisode[]): TonightProgram[] {
  const mapped: TonightProgram[] = [];
  for (const ep of rows) {
    const show = ep.show;
    if (!show?.name) continue;
    const network = show.network?.name || show.webChannel?.name || "";
    if (!network) continue;
    if (!isEvening(ep.airtime)) continue;
    const tmdbRaw = show.externals?.tmdb;
    const tmdbId = typeof tmdbRaw === "number" && tmdbRaw > 0 ? tmdbRaw : null;
    mapped.push({
      id: `tvmaze-${ep.id}`,
      title: show.name,
      network,
      airtime: ep.airtime || "—",
      runtime: ep.runtime ?? null,
      season: ep.season ?? null,
      episode: ep.number ?? null,
      summary: stripHtml(ep.summary || show.summary),
      posterUrl: show.image?.original || show.image?.medium || null,
      tmdbId,
      mediaType: "tv"
    });
  }
  return mapped;
}

function pickTopNetworks(programs: TonightProgram[], country: TonightCountry, limit = 3): string[] {
  const preferred = MAJOR_NETWORKS[country]
    .filter((n) => programs.some((p) => p.network.toLowerCase().includes(n.toLowerCase())))
    .slice(0, limit);
  if (preferred.length >= Math.min(2, limit)) return preferred;

  const counts = new Map<string, number>();
  for (const p of programs) counts.set(p.network, (counts.get(p.network) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || networkRank(country, a[0]) - networkRank(country, b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}

export async function fetchTonightPrograms(country: TonightCountry, date?: string): Promise<TonightProgram[]> {
  const dates = date ? [date] : [dayOffsetIso(0), dayOffsetIso(-1), dayOffsetIso(-2)];
  let rows: TvMazeEpisode[] = [];
  for (const day of dates) {
    rows = await fetchScheduleRaw(country, day);
    if (rows.length > 0) break;
  }

  // US etc. : tenter aussi le filtre primetime si volume élevé
  if (rows.length > 40 && !date) {
    const day = rows[0]?.airdate || dayOffsetIso(0);
    const url = `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(day)}&filter=primetime`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "MegaTv-Companion" },
        next: { revalidate: 900 }
      });
      if (res.ok) {
        const prime = (await res.json()) as TvMazeEpisode[];
        if (prime.length >= 3) rows = prime;
      }
    } catch {
      /* keep rows */
    }
  }

  const mapped = mapEpisodes(rows);
  const topNets = pickTopNetworks(mapped, country, 3);
  const filtered = mapped.filter((p) => topNets.some((n) => p.network.toLowerCase().includes(n.toLowerCase())));

  filtered.sort((a, b) => {
    const na = topNets.findIndex((n) => a.network.toLowerCase().includes(n.toLowerCase()));
    const nb = topNets.findIndex((n) => b.network.toLowerCase().includes(n.toLowerCase()));
    if (na !== nb) return na - nb;
    return a.airtime.localeCompare(b.airtime);
  });

  const seen = new Set<string>();
  const unique: TonightProgram[] = [];
  for (const p of filtered) {
    const key = `${p.network}|${p.title}|${p.airtime}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }
  return unique.slice(0, 24);
}
