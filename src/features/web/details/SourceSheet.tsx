"use client";

import { clsx } from "clsx";
import { Play, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Spinner } from "@/features/web/Spinner";
import { presentWebSource } from "@/lib/web/source-presentation";

export type SourceSheetItem = {
  url: string;
  groupId: string;
  groupLabel: string;
  title: string;
  quality: string;
  detail: string | null;
  label: string;
  type: "hls" | "mp4";
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  logoUrl?: string | null;
  loading?: boolean;
  sources: SourceSheetItem[];
  selectedUrl?: string | null;
  onSelect: (source: SourceSheetItem) => void;
  emptyHint?: string;
};

function Badge({ label, tone }: { label: string; tone: ReturnType<typeof presentWebSource>["badges"][0]["tone"] }) {
  const styles = {
    good: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    gold: "border-amber-500/40 bg-amber-500/12 text-amber-300",
    blue: "border-sky-500/40 bg-sky-500/12 text-sky-300",
    pink: "border-fuchsia-500/40 bg-fuchsia-500/12 text-fuchsia-300",
    purple: "border-violet-500/40 bg-violet-500/12 text-violet-300",
    cyan: "border-cyan-500/40 bg-cyan-500/12 text-cyan-300",
    muted: "border-white/15 bg-white/6 text-white/65"
  } as const;

  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", styles[tone])}>
      {label}
    </span>
  );
}

export function SourceSheet({
  open,
  onClose,
  title,
  logoUrl,
  loading = false,
  sources,
  selectedUrl,
  onSelect,
  emptyHint
}: Props) {
  const tabs = useMemo(() => {
    const map = new Map<string, string>();
    for (const source of sources) {
      if (!map.has(source.groupId)) map.set(source.groupId, source.groupLabel);
    }
    return [{ id: "all", label: "All" }, ...[...map.entries()].map(([id, label]) => ({ id, label }))];
  }, [sources]);

  const [tab, setTab] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return sources;
    return sources.filter((source) => source.groupId === tab);
  }, [sources, tab]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center" role="dialog" aria-modal aria-label="Sources">
      <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-label="Fermer" onClick={onClose} />
      <div className="relative z-[1] flex max-h-[min(92vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#0d1114] shadow-2xl sm:rounded-[28px]">
        <div className="shrink-0 px-5 pt-5">
          <div className="mb-3 flex min-h-[52px] items-center justify-center">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={title} className="max-h-12 max-w-[70%] object-contain" />
            ) : (
              <h2 className="truncate text-center text-lg font-bold text-white">{title}</h2>
            )}
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-white/55">{sources.length} sources disponibles</p>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/15"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {tabs.length > 2 ? (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={clsx(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                    tab === item.id
                      ? "border-white/35 bg-white/18 text-white"
                      : "border-white/12 bg-white/7 text-white/80 hover:border-white/20"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="h-px bg-white/10" />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          {loading ? (
            <div className="grid place-items-center py-16">
              <Spinner size="md" />
              <p className="mt-3 text-sm text-white/55">Recherche de sources…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/55">{emptyHint || "Aucune source trouvée."}</p>
          ) : (
            <div className="space-y-2 pb-4">
              {filtered.map((source, index) => {
                const presentation = presentWebSource(source);
                const selected = selectedUrl === source.url;
                return (
                  <button
                    key={`${source.url}-${index}`}
                    type="button"
                    onClick={() => onSelect(source)}
                    className={clsx(
                      "focus-ring w-full rounded-xl border px-3.5 py-3 text-left transition",
                      selected
                        ? "border-sky-500/50 bg-sky-500/12"
                        : presentation.isCached
                          ? "border-amber-500/25 bg-white/7 hover:bg-white/10"
                          : "border-white/10 bg-white/4 hover:bg-white/7"
                    )}
                  >
                    <div className="flex gap-2.5">
                      <span className="mt-0.5 shrink-0 text-white/40">
                        {presentation.isCached ? <Play className="h-3.5 w-3.5 text-amber-400" fill="currentColor" /> : <Star className="h-3.5 w-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-white">{presentation.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-white/45">▷ {presentation.addonLabel}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {presentation.badges.map((badge) => (
                            <Badge key={`${source.url}-${badge.label}`} label={badge.label} tone={badge.tone} />
                          ))}
                          {presentation.sizeLabel ? (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                              Size {presentation.sizeLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
