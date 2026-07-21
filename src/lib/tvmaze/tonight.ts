/**
 * Guide « Ce soir » — FR : XMLTV TNT (xmltvfr) ; autres pays : TVMaze.
 * Jamais de fallback TMDB qui invente des réseaux (ex. Mushoku Tensei sur TF1).
 */

import { fetchFrXmltvGuide, FR_EXTRA_CHANNEL_IDS, FR_GUIDE_CHANNELS } from "@/lib/tvguide/xmltv-fr";

export type TonightCountry = "FR" | "BE" | "CH" | "CA" | "US" | "GB" | "DE" | "ES" | "IT";

export const TONIGHT_COUNTRIES: Array<{ id: TonightCountry; label: string; flag: string; flagSrc: string }> = [
  { id: "FR", label: "France", flag: "🇫🇷", flagSrc: "https://flagcdn.com/w40/fr.png" },
  { id: "BE", label: "Belgique", flag: "🇧🇪", flagSrc: "https://flagcdn.com/w40/be.png" },
  { id: "CH", label: "Suisse", flag: "🇨🇭", flagSrc: "https://flagcdn.com/w40/ch.png" },
  { id: "CA", label: "Canada", flag: "🇨🇦", flagSrc: "https://flagcdn.com/w40/ca.png" },
  { id: "US", label: "États-Unis", flag: "🇺🇸", flagSrc: "https://flagcdn.com/w40/us.png" },
  { id: "GB", label: "Royaume-Uni", flag: "🇬🇧", flagSrc: "https://flagcdn.com/w40/gb.png" },
  { id: "DE", label: "Allemagne", flag: "🇩🇪", flagSrc: "https://flagcdn.com/w40/de.png" },
  { id: "ES", label: "Espagne", flag: "🇪🇸", flagSrc: "https://flagcdn.com/w40/es.png" },
  { id: "IT", label: "Italie", flag: "🇮🇹", flagSrc: "https://flagcdn.com/w40/it.png" }
];

/** Réseaux majeurs par pays — strip logos Programme (ordre d’affichage). */
export const MAJOR_NETWORKS: Record<TonightCountry, string[]> = {
  FR: FR_GUIDE_CHANNELS.map((c) => c.name),
  BE: ["La Une", "Tipik", "La Trois", "RTL-TVI", "Club RTL", "Plug RTL", "AB3", "ABXplore", "Canvas", "één", "VTM", "Play4"],
  CH: ["RTS Un", "RTS Deux", "RTS Info", "SRF 1", "SRF zwei", "SRF info", "RSI LA 1", "RSI LA 2", "TF1", "M6", "France 2"],
  CA: ["CBC Television", "CTV", "TVA", "Global", "Citytv", "Télé-Québec", "Noovo", "ICI Radio-Canada Télé", "TSN", "Sportsnet"],
  US: ["NBC", "ABC", "CBS", "FOX", "The CW", "PBS", "USA Network", "TNT", "TBS", "FX", "HBO", "AMC", "Disney Channel", "Nickelodeon", "Cartoon Network", "ESPN", "CNN", "MSNBC", "Fox News Channel"],
  GB: ["BBC One", "BBC Two", "BBC Three", "BBC Four", "ITV1", "ITV", "ITV2", "ITV3", "ITV4", "Channel 4", "Channel 5", "Sky One", "Sky Max", "Sky Atlantic", "E4", "Film4"],
  DE: ["Das Erste", "ZDF", "RTL", "Sat.1", "ProSieben", "VOX", "kabel eins", "RTL II", "NITRO", "SUPER RTL", "Disney Channel", "ARD", "3sat", "Phoenix"],
  ES: ["La 1", "La 2", "Antena 3", "Cuatro", "Telecinco", "La Sexta", "Canal Sur", "TV3", "Telemadrid", "Clan", "Neox", "Nova", "Energy"],
  IT: ["Rai 1", "Rai 2", "Rai 3", "Rai 4", "Rai Movie", "Canale 5", "Italia 1", "Rete 4", "LA7", "Iris", "Boing", "Cartoonito", "Sky Cinema", "Sky Uno"]
};

export type TonightChannelOption = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type TonightProgram = {
  id: string;
  title: string;
  network: string;
  channelId?: string | null;
  airtime: string;
  endTime?: string | null;
  runtime: number | null;
  season: number | null;
  episode: number | null;
  summary: string | null;
  posterUrl: string | null;
  category?: string | null;
  tmdbId: number | null;
  mediaType: "tv";
  source?: "tvmaze" | "xmltv-fr";
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
    summary?: string | null;
    externals?: { tmdb?: number | null } | null;
    image?: { medium?: string | null; original?: string | null } | null;
    network?: { id?: number; name?: string | null } | null;
    webChannel?: { id?: number; name?: string | null } | null;
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
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isTonightCountry(value: string): value is TonightCountry {
  return TONIGHT_COUNTRIES.some((c) => c.id === value);
}

async function fetchScheduleRaw(country: TonightCountry, date: string): Promise<TvMazeEpisode[]> {
  const url = `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(date)}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "MegaTv-Companion" },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return (await res.json()) as TvMazeEpisode[];
  } catch {
    return [];
  }
}

function mapEpisodes(rows: TvMazeEpisode[], loose = false): TonightProgram[] {
  const mapped: TonightProgram[] = [];
  for (const ep of rows) {
    const show = ep.show;
    if (!show?.name) continue;
    const network = show.network?.name || show.webChannel?.name || (loose ? "TV" : "");
    if (!network) continue;
    if (!loose && !isEvening(ep.airtime)) continue;
    const tmdbId =
      typeof show.externals?.tmdb === "number" && show.externals.tmdb > 0 ? show.externals.tmdb : null;
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
      mediaType: "tv",
      source: "tvmaze"
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

export type TonightGuideResult = {
  programs: TonightProgram[];
  channels: TonightChannelOption[];
  source: "xmltv-fr" | "tvmaze" | "empty";
};

export async function fetchTonightPrograms(
  country: TonightCountry,
  date?: string,
  channelId?: string | null
): Promise<TonightGuideResult> {
  if (country === "FR") {
    try {
      const isExtra = Boolean(channelId && FR_EXTRA_CHANNEL_IDS.has(channelId));
      const guide = await fetchFrXmltvGuide({
        channelId: isExtra ? null : channelId || null,
        eveningOnly: !channelId
      });
      const channels: TonightChannelOption[] = guide.channels.map((c) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl
      }));

      if (!isExtra) {
        const programs: TonightProgram[] = guide.programs.map((p) => ({
          id: p.id,
          title: p.title,
          network: p.network,
          channelId: p.channelId,
          airtime: p.airtime,
          endTime: p.endTime,
          runtime: null,
          season: null,
          episode: null,
          summary: p.summary,
          posterUrl: p.posterUrl,
          category: p.category,
          tmdbId: null,
          mediaType: "tv",
          source: "xmltv-fr"
        }));
        return {
          programs,
          channels,
          source: programs.length > 0 ? "xmltv-fr" : "empty"
        };
      }

      // Extra FR (Piwi+, Disney…) : strip XMLTV + grille TVMaze filtrée
      const extraName = FR_GUIDE_CHANNELS.find((c) => c.id === channelId)?.name || channelId;
      const dates = date ? [date] : [dayOffsetIso(0), dayOffsetIso(-1), dayOffsetIso(1)];
      let rows: TvMazeEpisode[] = [];
      for (const day of dates) {
        rows = await fetchScheduleRaw("FR", day);
        if (rows.length > 0) break;
      }
      const q = (extraName || "").toLowerCase();
      let mapped = mapEpisodes(rows, true).filter(
        (p) => p.network.toLowerCase().includes(q) || q.includes(p.network.toLowerCase().slice(0, 6))
      );
      if (mapped.length === 0) {
        mapped = mapEpisodes(rows, true).filter((p) =>
          p.network.toLowerCase().includes(q.split(/\s|\+/)[0] || q)
        );
      }
      return {
        programs: mapped.slice(0, 24),
        channels,
        source: mapped.length > 0 ? "tvmaze" : "empty"
      };
    } catch (err) {
      console.error("[tonight/xmltv-fr]", err);
    }
  }

  const dates = date ? [date] : [dayOffsetIso(0), dayOffsetIso(-1), dayOffsetIso(-2), dayOffsetIso(1)];
  let rows: TvMazeEpisode[] = [];
  for (const day of dates) {
    rows = await fetchScheduleRaw(country, day);
    if (rows.length > 0) break;
  }

  if (rows.length > 40 && !date) {
    const day = rows[0]?.airdate || dayOffsetIso(0);
    const url = `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(day)}&filter=primetime`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "MegaTv-Companion" },
        cache: "no-store"
      });
      if (res.ok) {
        const prime = (await res.json()) as TvMazeEpisode[];
        if (prime.length >= 3) rows = prime;
      }
    } catch {
      /* keep */
    }
  }

  let mapped = mapEpisodes(rows, true);
  if (mapped.length === 0) {
    return { programs: [], channels: [], source: "empty" };
  }

  // Chaînes = networks présents dans la grille. logoUrl = logo réseau uniquement (jamais poster d’émission).
  type ChanAcc = TonightChannelOption & { networkId?: number; isWeb?: boolean; count: number };
  const channelMap = new Map<string, ChanAcc>();
  for (const ep of rows) {
    const net = ep.show?.network?.name || ep.show?.webChannel?.name;
    if (!net) continue;
    const id = net;
    const networkId = ep.show?.network?.id;
    const webId = ep.show?.webChannel?.id;
    const prev = channelMap.get(id);
    if (!prev) {
      channelMap.set(id, {
        id,
        name: net,
        logoUrl: null,
        networkId: networkId ?? webId,
        isWeb: !networkId && Boolean(webId),
        count: 1
      });
    } else {
      prev.count += 1;
      if (!prev.networkId && (networkId || webId)) {
        prev.networkId = networkId ?? webId;
        prev.isWeb = !networkId && Boolean(webId);
      }
    }
  }

  const preferred = MAJOR_NETWORKS[country];
  const channels: TonightChannelOption[] = [];
  const used = new Set<string>();

  function fuzzyHit(name: string): ChanAcc | undefined {
    const q = name.toLowerCase();
    return (
      channelMap.get(name) ||
      [...channelMap.values()].find((c) => {
        const n = c.name.toLowerCase();
        return n === q || n.includes(q) || q.includes(n) || n.startsWith(q.slice(0, 4));
      })
    );
  }

  for (const name of preferred) {
    const hit = fuzzyHit(name);
    if (hit && !used.has(hit.id)) {
      channels.push({ id: hit.id, name: hit.name, logoUrl: hit.logoUrl });
      used.add(hit.id);
    }
  }
  const rest = [...channelMap.values()].sort((a, b) => b.count - a.count);
  for (const c of rest) {
    if (!used.has(c.id)) {
      channels.push({ id: c.id, name: c.name, logoUrl: c.logoUrl });
      used.add(c.id);
    }
  }

  // Logos réseau TVMaze (cache 24h) — max 16 ; webChannel → /webchannels/{id}
  const needLogo = channels.filter((c) => !c.logoUrl).slice(0, 16);
  if (needLogo.length > 0) {
    await Promise.all(
      needLogo.map(async (c) => {
        const acc = channelMap.get(c.id);
        const nid = acc?.networkId;
        if (!nid) return;
        try {
          const path = acc?.isWeb ? `webchannels/${nid}` : `networks/${nid}`;
          const res = await fetch(`https://api.tvmaze.com/${path}`, {
            headers: { Accept: "application/json", "User-Agent": "MegaTv-Companion" },
            next: { revalidate: 86400 }
          });
          if (!res.ok) return;
          const json = (await res.json()) as { image?: { medium?: string | null; original?: string | null } | null };
          const url = json.image?.medium || json.image?.original || null;
          if (url) c.logoUrl = url;
        } catch {
          /* ignore */
        }
      })
    );
  }

  let filtered = mapped;
  if (channelId) {
    const q = channelId.toLowerCase();
    filtered = mapped.filter((p) => {
      const n = p.network.toLowerCase();
      return n === q || n.includes(q) || q.includes(n) || p.channelId === channelId;
    });
    // Si le channelId localStorage est un fantôme obsolète → bascule 1ʳᵉ chaîne réelle
    if (filtered.length === 0 && channels[0]) {
      const fallback = channels[0].id.toLowerCase();
      filtered = mapped.filter((p) => {
        const n = p.network.toLowerCase();
        return n === fallback || n.includes(fallback) || fallback.includes(n);
      });
    }
  }

  filtered.sort((a, b) => a.airtime.localeCompare(b.airtime));

  const seen = new Set<string>();
  const unique: TonightProgram[] = [];
  for (const p of filtered) {
    const key = `${p.network}|${p.title}|${p.airtime}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }

  return {
    programs: unique.slice(0, channelId ? 24 : 48),
    channels,
    source: "tvmaze"
  };
}
