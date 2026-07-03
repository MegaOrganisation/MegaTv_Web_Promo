"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { PosterCard } from "@/features/web/PosterCard";
import { useRailMeta } from "@/features/web/useRailMeta";
import type { WebLayout } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

type SortMode = "trend" | "rating-desc" | "rating-asc" | "date-desc" | "date-asc" | "title-asc" | "title-desc";
type DateFilter = "all" | "2020s" | "2010s" | "2000s" | "older";

function releaseYear(date: string | null | undefined) {
  if (!date || date.length < 4) return null;
  const year = Number(date.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

function matchesDateFilter(year: number | null, filter: DateFilter) {
  if (filter === "all" || year == null) return filter === "all";
  if (filter === "2020s") return year >= 2020;
  if (filter === "2010s") return year >= 2010 && year < 2020;
  if (filter === "2000s") return year >= 2000 && year < 2010;
  return year < 2000;
}

export function RailSeeAllModal({
  title,
  items,
  layout,
  open,
  onClose
}: {
  title: string;
  items: WebMediaItem[];
  layout: WebLayout;
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("trend");
  const [genreFilter, setGenreFilter] = useState("all");
  const [ratingMin, setRatingMin] = useState(0);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mediaIds = useMemo(() => items.map((item) => item.mediaId), [items]);
  const { meta, loading: metaLoading } = useRailMeta(mediaIds, open);

  const genreOptions = useMemo(() => {
    const set = new Set<string>();
    for (const id of mediaIds) {
      for (const genre of meta[id]?.genres || []) set.add(genre);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }, [mediaIds, meta]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSort("trend");
      setGenreFilter("all");
      setRatingMin(0);
      setDateFilter("all");
      setFiltersOpen(false);
    }
  }, [open]);

  const orderIndex = useMemo(() => new Map(items.map((item, index) => [item.mediaId, index])), [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = items.filter((item) => {
      if (q && !item.title.toLowerCase().includes(q)) return false;
      const row = meta[item.mediaId];
      if (genreFilter !== "all" && !(row?.genres || []).includes(genreFilter)) return false;
      if (ratingMin > 0) {
        const rating = row?.voteAverage;
        if (rating == null || rating < ratingMin) return false;
      }
      if (dateFilter !== "all") {
        const year = releaseYear(row?.releaseDate);
        if (!matchesDateFilter(year, dateFilter)) return false;
      }
      return true;
    });

    next = [...next].sort((a, b) => {
      if (sort === "trend") return (orderIndex.get(a.mediaId) ?? 0) - (orderIndex.get(b.mediaId) ?? 0);
      const ma = meta[a.mediaId];
      const mb = meta[b.mediaId];
      if (sort === "rating-desc" || sort === "rating-asc") {
        const ra = ma?.voteAverage ?? -1;
        const rb = mb?.voteAverage ?? -1;
        return sort === "rating-desc" ? rb - ra : ra - rb;
      }
      if (sort === "date-desc" || sort === "date-asc") {
        const da = ma?.releaseDate || "";
        const db = mb?.releaseDate || "";
        return sort === "date-desc" ? db.localeCompare(da) : da.localeCompare(db);
      }
      const cmp = a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      return sort === "title-asc" ? cmp : -cmp;
    });

    return next;
  }, [items, query, sort, genreFilter, ratingMin, dateFilter, meta, orderIndex]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="mega-rail-modal fixed inset-0 z-[200] flex items-stretch justify-center p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5"
      role="dialog"
      aria-modal
      aria-label={title}
    >
      <div className="mega-rail-modal-panel flex min-h-0 w-full max-w-[1500px] flex-col overflow-hidden">
        <header className="mega-rail-modal-header shrink-0 border-b border-[var(--mega-border)] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="mega-rail-bar hidden h-5 w-1 shrink-0 rounded-sm bg-white/90 sm:block" aria-hidden />
            <h2 className="truncate text-lg font-bold text-[var(--mega-text)] sm:text-xl">{title}</h2>
            <span className="text-xs text-[var(--mega-text-muted)]">
              {visible.length} / {items.length}
              {metaLoading ? " · métadonnées…" : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-surface)] text-[var(--mega-text-muted)] transition hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mega-text-faint)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un titre…"
              className="w-full rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--mega-text)] outline-none transition focus:border-[var(--mega-border-strong)]"
            />
          </label>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-3 py-2.5 text-sm text-[var(--mega-text)] outline-none focus:border-[var(--mega-border-strong)]"
            aria-label="Trier"
          >
            <option value="trend">Tendance (ordre rail)</option>
            <option value="rating-desc">Note ↓</option>
            <option value="rating-asc">Note ↑</option>
            <option value="date-desc">Date ↓</option>
            <option value="date-asc">Date ↑</option>
            <option value="title-asc">Titre A → Z</option>
            <option value="title-desc">Titre Z → A</option>
          </select>

          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-3 py-2.5 text-sm font-semibold text-[var(--mega-text-muted)] transition hover:text-[var(--mega-text)]"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {filtersOpen ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={genreFilter}
              onChange={(event) => setGenreFilter(event.target.value)}
              className="rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-3 py-2 text-sm text-[var(--mega-text)] outline-none focus:border-[var(--mega-border-strong)]"
              aria-label="Filtrer par genre"
            >
              <option value="all">Tous les genres</option>
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <select
              value={String(ratingMin)}
              onChange={(event) => setRatingMin(Number(event.target.value))}
              className="rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-3 py-2 text-sm text-[var(--mega-text)] outline-none focus:border-[var(--mega-border-strong)]"
              aria-label="Note minimale"
            >
              <option value="0">Toutes les notes</option>
              <option value="5">Note ≥ 5</option>
              <option value="6">Note ≥ 6</option>
              <option value="7">Note ≥ 7</option>
              <option value="8">Note ≥ 8</option>
            </select>

            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              className="rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-3 py-2 text-sm text-[var(--mega-text)] outline-none focus:border-[var(--mega-border-strong)]"
              aria-label="Filtrer par période"
            >
              <option value="all">Toutes les dates</option>
              <option value="2020s">2020 et +</option>
              <option value="2010s">2010–2019</option>
              <option value="2000s">2000–2009</option>
              <option value="older">Avant 2000</option>
            </select>
          </div>
        ) : null}
      </header>

      <div className="mega-rail-modal-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-[var(--mega-text-muted)]">Aucun résultat pour ces critères.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 overflow-visible sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visible.map((item) => (
              <PosterCard key={item.mediaId} item={item} layout={layout} fullWidth />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>,
    document.body
  );
}
