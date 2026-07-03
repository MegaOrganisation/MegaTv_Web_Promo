"use client";

import { PosterCard } from "@/features/web/PosterCard";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs, type WebLayout } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

/**
 * Horizontal rail of posters. Layout (poster/landscape) follows the profile
 * preference from Settings unless a rail forces one (e.g. Continue Watching).
 */
export function MediaRail({
  title,
  items,
  layout,
  showPlay = false
}: {
  title: string;
  items: WebMediaItem[];
  layout?: WebLayout;
  showPlay?: boolean;
}) {
  const { activeProfileId } = useWebProfile();
  const { prefs } = useWebPrefs(activeProfileId);
  const effectiveLayout = layout ?? prefs.layout;

  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-lg font-bold text-[var(--mega-text)]">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((item) => (
          <PosterCard key={`${title}-${item.mediaId}`} item={item} layout={effectiveLayout} showPlay={showPlay} />
        ))}
      </div>
    </section>
  );
}
