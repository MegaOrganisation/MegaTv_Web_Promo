"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { PosterCard } from "@/features/web/PosterCard";
import type { WebLayout } from "@/lib/web/prefs";
import type { WebMediaItem } from "@/lib/web/media";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-label="Fermer" onClick={onClose} />
      <div className="relative z-[1] flex max-h-[min(90vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[var(--mega-border-strong)] bg-[var(--mega-shell)] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--mega-border)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="mega-rail-bar h-[18px] w-1 shrink-0 rounded-sm bg-white" aria-hidden />
            <h2 className="truncate text-lg font-bold text-[var(--mega-text)]">{title}</h2>
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
        <div className="overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <PosterCard key={item.mediaId} item={item} layout={layout} fullWidth />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
