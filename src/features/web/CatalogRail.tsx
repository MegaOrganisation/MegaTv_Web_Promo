"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PosterCard } from "@/features/web/PosterCard";
import { RailHeader } from "@/features/web/RailHeader";
import { RailSeeAllModal } from "@/features/web/RailSeeAllModal";
import { Top10RailCell } from "@/features/web/Top10RailCell";
import { useRailScroll } from "@/features/web/useRailScroll";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs } from "@/lib/web/prefs";
import { isTop10Catalog } from "@/lib/catalogs/top10";
import { previewToMediaItem, type WebMediaItem } from "@/lib/web/media";
import { RAIL_PREVIEW_LIMIT } from "@/lib/web/rail";

type PreviewItem = { posterUrl: string; mediaId: string | null; title?: string | null };

function isGenericPosterLabel(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  return !trimmed || trimmed === "poster" || trimmed === "backdrop";
}

/**
 * Client rail that lazily pulls preview posters for a catalog via the shared
 * `/api/catalogs/preview` route (server-cached, revalidate 600).
 */
export function CatalogRail({
  title,
  sourceUrl,
  catalogId
}: {
  title: string;
  sourceUrl: string;
  catalogId?: string;
}) {
  const { activeProfileId } = useWebProfile();
  const { prefs } = useWebPrefs(activeProfileId);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [seeAllOpen, setSeeAllOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { trackRef, canScrollLeft, canScrollRight, atEnd, scrollLeft, scrollRight, refresh } = useRailScroll();

  const top10 = isTop10Catalog({ id: catalogId, title, sourceUrl });
  const landscape = top10 ? false : prefs.layout === "landscape";

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/catalogs/preview?url=${encodeURIComponent(sourceUrl)}&title=${encodeURIComponent(title)}`);
      if (!res.ok) {
        setState("error");
        return;
      }
      const json = (await res.json()) as { items?: PreviewItem[]; posterUrls?: string[]; posterUrl?: string | null };
      let next: PreviewItem[] = json.items && json.items.length ? json.items : [];
      if (next.length === 0) {
        const urls = (json.posterUrls && json.posterUrls.length ? json.posterUrls : json.posterUrl ? [json.posterUrl] : []).filter(Boolean);
        next = urls.map((posterUrl) => ({ posterUrl, mediaId: null, title: null }));
      }
      setItems(next.filter((item) => Boolean(item.posterUrl)));
      setState("done");
    } catch {
      setState("error");
    }
  }, [sourceUrl, title]);

  useEffect(() => {
    const node = ref.current;
    if (!node || state !== "idle") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [state, load]);

  const mediaItems = useMemo(
    () =>
      items
        .map((item) => previewToMediaItem(item.posterUrl, item.mediaId || "", title, item.title))
        .filter((item): item is WebMediaItem => Boolean(item)),
    [items, title]
  );

  if (state === "done" && items.length === 0) return null;

  const tileWidth = landscape ? "mega-poster-landscape-w shrink-0" : "mega-poster-w shrink-0";
  const tileAspect = landscape ? "aspect-video" : "aspect-[2/3]";
  const railItems = top10 ? items.slice(0, 10) : items;
  const previewItems = top10 ? railItems : railItems.slice(0, RAIL_PREVIEW_LIMIT);
  const hasMore = !top10 && mediaItems.length > RAIL_PREVIEW_LIMIT;

  return (
    <section ref={ref} className="space-y-3">
      <RailHeader
        title={title}
        hasMore={hasMore}
        atEnd={atEnd}
        onSeeAll={() => setSeeAllOpen(true)}
        canScrollLeft={canScrollLeft}
        canScrollRight={canScrollRight}
        onScrollLeft={scrollLeft}
        onScrollRight={scrollRight}
      />
      <div ref={trackRef} className="mega-rail-track" onScroll={refresh}>
        {state !== "done"
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`sk-${index}`}
                className={clsx("mega-poster-radius shrink-0 animate-pulse border border-[var(--mega-border)] bg-[var(--mega-surface)]", tileWidth, tileAspect)}
              />
            ))
          : previewItems.map((item, index) => {
              const media = item.mediaId
                ? previewToMediaItem(item.posterUrl, item.mediaId, title, item.title)
                : null;
              if (media) {
                const card = <PosterCard item={media} layout={landscape ? "landscape" : "poster"} />;
                if (top10) {
                  return (
                    <Top10RailCell key={`top10-${item.mediaId}-${index}`} rank={index + 1}>
                      {card}
                    </Top10RailCell>
                  );
                }
                return <PosterCard key={`${item.posterUrl}-${index}`} item={media} layout={landscape ? "landscape" : "poster"} />;
              }

              return (
                <div
                  key={`${item.posterUrl}-${index}`}
                  className={clsx(
                    "mega-poster-radius mega-poster-hover-glow group/poster relative shrink-0 overflow-hidden border border-[var(--mega-border)] bg-[var(--mega-surface)] transition duration-300 hover:scale-[1.05]",
                    tileWidth,
                    tileAspect
                  )}
                >
                  <Image src={item.posterUrl} alt="" fill unoptimized sizes={landscape ? "280px" : "150px"} className="object-cover" />
                </div>
              );
            })}
      </div>
      {hasMore ? (
        <RailSeeAllModal
          title={title}
          items={mediaItems}
          layout={landscape ? "landscape" : "poster"}
          open={seeAllOpen}
          onClose={() => setSeeAllOpen(false)}
        />
      ) : null}
    </section>
  );
}
