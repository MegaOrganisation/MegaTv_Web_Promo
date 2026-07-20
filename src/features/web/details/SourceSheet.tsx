"use client";

import { clsx } from "clsx";
import { Play, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { MegaDialog } from "@/features/web/MegaDialog";
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
    muted: "border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)]"
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

  const filtered = useMemo(() => {
    if (tab === "all") return sources;
    return sources.filter((source) => source.groupId === tab);
  }, [sources, tab]);

  return (
    <MegaDialog
      open={open}
      onClose={onClose}
      label="Sources"
      size="md"
      presentation="sheet"
      panelClassName="flex max-h-[min(92vh,820px)] flex-col overflow-hidden"
    >
      <div className="shrink-0 px-5 pt-5">
        <div className="mb-3 flex min-h-[52px] items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={title} className="max-h-12 max-w-[70%] object-contain" />
          ) : (
            <h2 className="truncate text-center text-lg font-bold text-[var(--mega-text)]">{title}</h2>
          )}
        </div>

        <p className="mb-3 text-xs text-[var(--mega-text-muted)]">{sources.length} sources disponibles</p>

        {tabs.length > 2 ? (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={clsx(
                  "focus-ring shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  tab === item.id
                    ? "border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)] text-[var(--mega-text)]"
                    : "border-[var(--mega-border)] bg-[var(--mega-input-bg)] text-[var(--mega-text-muted)] hover:border-[var(--mega-border-strong)]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="h-px bg-[var(--mega-border)]" />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Spinner size="md" />
            <p className="mt-3 text-sm text-[var(--mega-text-muted)]">Recherche de sources…</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-[var(--mega-text-muted)]">{emptyHint || "Aucune source trouvée."}</p>
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
                        ? "border-amber-500/25 bg-[var(--mega-card-bg)] hover:bg-[var(--mega-input-bg)]"
                        : "border-[var(--mega-border)] bg-[var(--mega-input-bg)] hover:bg-[var(--mega-card-bg)]"
                  )}
                >
                  <div className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-[var(--mega-text-faint)]">
                      {presentation.isCached ? (
                        <Play className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
                      ) : (
                        <Star className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[var(--mega-text)]">{presentation.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[var(--mega-text-muted)]">▷ {presentation.addonLabel}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {presentation.badges.map((badge) => (
                          <Badge key={`${source.url}-${badge.label}`} label={badge.label} tone={badge.tone} />
                        ))}
                        {presentation.sizeLabel ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mega-text-faint)]">
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
    </MegaDialog>
  );
}
