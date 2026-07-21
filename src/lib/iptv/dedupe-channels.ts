import type { IptvChannel } from "@/lib/web/iptv-channels";
import { channelDedupKey, channelNameLooks4K, cleanChannelName } from "@/lib/iptv/sanitizer";

/**
 * Port simplifié de `IptvRepository.deduplicateChannels` (Android).
 * Groupe par clé canonique (nom nettoyé / tvg-id) et garde un représentant
 * (préfère non-4K, logo présent, nom le plus court propre).
 */
export function deduplicateChannels(channels: IptvChannel[]): IptvChannel[] {
  if (channels.length === 0) return [];

  const grouped = new Map<string, IptvChannel[]>();
  for (const ch of channels) {
    const key = channelDedupKey(ch);
    const list = grouped.get(key);
    if (list) list.push(ch);
    else grouped.set(key, [ch]);
  }

  const result: IptvChannel[] = [];
  for (const group of grouped.values()) {
    if (group.length === 1) {
      result.push(group[0]!);
      continue;
    }
    const preferred =
      group.find((c) => !channelNameLooks4K(c.name) && c.logo) ||
      group.find((c) => !channelNameLooks4K(c.name)) ||
      group.find((c) => c.logo) ||
      group[0]!;

    const cleaned = cleanChannelName(preferred.name);
    result.push({
      ...preferred,
      name: cleaned || preferred.name,
      logo: preferred.logo || group.find((c) => c.logo)?.logo || null,
      tvgId: preferred.tvgId || group.find((c) => c.tvgId)?.tvgId || null
    });
  }

  return result;
}
