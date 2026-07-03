"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PosterCard } from "@/features/web/PosterCard";
import { SpinnerOverlay } from "@/features/web/Spinner";
import type { WebMediaItem } from "@/lib/web/media";

const DEBOUNCE_MS = 350;
const MIN_CHARS = 2;

export function WebSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WebMediaItem[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = useRef(0);
  // Session cache: same query never re-hits the network (Free Tier).
  const cache = useRef<Map<string, WebMediaItem[]>>(new Map());

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onChange = (value: string) => {
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
      return;
    }

    setState("loading");
    const reqId = ++reqRef.current;
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/web/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error("search failed");
        const json = (await res.json()) as { results?: WebMediaItem[] };
        const items = json.results || [];
        cache.current.set(trimmed.toLowerCase(), items);
        if (reqId === reqRef.current) {
          setResults(items);
          setState("done");
        }
      } catch {
        if (reqId === reqRef.current) {
          setResults([]);
          setState("done");
        }
      }
    }, DEBOUNCE_MS);
  };

  const trimmed = query.trim();

  return (
    <div className="space-y-8">
      <div className="relative mx-auto w-full max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mega-text-faint)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Rechercher un film, une série…"
          className="focus-ring h-14 w-full rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] pl-12 pr-12 text-base text-[var(--mega-text)] outline-none transition focus:border-[var(--mega-border-strong)]"
          aria-label="Recherche"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Effacer"
            className="focus-ring absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[var(--mega-text-faint)] transition hover:bg-[var(--mega-card-bg)] hover:text-[var(--mega-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {state === "loading" ? <SpinnerOverlay label="Recherche…" /> : null}

      {state === "done" && results.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {results.map((item) => (
            <PosterCard key={item.mediaId} item={item} fullWidth showPlay />
          ))}
        </div>
      ) : null}

      {state === "done" && results.length === 0 && trimmed.length >= MIN_CHARS ? (
        <p className="mega-glass mx-auto max-w-md rounded-[24px] p-8 text-center text-sm text-[var(--mega-text-muted)]">
          Aucun résultat pour «&nbsp;{trimmed}&nbsp;».
        </p>
      ) : null}

      {state === "idle" && trimmed.length < MIN_CHARS ? (
        <p className="mx-auto max-w-md text-center text-sm text-[var(--mega-text-faint)]">
          Saisissez au moins {MIN_CHARS} caractères pour lancer la recherche globale.
        </p>
      ) : null}
    </div>
  );
}
