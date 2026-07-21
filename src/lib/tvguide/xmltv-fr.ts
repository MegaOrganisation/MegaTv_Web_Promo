/**
 * Guide TV France via XMLTV TNT (xmltvfr.fr) + chaînes cable populaires (Piwi+, Disney…).
 * TNT reste le feed léger (free tier) ; les extras hors TNT passent par TVMaze au besoin.
 */
import { gunzipSync } from "node:zlib";

export type FrGuideChannel = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type FrGuideProgram = {
  id: string;
  channelId: string;
  network: string;
  title: string;
  airtime: string;
  endTime: string | null;
  summary: string | null;
  posterUrl: string | null;
  category: string | null;
  startMs: number;
  stopMs: number;
};

const XMLTV_TNT_URL = "https://xmltvfr.fr/xmltv/xmltv_tnt.xml.gz";

/** Normalise les icônes XMLTV (https, protocole relatif). */
function resolveChannelLogo(_id: string, xmlLogo: string | null | undefined): string | null {
  if (!xmlLogo) return null;
  if (xmlLogo.startsWith("//")) return `https:${xmlLogo}`;
  if (xmlLogo.startsWith("http://")) return `https://${xmlLogo.slice("http://".length)}`;
  return xmlLogo;
}

/** TNT + cable kids/ciné demandés (Planète+, Piwi+, Disney…). */
export const FR_GUIDE_CHANNELS: Array<{ id: string; name: string; logoHint?: string }> = [
  { id: "TF1.fr", name: "TF1" },
  { id: "France2.fr", name: "France 2" },
  { id: "France3.fr", name: "France 3" },
  { id: "CanalPlus.fr", name: "Canal+" },
  { id: "France5.fr", name: "France 5" },
  { id: "M6.fr", name: "M6" },
  { id: "Arte.fr", name: "Arte" },
  { id: "W9.fr", name: "W9" },
  { id: "TMC.fr", name: "TMC" },
  { id: "NT1.fr", name: "TFX" },
  { id: "LaChaineParlementaire.fr", name: "LCP" },
  { id: "France4.fr", name: "France 4" },
  { id: "BFMTV.fr", name: "BFM TV" },
  { id: "CNews.fr", name: "CNews" },
  { id: "CStar.fr", name: "CStar" },
  { id: "Gulli.fr", name: "Gulli" },
  { id: "T18.fr", name: "T18" },
  { id: "NOVO19.fr", name: "NOVO19" },
  { id: "TF1SeriesFilms.fr", name: "TF1 Séries Films" },
  { id: "LEquipe21.fr", name: "L'Équipe" },
  { id: "6ter.fr", name: "6ter" },
  { id: "Numero23.fr", name: "RMC STORY" },
  { id: "RMCDecouverte.fr", name: "RMC Découverte" },
  { id: "Cherie25.fr", name: "RMC Life" },
  { id: "LCI.fr", name: "LCI" },
  { id: "FranceInfo.fr", name: "franceinfo:" },
  { id: "ParisPremiere.fr", name: "Paris Première" },
  { id: "CanalPlusSport.fr", name: "Canal+ Sport" },
  { id: "CanalPlusCinema.fr", name: "Canal+ Cinéma" },
  { id: "PlanetePlus.fr", name: "Planète+" },
  // Hors TNT — strip logos + programmes via TVMaze si sélectionnés
  { id: "PIWI.fr", name: "Piwi+", logoHint: "Piwi+" },
  { id: "PlaneteAction.fr", name: "Planète+ Aventure", logoHint: "Planète+" },
  { id: "DisneyChannel.fr", name: "Disney Channel", logoHint: "Disney Channel" },
  { id: "DisneyJunior.fr", name: "Disney Junior", logoHint: "Disney Junior" },
  { id: "CinePlusPremier.fr", name: "OCS", logoHint: "OCS" },
  { id: "NationalGeographic.fr", name: "National Geographic", logoHint: "National Geographic" },
  { id: "WarnerTV.fr", name: "Warner TV", logoHint: "Warner TV" }
];

export const FR_TNT_CHANNELS = FR_GUIDE_CHANNELS;

/** Chaînes hors feed TNT (programme via TVMaze). */
export const FR_EXTRA_CHANNEL_IDS = new Set([
  "PIWI.fr",
  "PlaneteAction.fr",
  "DisneyChannel.fr",
  "DisneyJunior.fr",
  "CinePlusPremier.fr",
  "NationalGeographic.fr",
  "WarnerTV.fr"
]);

function parseXmltvTime(raw: string): number | null {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/.exec(raw.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s, tz] = m;
  const sign = tz?.startsWith("-") ? -1 : 1;
  const tzh = tz ? Number(tz.slice(1, 3)) : 0;
  const tzm = tz ? Number(tz.slice(3, 5)) : 0;
  const utc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  return utc - sign * (tzh * 60 + tzm) * 60_000;
}

function formatAirtime(ms: number): string {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date(ms));
  const hh = parts.find((p) => p.type === "hour")?.value || "00";
  const mm = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hh}:${mm}`;
}

function extractTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim() || null;
}

function extractAttr(tagOpen: string, name: string): string | null {
  const re = new RegExp(`${name}="([^"]*)"`, "i");
  const m = re.exec(tagOpen);
  return m?.[1] || null;
}

async function loadXmltvTntText(): Promise<string> {
  const res = await fetch(XMLTV_TNT_URL, {
    headers: { Accept: "application/gzip, application/xml, */*", "User-Agent": "MegaTv-Companion" },
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`xmltv_http_${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const looksGzip = buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b;
  const xmlBuf = looksGzip ? gunzipSync(buf) : buf;
  return xmlBuf.toString("utf8");
}

function parseTntChannels(xml: string): FrGuideChannel[] {
  const found = new Map<string, FrGuideChannel>();
  const channelRe = /<channel\s+([^>]+)>([\s\S]*?)<\/channel>/gi;
  let m: RegExpExecArray | null;
  while ((m = channelRe.exec(xml))) {
    const id = extractAttr(m[1], "id");
    if (!id || found.has(id)) continue;
    const body = m[2];
    const preferred = FR_GUIDE_CHANNELS.find((c) => c.id === id);
    const name = extractTag(body, "display-name") || preferred?.name || id.replace(/\.fr$/i, "");
    const iconMatch = /<icon[^>]*src="([^"]+)"/i.exec(body);
    found.set(id, { id, name, logoUrl: resolveChannelLogo(id, iconMatch?.[1] || null) });
  }

  const ordered: FrGuideChannel[] = [];
  const used = new Set<string>();
  for (const pref of FR_GUIDE_CHANNELS) {
    if (FR_EXTRA_CHANNEL_IDS.has(pref.id)) {
      ordered.push({ id: pref.id, name: pref.name, logoUrl: resolveChannelLogo(pref.id, null) });
      used.add(pref.id);
      continue;
    }
    const hit = found.get(pref.id);
    if (hit) {
      ordered.push({ ...hit, logoUrl: resolveChannelLogo(hit.id, hit.logoUrl) });
      used.add(pref.id);
    } else {
      ordered.push({ id: pref.id, name: pref.name, logoUrl: resolveChannelLogo(pref.id, null) });
      used.add(pref.id);
    }
  }
  for (const ch of found.values()) {
    if (!used.has(ch.id)) ordered.push(ch);
  }
  return ordered;
}

function parseProgrammes(
  xml: string,
  allowedIds: Set<string>,
  nameById: Map<string, string>,
  channelFilter?: string | null
): FrGuideProgram[] {
  const out: FrGuideProgram[] = [];
  const progRe = /<programme\s+([^>]+)>([\s\S]*?)<\/programme>/gi;
  let m: RegExpExecArray | null;
  while ((m = progRe.exec(xml))) {
    const open = m[1];
    const channelId = extractAttr(open, "channel");
    if (!channelId || !allowedIds.has(channelId)) continue;
    if (channelFilter && channelId !== channelFilter) continue;
    const startRaw = extractAttr(open, "start");
    const stopRaw = extractAttr(open, "stop");
    if (!startRaw) continue;
    const startMs = parseXmltvTime(startRaw);
    const stopMs = stopRaw ? parseXmltvTime(stopRaw) : null;
    if (startMs == null) continue;
    const body = m[2];
    const title = extractTag(body, "title");
    if (!title) continue;
    const iconMatch = /<icon[^>]*src="([^"]+)"/i.exec(body);
    out.push({
      id: `xmltv-${channelId}-${startMs}`,
      channelId,
      network: nameById.get(channelId) || channelId.replace(/\.fr$/i, ""),
      title,
      airtime: formatAirtime(startMs),
      endTime: stopMs != null ? formatAirtime(stopMs) : null,
      summary: extractTag(body, "desc"),
      posterUrl: iconMatch?.[1] || null,
      category: extractTag(body, "category"),
      startMs,
      stopMs: stopMs ?? startMs + 60 * 60 * 1000
    });
  }
  return out;
}

export type FrGuidePayload = {
  channels: FrGuideChannel[];
  programs: FrGuideProgram[];
  source: "xmltv-fr";
};

export async function fetchFrXmltvGuide(opts?: {
  channelId?: string | null;
  eveningOnly?: boolean;
}): Promise<FrGuidePayload> {
  const xml = await loadXmltvTntText();
  const channels = parseTntChannels(xml);
  const tntIds = new Set(channels.filter((c) => !FR_EXTRA_CHANNEL_IDS.has(c.id)).map((c) => c.id));
  const nameById = new Map(channels.map((c) => [c.id, c.name]));

  // Extra hors TNT → programmes vides ici (tonight.ts bascule TVMaze)
  if (opts?.channelId && FR_EXTRA_CHANNEL_IDS.has(opts.channelId)) {
    return { channels, programs: [], source: "xmltv-fr" };
  }

  let programs = parseProgrammes(xml, tntIds, nameById, opts?.channelId || null);

  const now = Date.now();
  const parisDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(now));

  const dayStart = Date.parse(`${parisDay}T00:00:00+02:00`);
  const dayEnd = dayStart + 36 * 60 * 60 * 1000;
  programs = programs.filter((p) => p.startMs >= dayStart - 2 * 60 * 60 * 1000 && p.startMs <= dayEnd);

  if (opts?.eveningOnly && !opts.channelId) {
    programs = programs.filter((p) => {
      const hh = Number(p.airtime.slice(0, 2));
      return hh >= 18 || hh < 2;
    });
  }

  if (opts?.channelId) {
    programs = programs
      .filter((p) => p.stopMs >= now - 30 * 60 * 1000)
      .sort((a, b) => a.startMs - b.startMs)
      .slice(0, 24);
  } else {
    programs = programs
      .filter((p) => p.stopMs >= now - 15 * 60 * 1000)
      .sort((a, b) => a.startMs - b.startMs)
      .slice(0, 48);
  }

  return { channels, programs, source: "xmltv-fr" };
}
