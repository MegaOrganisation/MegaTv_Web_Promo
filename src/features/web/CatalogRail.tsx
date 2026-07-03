"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs } from "@/lib/web/prefs";

type PreviewItem = { posterUrl: string; mediaId: string | null };

/**
 * Client rail that lazily pulls preview posters for a catalog via the shared
 * `/api/catalogs/preview` route (server-cached, revalidate 600). Kept out of SSR
 * so Home stays fast and we don't fan out network reads on every request.
 *
 * P1: posters with a resolved `mediaId` (Trakt items / direct TMDB refs) link to
 * `/web/details`; MDBList posters expose images only and stay non-clickable.
 */
export function CatalogRail({ title, sourceUrl }: { title: string; sourceUrl: string }) {
  const { withProfile, activeProfileId } = useWebProfile();
  const { prefs } = useWebPrefs(activeProfileId);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const ref = useRef<HTMLElement>(null);

  const landscape = prefs.layout === "landscape";

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
        next = urls.map((posterUrl) => ({ posterUrl, mediaId: null }));
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

  if (state === "done" && items.length === 0) return null;

  const tileWidth = landscape ? "w-[240px] sm:w-[280px]" : "w-[130px] sm:w-[150px]";
  const tileAspect = landscape ? "aspect-video" : "aspect-[2/3]";

  return (
    <section ref={ref} className="space-y-3">
      <h2 className="px-1 text-lg font-bold text-[var(--mega-text)]">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {state !== "done"
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`sk-${index}`}
                className={clsx("shrink-0 animate-pulse rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-surface)]", tileWidth, tileAspect)}
              />
            ))
          : items.map((item, index) => {
              const tile = (
                <div
                  className={clsx(
                    "group/poster relative shrink-0 overflow-hidden rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-surface)] transition duration-300 hover:scale-[1.05] hover:border-[var(--mega-border-strong)]",
                    tileWidth,
                    tileAspect
                  )}
                >
                  <Image src={item.posterUrl} alt={title} fill unoptimized sizes={landscape ? "280px" : "150px"} className="object-cover" />
                </div>
              );
              return item.mediaId ? (
                <Link
                  key={`${item.posterUrl}-${index}`}
                  href={withProfile(`/web/details/${item.mediaId}`)}
                  prefetch={false}
                  className="focus-ring"
                >
                  {tile}
                </Link>
              ) : (
                <div key={`${item.posterUrl}-${index}`}>{tile}</div>
              );
            })}
      </div>
    </section>
  );
}
