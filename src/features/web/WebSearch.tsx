"use client";

import { clsx } from "clsx";
import { Clock, Film, Flame, Search, Sparkles, Trash2, Tv, User, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ActorModal } from "@/features/web/details/ActorModal";
import { PosterCard } from "@/features/web/PosterCard";
import { SpinnerOverlay } from "@/features/web/Spinner";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { WebSearchItem } from "@/app/api/web/search/route";

const DEBOUNCE_MS = 320;
const MIN_CHARS = 2;
const RECENT_SEARCHES_KEY = "megatv_web_recent_searches";
const MAX_RECENT = 10;

type FilterType = "all" | "movie" | "tv" | "person";

export function WebSearch() {
  const { activeProfileId } = useWebProfile();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WebSearchItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  // Trending & Suggestions
  const [trending, setTrending] = useState<WebSearchItem[]>([]);
  const [popularQueries, setPopularQueries] = useState<string[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // Recent searches history (lazy initialized from localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        }
      }
    } catch {
      /* ignore */
    }
    return [];
  });

  // Actor modal inspection
  const [selectedPerson, setSelectedPerson] = useState<{ id: number; name: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = useRef(0);
  const cache = useRef<Map<string, WebSearchItem[]>>(new Map());

  // Fetch trending items and popular searches once
  useEffect(() => {
    let active = true;
    fetch("/api/web/search?mode=trending")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("http"))))
      .then((data: { trending?: WebSearchItem[]; popularQueries?: string[] }) => {
        if (!active) return;
        setTrending(data.trending || []);
        if (data.popularQueries && data.popularQueries.length > 0) {
          setPopularQueries(data.popularQueries);
        } else {
          setPopularQueries(["Dune", "Deadpool", "The Penguin", "Gladiator", "Arcane", "Stranger Things"]);
        }
        setLoadingTrending(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadingTrending(false);
        setPopularQueries(["Dune", "Deadpool", "The Penguin", "Gladiator", "Arcane", "Stranger Things"]);
      });

    return () => {
      active = false;
    };
  }, []);

  // Universal keyboard shortcut: Cmd+K / Ctrl+K or '/'
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (event.key === "/" && !isInput) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (clean.length < MIN_CHARS) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const next = [clean, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((term: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const executeSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      const trimmed = value.trim();

      if (trimmed.length < MIN_CHARS) {
        setResults([]);
        setState("idle");
        return;
      }

      const cached = cache.current.get(trimmed.toLowerCase());
      if (cached) {
        setResults(cached);
        setState("done");
        saveRecentSearch(trimmed);
        return;
      }

      setState("loading");
      const reqId = ++reqRef.current;
      timerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/web/search?q=${encodeURIComponent(trimmed)}`);
          if (!res.ok) throw new Error("search failed");
          const json = (await res.json()) as { results?: WebSearchItem[] };
          const items = json.results || [];
          cache.current.set(trimmed.toLowerCase(), items);
          if (reqId === reqRef.current) {
            setResults(items);
            setState("done");
            saveRecentSearch(trimmed);
          }
        } catch {
          if (reqId === reqRef.current) {
            setResults([]);
            setState("done");
          }
        }
      }, DEBOUNCE_MS);
    },
    [saveRecentSearch]
  );

  const handleApplyTerm = useCallback(
    (term: string) => {
      executeSearch(term);
      inputRef.current?.focus();
    },
    [executeSearch]
  );

  const handleKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const trimmed = query.trim();
      if (trimmed.length >= MIN_CHARS) {
        saveRecentSearch(trimmed);
      }
    }
  };

  const trimmedQuery = query.trim();
  const isQueryActive = trimmedQuery.length >= MIN_CHARS;

  // Active items: either search results or trending suggestions
  const rawItems = isQueryActive ? results : trending;

  // Apply type filter
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const isPerson = Boolean(item.isPerson || (item.mediaId && item.mediaId.startsWith("person-")));
      if (typeFilter === "movie") return !isPerson && item.mediaType === "movie";
      if (typeFilter === "tv") return !isPerson && item.mediaType === "tv";
      if (typeFilter === "person") return isPerson;
      return true;
    });
  }, [rawItems, typeFilter]);

  // Counts for filter pills
  const counts = useMemo(() => {
    let movies = 0;
    let series = 0;
    let persons = 0;
    for (const item of rawItems) {
      if (item.isPerson || item.mediaId?.startsWith("person-")) {
        persons++;
      } else if (item.mediaType === "tv") {
        series++;
      } else {
        movies++;
      }
    }
    return {
      all: rawItems.length,
      movie: movies,
      tv: series,
      person: persons
    };
  }, [rawItems]);

  return (
    <div className="space-y-8">
      {/* Search Input Bar */}
      <div className="relative mx-auto w-full max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mega-text-faint)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => executeSearch(event.target.value)}
          onKeyDown={handleKeyDownInput}
          placeholder="Rechercher un film, une série, un acteur…"
          className="focus-ring h-14 w-full rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] pl-12 pr-28 text-base text-[var(--mega-text)] outline-none transition focus:border-[var(--mega-border-strong)]"
          aria-label="Recherche"
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => executeSearch("")}
              aria-label="Effacer"
              className="focus-ring grid h-8 w-8 place-items-center rounded-full text-[var(--mega-text-faint)] transition hover:bg-[var(--mega-card-bg)] hover:text-[var(--mega-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {/* Keyboard shortcut hint */}
          <kbd
            title="Raccourci clavier focus"
            className="hidden select-none items-center rounded-md border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/80 px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--mega-text-faint)] shadow-sm backdrop-blur sm:inline-flex"
          >
            ⌘K / /
          </kbd>
        </div>
      </div>

      {/* Type Filter Chips (Tous, Films, Séries, Acteurs / Personnalités) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={clsx(
            "focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition",
            typeFilter === "all"
              ? "border border-white/20 bg-[var(--mega-text)] text-black shadow"
              : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tous</span>
          {rawItems.length > 0 && <span className="opacity-70">({counts.all})</span>}
        </button>

        <button
          type="button"
          onClick={() => setTypeFilter("movie")}
          className={clsx(
            "focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition",
            typeFilter === "movie"
              ? "border border-white/20 bg-[var(--mega-text)] text-black shadow"
              : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
          )}
        >
          <Film className="h-3.5 w-3.5" />
          <span>Films</span>
          {rawItems.length > 0 && <span className="opacity-70">({counts.movie})</span>}
        </button>

        <button
          type="button"
          onClick={() => setTypeFilter("tv")}
          className={clsx(
            "focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition",
            typeFilter === "tv"
              ? "border border-white/20 bg-[var(--mega-text)] text-black shadow"
              : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
          )}
        >
          <Tv className="h-3.5 w-3.5" />
          <span>Séries</span>
          {rawItems.length > 0 && <span className="opacity-70">({counts.tv})</span>}
        </button>

        <button
          type="button"
          onClick={() => setTypeFilter("person")}
          className={clsx(
            "focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition",
            typeFilter === "person"
              ? "border border-white/20 bg-[var(--mega-text)] text-black shadow"
              : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
          )}
        >
          <User className="h-3.5 w-3.5" />
          <span>Acteurs / Personnalités</span>
          {rawItems.length > 0 && <span className="opacity-70">({counts.person})</span>}
        </button>
      </div>

      {/* Recent Searches Section */}
      {recentSearches.length > 0 && !isQueryActive && (
        <section className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--mega-text-muted)]">
              <Clock className="h-3.5 w-3.5 text-[var(--mega-text-faint)]" />
              Recherches récentes
            </span>
            <button
              type="button"
              onClick={clearAllRecentSearches}
              className="focus-ring inline-flex items-center gap-1 text-[11px] font-medium text-[var(--mega-text-faint)] transition hover:text-[var(--mega-red)]"
            >
              <Trash2 className="h-3 w-3" />
              Tout effacer
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <span
                key={term}
                onClick={() => handleApplyTerm(term)}
                className="focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3.5 py-1.5 text-xs text-[var(--mega-text)] transition hover:border-[var(--mega-border-strong)] hover:bg-[var(--mega-surface)]"
              >
                <span>{term}</span>
                <button
                  type="button"
                  aria-label={`Supprimer ${term}`}
                  onClick={(e) => removeRecentSearch(term, e)}
                  className="rounded-full p-0.5 text-[var(--mega-text-faint)] transition hover:bg-black/30 hover:text-[var(--mega-text)]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Popular Trending Keywords (Shown before input) */}
      {!isQueryActive && popularQueries.length > 0 && (
        <section className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-center gap-1.5 px-1">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mega-text-muted)]">
              Recherches populaires
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularQueries.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleApplyTerm(term)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3.5 py-1.5 text-xs text-[var(--mega-text)] transition hover:border-amber-400/40 hover:bg-[var(--mega-surface)] hover:text-white"
              >
                <Search className="h-3 w-3 text-amber-400/80" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Loading Spinner */}
      {state === "loading" ? <SpinnerOverlay label="Recherche en cours…" /> : null}

      {/* Grid of Results (or Trending if query is empty) */}
      {filteredItems.length > 0 ? (
        <section className="space-y-4">
          {!isQueryActive && (
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--mega-text)]">
                <Flame className="h-5 w-5 text-amber-400" />
                Tendances TMDB
              </h2>
              <span className="text-xs text-[var(--mega-text-faint)]">
                {filteredItems.length} titres populaires
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {filteredItems.map((item, index) => {
              const isPerson = Boolean(item.isPerson || item.mediaId.startsWith("person-"));

              if (isPerson) {
                return (
                  <button
                    key={item.mediaId}
                    type="button"
                    onClick={() =>
                      setSelectedPerson({
                        id: item.tmdbId ?? 0,
                        name: item.title
                      })
                    }
                    className="focus-ring group flex flex-col items-center rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] p-3 text-center transition hover:border-[var(--mega-border-strong)] hover:bg-[var(--mega-surface)]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--mega-surface)]">
                      {item.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[var(--mega-text-faint)]">
                          <User className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2.5 line-clamp-1 w-full text-xs font-semibold text-[var(--mega-text)]">
                      {item.title}
                    </p>
                    <p className="line-clamp-1 w-full text-[10px] text-[var(--mega-text-muted)]">
                      {item.subtitle || "Personnalité"}
                    </p>
                  </button>
                );
              }

              return (
                <div key={item.mediaId} className="relative">
                  {/* Trending Rank Pill if in trending mode */}
                  {!isQueryActive && index < 10 ? (
                    <span className="pointer-events-none absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-[11px] font-black text-amber-400 shadow backdrop-blur border border-amber-400/40">
                      {index + 1}
                    </span>
                  ) : null}
                  <PosterCard item={item} fullWidth showPlay />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* No results when query is active */}
      {isQueryActive && state === "done" && filteredItems.length === 0 ? (
        <div className="mega-glass mx-auto max-w-md rounded-[24px] p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-[var(--mega-text)]">
            Aucun résultat pour «&nbsp;{trimmedQuery}&nbsp;»
          </p>
          {typeFilter !== "all" ? (
            <p className="text-xs text-[var(--mega-text-muted)]">
              Aucun élément dans la catégorie sélectionnée.
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className="ml-1 text-[var(--mega-red)] underline hover:text-[var(--mega-red)]/80"
              >
                Afficher tout
              </button>
            </p>
          ) : (
            <p className="text-xs text-[var(--mega-text-muted)]">
              Vérifiez l&apos;orthographe ou essayez un mot-clé plus général.
            </p>
          )}
        </div>
      ) : null}

      {/* Empty state while trending is loading and query is short */}
      {!isQueryActive && loadingTrending && (
        <div className="py-12 text-center text-xs text-[var(--mega-text-faint)]">
          Chargement des tendances…
        </div>
      )}

      {/* Actor Filmography & Bio Modal */}
      {selectedPerson ? (
        <ActorModal
          personId={selectedPerson.id}
          fallbackName={selectedPerson.name}
          profileId={activeProfileId || ""}
          onClose={() => setSelectedPerson(null)}
        />
      ) : null}
    </div>
  );
}
