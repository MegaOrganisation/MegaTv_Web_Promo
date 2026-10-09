"use client";

import { clsx } from "clsx";
import {
  ArrowUpDown,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Film,
  RotateCcw,
  Search,
  Sparkles,
  Tv,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import { useLocalFlagsSet } from "@/features/web/details/localFlags";
import { PosterCard } from "@/features/web/PosterCard";
import {
  WATCHLIST_DOCUMENTARY_GENRE_ID,
  WATCHLIST_GENRE_LABELS
} from "@/features/web/watchlist/constants";
import type {
  EnrichedWatchlistItem,
  WatchlistSortOption,
  WatchlistStats,
  WatchlistTypeFilter,
  WatchlistWatchedFilter
} from "@/features/web/watchlist/types";

type Props = {
  initialItems: EnrichedWatchlistItem[];
  profileId: string;
};

export function WatchlistClient({ initialItems, profileId }: Props) {
  // Reactive watched flags from localStorage (synced across detail page and watchlist)
  const watchedMediaIds = useLocalFlagsSet("watched", profileId);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<WatchlistTypeFilter>("all");
  const [watchedFilter, setWatchedFilter] = useState<WatchlistWatchedFilter>("all");
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<WatchlistSortOption>("date_added");

  // Calculate statistics across all items in watchlist
  const stats: WatchlistStats = useMemo(() => {
    let movies = 0;
    let series = 0;
    let documentaries = 0;
    let totalMinutes = 0;

    for (const item of initialItems) {
      const isDoc =
        item.isDocumentary ||
        item.genreIds?.includes(WATCHLIST_DOCUMENTARY_GENRE_ID) ||
        item.title.toLowerCase().includes("documentaire");

      if (isDoc) {
        documentaries++;
      } else if (item.mediaType === "tv") {
        series++;
      } else {
        movies++;
      }

      // Estimated runtime
      if (item.mediaType === "tv") {
        // Average serie has ~10 episodes if unknown, with ~45 min
        totalMinutes += (item.runtime || 45) * 8;
      } else {
        totalMinutes += item.runtime || 110;
      }
    }

    const estimatedHours = Math.floor(totalMinutes / 60);
    const estimatedMinutesRemainder = totalMinutes % 60;

    return {
      total: initialItems.length,
      movies,
      series,
      documentaries,
      totalMinutes,
      estimatedHours,
      estimatedMinutesRemainder
    };
  }, [initialItems]);

  // Extract available genres present in user's watchlist
  const availableGenres = useMemo(() => {
    const genreMap = new Map<number, { id: number; name: string; count: number }>();
    for (const item of initialItems) {
      if (item.genreIds && item.genreIds.length > 0) {
        for (const id of item.genreIds) {
          const name = WATCHLIST_GENRE_LABELS[id];
          if (name) {
            const existing = genreMap.get(id);
            if (existing) {
              existing.count++;
            } else {
              genreMap.set(id, { id, name, count: 1 });
            }
          }
        }
      }
    }
    return Array.from(genreMap.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [initialItems]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = initialItems.filter((item) => {
      // 1. Search Query Filter
      if (query && !item.title.toLowerCase().includes(query)) {
        return false;
      }

      // 2. Type Filter (All, Movies, Series, Documentaries)
      const isDoc =
        item.isDocumentary ||
        item.genreIds?.includes(WATCHLIST_DOCUMENTARY_GENRE_ID) ||
        item.title.toLowerCase().includes("documentaire");

      if (typeFilter === "movie" && (item.mediaType !== "movie" || isDoc)) return false;
      if (typeFilter === "tv" && (item.mediaType !== "tv" || isDoc)) return false;
      if (typeFilter === "documentary" && !isDoc) return false;

      // 3. Watched Status Filter (All, Unwatched, Watched)
      const isWatched = watchedMediaIds.has(item.mediaId);
      if (watchedFilter === "watched" && !isWatched) return false;
      if (watchedFilter === "unwatched" && isWatched) return false;

      // 4. Genre Filter
      if (selectedGenreId != null && !item.genreIds?.includes(selectedGenreId)) {
        return false;
      }

      return true;
    });

    // 5. Sorting
    return [...filtered].sort((a, b) => {
      if (sortOption === "rating") {
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      }
      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === "year") {
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      }
      // Default: date_added (descending)
      return (b.addedAt || 0) - (a.addedAt || 0);
    });
  }, [initialItems, searchQuery, typeFilter, watchedFilter, selectedGenreId, sortOption, watchedMediaIds]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    typeFilter !== "all" ||
    watchedFilter !== "all" ||
    selectedGenreId != null ||
    sortOption !== "date_added";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setWatchedFilter("all");
    setSelectedGenreId(null);
    setSortOption("date_added");
  };

  if (initialItems.length === 0) {
    return (
      <div className="mega-glass mx-auto mt-6 flex max-w-lg flex-col items-center gap-4 rounded-[28px] p-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--mega-card-bg)] text-[var(--mega-text)]">
          <Bookmark className="h-7 w-7" />
        </span>
        <h2 className="text-lg font-bold text-[var(--mega-text)]">Votre liste est vide</h2>
        <p className="text-sm text-[var(--mega-text-muted)]">
          Ajoutez des films et séries à votre liste de surveillance depuis les pages détails ou MegaCompagnon pour les retrouver ici à tout moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Statistics Card */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="mega-glass rounded-2xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mega-text-muted)]">
            Total titres
          </span>
          <p className="mt-1 text-2xl font-black text-[var(--mega-text)]">{stats.total}</p>
        </div>

        <div className="mega-glass rounded-2xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mega-text-muted)]">
            Films
          </span>
          <p className="mt-1 text-2xl font-black text-[var(--mega-text)]">{stats.movies}</p>
        </div>

        <div className="mega-glass rounded-2xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mega-text-muted)]">
            Séries
          </span>
          <p className="mt-1 text-2xl font-black text-[var(--mega-text)]">{stats.series}</p>
        </div>

        <div className="mega-glass rounded-2xl p-4">
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--mega-text-muted)]">
            <Clock className="h-3 w-3" />
            Temps estimé
          </span>
          <p className="mt-1 text-xl font-black text-amber-400">
            {stats.estimatedHours} h {stats.estimatedMinutesRemainder > 0 ? `${stats.estimatedMinutesRemainder} min` : ""}
          </p>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Instant Search in Watchlist */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mega-text-faint)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer dans ma liste…"
            className="focus-ring h-10 w-full rounded-xl border border-[var(--mega-border)] bg-[var(--mega-input-bg)] pl-9 pr-8 text-sm text-[var(--mega-text)] outline-none transition focus:border-[var(--mega-border-strong)]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[var(--mega-text-faint)] hover:text-[var(--mega-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Interactive Sort Selector */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-[var(--mega-text-muted)]">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Trier par :
          </span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as WatchlistSortOption)}
            className="focus-ring h-10 rounded-xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 text-xs font-semibold text-[var(--mega-text)] outline-none transition hover:border-[var(--mega-border-strong)]"
          >
            <option value="date_added">Date d&apos;ajout (Récents)</option>
            <option value="rating">Note TMDB ⭐</option>
            <option value="title">Titre (A-Z)</option>
            <option value="year">Année de sortie</option>
          </select>
        </div>
      </div>

      {/* Filter Chips: Type and Status */}
      <div className="space-y-2.5">
        {/* Type Filter (Tous, Films, Séries, Documentaires) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--mega-text-faint)] mr-1">Type :</span>
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={clsx(
              "focus-ring inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              typeFilter === "all"
                ? "border border-white/20 bg-[var(--mega-text)] text-black"
                : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
            )}
          >
            <Sparkles className="h-3 w-3" />
            <span>Tous</span>
            <span className="opacity-70">({stats.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("movie")}
            className={clsx(
              "focus-ring inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              typeFilter === "movie"
                ? "border border-white/20 bg-[var(--mega-text)] text-black"
                : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
            )}
          >
            <Film className="h-3 w-3" />
            <span>Films</span>
            <span className="opacity-70">({stats.movies})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("tv")}
            className={clsx(
              "focus-ring inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              typeFilter === "tv"
                ? "border border-white/20 bg-[var(--mega-text)] text-black"
                : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
            )}
          >
            <Tv className="h-3 w-3" />
            <span>Séries</span>
            <span className="opacity-70">({stats.series})</span>
          </button>

          {stats.documentaries > 0 && (
            <button
              type="button"
              onClick={() => setTypeFilter("documentary")}
              className={clsx(
                "focus-ring inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                typeFilter === "documentary"
                  ? "border border-white/20 bg-[var(--mega-text)] text-black"
                  : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
              )}
            >
              <span>Documentaires</span>
              <span className="opacity-70">({stats.documentaries})</span>
            </button>
          )}
        </div>

        {/* Status Filter (Tous, À voir, Déjà vus) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--mega-text-faint)] mr-1">Statut :</span>
          <button
            type="button"
            onClick={() => setWatchedFilter("all")}
            className={clsx(
              "focus-ring inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
              watchedFilter === "all"
                ? "border border-white/20 bg-white/20 text-white"
                : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
            )}
          >
            Tous
          </button>

          <button
            type="button"
            onClick={() => setWatchedFilter("unwatched")}
            className={clsx(
              "focus-ring inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
              watchedFilter === "unwatched"
                ? "border border-amber-400/30 bg-amber-500/20 text-amber-300 font-bold"
                : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
            )}
          >
            <Eye className="h-3 w-3" />
            À voir (Non vus)
          </button>

          <button
            type="button"
            onClick={() => setWatchedFilter("watched")}
            className={clsx(
              "focus-ring inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
              watchedFilter === "watched"
                ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-300 font-bold"
                : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
            )}
          >
            <CheckCircle2 className="h-3 w-3" />
            Déjà vus
          </button>
        </div>

        {/* Quick Genres Filter Row */}
        {availableGenres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 [scrollbar-width:thin]">
            <span className="text-xs font-medium text-[var(--mega-text-faint)] shrink-0 mr-1">Genres :</span>
            <button
              type="button"
              onClick={() => setSelectedGenreId(null)}
              className={clsx(
                "focus-ring shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition",
                selectedGenreId == null
                  ? "border border-white/20 bg-white/20 text-white"
                  : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
              )}
            >
              Tous
            </button>

            {availableGenres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => setSelectedGenreId(selectedGenreId === genre.id ? null : genre.id)}
                className={clsx(
                  "focus-ring shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition",
                  selectedGenreId === genre.id
                    ? "border border-[var(--mega-red)]/60 bg-[var(--mega-red)]/20 text-[var(--mega-red)]"
                    : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
                )}
              >
                {genre.name} <span className="opacity-60 text-[10px]">({genre.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count and Reset Button */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[var(--mega-text-muted)]">
          {filteredAndSortedItems.length} titre{filteredAndSortedItems.length > 1 ? "s" : ""}{" "}
          {hasActiveFilters && <span>(filtré sur {initialItems.length})</span>}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="focus-ring inline-flex items-center gap-1 text-xs font-medium text-[var(--mega-red)] hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Grid of items */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {filteredAndSortedItems.map((item) => {
            const isWatched = watchedMediaIds.has(item.mediaId);
            return (
              <div key={item.mediaId} className="relative group">
                {/* Watched Badge Indicator */}
                {isWatched && (
                  <span className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/85 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40 shadow backdrop-blur">
                    <Check className="h-3 w-3" />
                    Vu
                  </span>
                )}

                {/* Rating Badge */}
                {item.voteAverage != null && item.voteAverage > 0 && (
                  <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-black/85 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30 shadow backdrop-blur">
                    ★ {item.voteAverage}
                  </span>
                )}

                <PosterCard item={item} fullWidth showPlay />
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Filtered State */
        <div className="mega-glass mx-auto max-w-md rounded-[24px] p-8 text-center space-y-4">
          <p className="text-sm font-semibold text-[var(--mega-text)]">
            Aucun titre ne correspond à vos filtres actuels.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-4 py-2 text-xs font-semibold text-[var(--mega-text)] transition hover:border-[var(--mega-border-strong)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
