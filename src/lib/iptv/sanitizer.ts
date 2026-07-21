/**
 * Port web de `IptvSanitizer` (Android) — clés de comparaison pour dédoublonnage IPTV.
 * Ne pas diverger sans mettre à jour [[page_iptv_et_live]].
 */

const bracketsRegex = /\[.*?\]/g;
const pipesRegex = /\|.*/;
const parensRegex = /\(.*?\)/g;
const decorativeRegex = /[•★▼_\-+]/g;
const technicalKeywordsRegex =
  /(?<![a-zA-Z])(FHD|HDR|UHD|4K|HEVC|1080P|720P|H264|H265|BACKUP|ALT|HD|SD)(?![a-zA-Z])/gi;
const suffixRegex = /(?<![a-zA-Z])(international|inter|multilang|multi|backup|alt|temp|v2|stream|fra)(?![a-zA-Z])/gi;
const trailingPunctRegex = /[\s|:•+\-▼★_]+$/g;
const whitespaceRegex = /\s+/g;
const symbolsEmojisRegex = /[^\p{L}\p{N}\s]/gu;
const accentsRegex = /\p{M}+/gu;
const leadingChannelNumberRegex = /^\d+[.):\]\s-]*/;

export function cleanChannelName(name: string | null | undefined): string {
  if (!name?.trim()) return "";
  let cleaned = name
    .replace(bracketsRegex, "")
    .replace(parensRegex, "")
    .replace(pipesRegex, "")
    .replace(decorativeRegex, " ")
    .replace(technicalKeywordsRegex, "")
    .replace(suffixRegex, "")
    .replace(trailingPunctRegex, "")
    .replace(whitespaceRegex, " ")
    .trim();
  if (!cleaned) cleaned = name.trim();
  return cleaned;
}

export function comparisonKey(name: string | null | undefined): string {
  if (!name?.trim()) return "";
  let cleaned = cleanChannelName(name).replace(leadingChannelNumberRegex, "").trim();

  for (const sep of [" - ", " : ", ": "]) {
    const idx = cleaned.indexOf(sep);
    if (idx > 0) {
      const suffix = cleaned.slice(idx + sep.length).trim();
      if (suffix && suffix.length < cleaned.length) {
        cleaned = suffix;
        break;
      }
    }
  }

  const normalized = cleaned.normalize("NFD").replace(accentsRegex, "");
  const withoutSymbols = normalized.replace(symbolsEmojisRegex, "");
  return withoutSymbols.replace(whitespaceRegex, "").toLowerCase();
}

export function epgComparisonKey(epgId: string | null | undefined): string | null {
  const raw = epgId?.trim();
  if (!raw) return null;
  return raw.toLowerCase().replace(/\s+/g, "");
}

export function channelDedupKey(channel: { name: string; tvgId?: string | null; id: string }): string {
  const nameKey = comparisonKey(cleanChannelName(channel.name));
  if (nameKey) return `name:${nameKey}`;
  const epg = epgComparisonKey(channel.tvgId);
  if (epg) return `epg:${epg}`;
  return `id:${channel.id}`;
}

export function channelNameLooks4K(name: string): boolean {
  return /\b(4k|uhd|2160)\b/i.test(name) || /\[?\s*4k\s*\]?/i.test(name);
}
