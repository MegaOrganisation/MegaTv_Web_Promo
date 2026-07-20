"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import { formatDuration } from "@/lib/format";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";
import { displayTitle } from "@/features/dashboard/watch-history-utils";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";

type Props = {
  open: boolean;
  dateLabel: string;
  rows: WatchHistoryRow[];
  modeLabel: string;
  onClose: () => void;
};

/** Popup liste films/séries d’une case calendrier. */
export function CalendarDayDetailModal({ open, dateLabel, rows, modeLabel, onClose }: Props) {
  const media = useMediaDetailOptional();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cal-day-modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-day-modal"
            role="dialog"
            aria-modal
            aria-label={`Programmes du ${dateLabel}`}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cal-day-modal__head">
              <div>
                <p className="cal-day-modal__eyebrow">{modeLabel}</p>
                <h2 className="cal-day-modal__title">{dateLabel}</h2>
                <p className="cal-day-modal__count">{rows.length} titre{rows.length > 1 ? "s" : ""}</p>
              </div>
              <button type="button" className="cal-day-modal__close focus-ring" onClick={onClose} aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {rows.length === 0 ? (
              <p className="cal-day-modal__empty">Rien à afficher pour cette date.</p>
            ) : (
              <ul className="cal-day-modal__list">
                {rows.map((row) => {
                  const poster = tmdbImageUrl(row.poster_path, "w185");
                  const canOpen = Number.isFinite(row.tmdb_id) && row.tmdb_id > 0;
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        className="cal-day-modal__row focus-ring"
                        disabled={!canOpen}
                        onClick={() => {
                          if (!canOpen) return;
                          media?.openMediaDetail({
                            mediaType: row.media_type,
                            tmdbId: row.tmdb_id,
                            title: displayTitle(row),
                            posterUrl: poster,
                            meta:
                              row.media_type === "tv" && row.season
                                ? `S${row.season} · E${row.episode ?? 1}`
                                : row.media_type === "tv"
                                  ? "Série"
                                  : "Film",
                            layoutId: `cal-day-${row.media_type}-${row.tmdb_id}-${row.id}`
                          });
                        }}
                      >
                        <div className="cal-day-modal__poster">
                          {poster ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={poster} alt="" />
                          ) : (
                            <span>{row.media_type === "tv" ? "TV" : "F"}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="cal-day-modal__row-title">{displayTitle(row)}</p>
                          <p className="cal-day-modal__row-sub">
                            {row.event_type === "release"
                              ? "Sortie"
                              : row.watch_seconds
                                ? formatDuration(row.watch_seconds)
                                : row.media_type === "tv"
                                  ? "Série"
                                  : "Film"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
