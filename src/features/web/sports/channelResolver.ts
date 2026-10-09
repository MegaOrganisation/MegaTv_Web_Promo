import type { IptvChannel } from "@/lib/web/iptv-channels";
import type { SportMatch } from "./types";

/**
 * Normalizes a channel or broadcaster name for fuzzy matching.
 * Mirrors and improves Android `ChannelResolver.kt`.
 */
export function normalizeMediaName(input: string): string {
  if (!input) return "";
  let s = input.toLowerCase().trim();

  // Remove common accents
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remove common country/quality prefixes like "fr |", "fr:", "fra -", "fr -", etc.
  s = s.replace(/^[a-z]{2,3}\s*[:|•\-_]\s*/i, "");

  // Remove common quality tags
  s = s.replace(/\b(fhd|uhd|4k|hevc|h265|hd|sd|raw|50fps|60fps|vip)\b/gi, "");

  // Replace + with plus or keep as clean token
  s = s.replace(/\+/g, "plus");

  // Remove remaining non-alphanumeric characters
  s = s.replace(/[^a-z0-9]/g, "");

  return s;
}

/**
 * Resolves broadcaster names for a match against the user's available IPTV channels.
 */
export function resolveChannelsForMatch(
  match: SportMatch,
  availableChannels: IptvChannel[],
  preferredCountry = "FR"
): IptvChannel[] {
  if (!availableChannels || availableChannels.length === 0) return [];

  // Extract all broadcaster names, prioritizing the preferred country (e.g. FR)
  const broadcasters: string[] = [];

  if (match.broadcasters[preferredCountry]) {
    broadcasters.push(...match.broadcasters[preferredCountry]);
  }
  if (match.primaryBroadcaster && !broadcasters.includes(match.primaryBroadcaster)) {
    broadcasters.push(match.primaryBroadcaster);
  }

  // Also include broadcasters from other countries if none found or for broader matching
  for (const [country, list] of Object.entries(match.broadcasters)) {
    if (country !== preferredCountry && Array.isArray(list)) {
      for (const b of list) {
        if (!broadcasters.includes(b)) {
          broadcasters.push(b);
        }
      }
    }
  }

  if (broadcasters.length === 0) return [];

  const matched: IptvChannel[] = [];
  const seenIds = new Set<string>();

  for (const broadcaster of broadcasters) {
    const normBroadcaster = normalizeMediaName(broadcaster);
    if (!normBroadcaster || normBroadcaster.length < 3) continue;

    for (const channel of availableChannels) {
      if (seenIds.has(channel.id)) continue;

      const normChannel = normalizeMediaName(channel.name);
      if (!normChannel) continue;

      // Check if channel name contains broadcaster or vice versa
      if (normChannel.includes(normBroadcaster) || normBroadcaster.includes(normChannel)) {
        matched.push(channel);
        seenIds.add(channel.id);
      }
    }
  }

  return matched;
}
