"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, X } from "lucide-react";
import { createPortal } from "react-dom";

import { useMediaDetail } from "@/features/companion/ui/MediaDetailContext";

type DetailPayload = {
  title: string;
  overview?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  rating?: number | null;
  year?: string | null;
  runtime?: string | null;
};

/** Poster → zoom (layoutId) → flip 3D → dos détail. */
export function MediaFlipDetailModal() {
  const { target, closeMediaDetail } = useMediaDetail();
  const [mounted, setMounted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!target) {
      setFlipped(false);
      setDetail(null);
      setLoading(false);
      return;
    }
    setFlipped(false);
    setLoading(true);
    setDetail({
      title: target.title,
      posterUrl: target.posterUrl,
      backdropUrl: target.backdropUrl
    });

    // Laisser le layoutId zoomer, puis flipper le dos
    const flipTimer = window.setTimeout(() => setFlipped(true), 380);

    const qs = new URLSearchParams({
      media_type: target.mediaType,
      tmdb_id: String(target.tmdbId)
    });
    void fetch(`/api/tmdb/enrich?${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) return;
        setDetail({
          title: json.title || target.title,
          overview: json.overview,
          posterUrl: json.posterUrl || target.posterUrl,
          backdropUrl: json.backdropUrl || target.backdropUrl,
          rating: typeof json.rating === "number" ? json.rating : null,
          year: json.releaseDate ? String(json.releaseDate).slice(0, 4) : null,
          runtime: json.runtime || null
        });
      })
      .catch(() => {
        /* keep seed detail */
      })
      .finally(() => setLoading(false));

    return () => window.clearTimeout(flipTimer);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMediaDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, closeMediaDetail]);

  if (!mounted) return null;

  const layoutId = target?.layoutId || (target ? `media-${target.mediaType}-${target.tmdbId}` : undefined);

  return createPortal(
    <AnimatePresence mode="wait">
      {target ? (
        <motion.div
          key={`${target.mediaType}-${target.tmdbId}`}
          className="media-flip-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeMediaDetail}
        >
          <div className="media-flip-stage" onClick={(e) => e.stopPropagation()}>
            <div className="media-flip-glass">
              <div className="media-flip-viewport">
                <motion.div
                  className="media-flip-card"
                  layoutId={layoutId}
                  initial={{ rotateY: 0, scale: 0.72 }}
                  animate={{ rotateY: flipped ? 180 : 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{
                    layout: { type: "spring", stiffness: 280, damping: 28 },
                    rotateY: { type: "spring", stiffness: 220, damping: 24, delay: flipped ? 0 : 0 },
                    scale: { type: "spring", stiffness: 260, damping: 26 }
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="media-flip-face media-flip-face--front">
                    {target.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={target.posterUrl} alt="" className="h-full w-full object-cover" draggable={false} />
                    ) : (
                      <div className="grid h-full place-items-center bg-[#12161a] text-white/50">{target.title}</div>
                    )}
                  </div>
                  <div className="media-flip-face media-flip-face--back">
                    <button type="button" className="media-flip-close focus-ring" onClick={closeMediaDetail} aria-label="Fermer">
                      <X className="h-4 w-4" />
                    </button>
                    {detail?.backdropUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={detail.backdropUrl} alt="" className="media-flip-detail__bg" />
                    ) : null}
                    <div className="media-flip-detail__body">
                      <p className="media-flip-detail__meta">
                        {target.mediaType === "tv" ? "Série" : "Film"}
                        {target.meta ? ` · ${target.meta}` : null}
                      </p>
                      <h2>{detail?.title || target.title}</h2>
                      <div className="media-flip-detail__chips">
                        {detail?.rating != null ? (
                          <span>
                            <Star className="mr-1 inline h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                            {detail.rating.toFixed(1)}
                          </span>
                        ) : null}
                        {detail?.year ? <span>{detail.year}</span> : null}
                        {detail?.runtime ? <span>{detail.runtime}</span> : null}
                      </div>
                      {loading && !detail?.overview ? <p className="text-sm text-white/55">Chargement…</p> : null}
                      {detail?.overview ? <p className="media-flip-detail__overview">{detail.overview}</p> : null}
                      {!loading && !detail?.overview ? (
                        <p className="media-flip-detail__overview text-white/45">Aucune synopsis disponible.</p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
