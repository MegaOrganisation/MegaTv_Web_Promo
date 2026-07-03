"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PosterCard } from "@/features/web/PosterCard";
import type { WebLayout } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

type SortMode = "title-asc" | "title-desc";

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
  const [sort, setSort] = useState<SortMode>("title-asc");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSort("title-asc");
    }
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = items;
    if (q) {
      next = next.filter((item) => item.title.toLowerCase().includes(q));
    }
    return [...next].sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      return sort === "title-asc" ? cmp : -cmp;
    });
  }, [items, query, sort]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/78 backdrop-blur-md" aria-label="Fermer" onClick={onClose} />
      <div className="relative z-[1] flex max-h-[min(92vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[var(--mega-border-strong)] bg-[var(--mega-shell)] shadow-2xl">
        <div className="border-b border-[var(--mega-border)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <label className="relative min-w-[12rem] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mega-text-faint)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filtrer par titre…"
                  className="w-full rounded-full border border-[var(--mega-border)] bg-[var(--mega-surface)] py-2 pl-9 pr-3 text-sm text-[var(--mega-text)] outline-none transition focus:border-[var(--mega-border-strong)]"
                />
              </label>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className="rounded-full border border-[var(--mega-border)] bg-[var(--mega-surface)] px-3 py-2 text-sm text-[var(--mega-text)] outline-none focus:border-[var(--mega-border-strong)]"
                aria-label="Trier"
              >
                <option value="title-asc">Titre A → Z</option>
                <option value="title-desc">Titre Z → A</option>
              </select>
              <span className="text-xs text-[var(--mega-text-muted)]">
                {visible.length} / {items.length}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="mega-rail-bar h-[18px] w-1 rounded-sm bg-white/90" aria-hidden />
                <h2 className="max-w-[14rem] truncate text-right text-lg font-bold text-[var(--mega-text)]">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-[var(--mega-border)] text-[var(--mega-text-muted)] transition hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <h2 className="mt-2 truncate text-lg font-bold text-[var(--mega-text)] sm:hidden">{title}</h2>
        </div>
        <div className="overflow-y-auto p-5">
          {visible.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--mega-text-muted)]">Aucun résultat pour ce filtre.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {visible.map((item) => (
                <PosterCard key={item.mediaId} item={item} layout={layout} fullWidth />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
