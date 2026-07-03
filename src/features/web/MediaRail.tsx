"use client";

import { useMemo, useState } from "react";

import { ContinueWatchingCard } from "@/features/web/ContinueWatchingCard";
import { PosterCard } from "@/features/web/PosterCard";
import { RailHeader } from "@/features/web/RailHeader";
import { RailSeeAllModal } from "@/features/web/RailSeeAllModal";
import { useRailScroll } from "@/features/web/useRailScroll";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs, type WebLayout } from "@/lib/web/prefs";
import { RAIL_PREVIEW_LIMIT } from "@/lib/web/rail";
import type { WebMediaItem } from "@/lib/web/media";

/**
 * Horizontal rail of posters. Layout (poster/landscape) follows the profile
 * preference from Settings unless a rail forces one.
 */
export function MediaRail({
  title,
  items,
  layout,
  showPlay = false,
  variant = "default"
}: {
  title: string;
  items: WebMediaItem[];
  layout?: WebLayout;
  showPlay?: boolean;
  variant?: "default" | "continue";
}) {
  const { activeProfileId } = useWebProfile();
  const { prefs } = useWebPrefs(activeProfileId);
  const effectiveLayout = layout ?? prefs.layout;
  const [seeAllOpen, setSeeAllOpen] = useState(false);
  const { trackRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight, refresh } = useRailScroll();

  const isContinue = variant === "continue";
  const previewItems = useMemo(
    () => (isContinue ? items : items.slice(0, RAIL_PREVIEW_LIMIT)),
    [isContinue, items]
  );
  const showSeeAll = !isContinue && items.length > RAIL_PREVIEW_LIMIT;

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <RailHeader
        title={title}
        showSeeAll={showSeeAll}
        onSeeAll={() => setSeeAllOpen(true)}
        canScrollLeft={canScrollLeft}
        canScrollRight={canScrollRight}
        onScrollLeft={scrollLeft}
        onScrollRight={scrollRight}
        showNav={!isContinue || items.length > 3}
      />
      <div ref={trackRef} className="mega-rail-track" onScroll={refresh}>
        {previewItems.map((item) =>
          isContinue ? (
            <ContinueWatchingCard key={`${title}-${item.mediaId}`} item={item} />
          ) : (
            <PosterCard key={`${title}-${item.mediaId}`} item={item} layout={effectiveLayout} showPlay={showPlay} />
          )
        )}
      </div>
      {showSeeAll ? (
        <RailSeeAllModal
          title={title}
          items={items}
          layout={effectiveLayout}
          open={seeAllOpen}
          onClose={() => setSeeAllOpen(false)}
        />
      ) : null}
    </section>
  );
}
