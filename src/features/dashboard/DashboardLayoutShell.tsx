"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { Check, Clock3, Film, GripVertical, Maximize2, Minimize2, PlayCircle, Plus, Trash2, Tv, X } from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { formatDuration, formatNumber } from "@/lib/format";

export type DashboardBlockId =
  | "kpi-movies"
  | "kpi-episodes"
  | "kpi-time"
  | "kpi-continue"
  | "continue-watching"
  | "donut-chart"
  | "top-content"
  | "activity-chart"
  | "history"
  | `custom-${string}`;

export type BlockSize = "compact" | "default" | "wide" | "full";

export type CustomKpiConfig = {
  id: string;
  label: string;
  metric: "movies" | "episodes" | "watch_time" | "continue" | "page_views" | "history_events";
};

type LayoutState = {
  order: DashboardBlockId[];
  sizes: Partial<Record<DashboardBlockId, BlockSize>>;
  customKpis: CustomKpiConfig[];
};

const storageKey = "megacompanion_dashboard_layout_v2";

const defaultOrder: DashboardBlockId[] = [
  "kpi-movies",
  "kpi-episodes",
  "kpi-time",
  "kpi-continue",
  "continue-watching",
  "donut-chart",
  "top-content",
  "activity-chart",
  "history"
];

const sizeClasses: Record<BlockSize, string> = {
  compact: "max-w-sm",
  default: "max-w-none",
  wide: "xl:col-span-2",
  full: "w-full xl:col-span-2"
};

type Props = {
  blocks: Record<string, ReactNode>;
  editMode: boolean;
  onEditModeChange?: (value: boolean) => void;
  showEditChrome?: boolean;
  metrics?: {
    movies: number;
    episodes: number;
    watchTime: number;
    continue: number;
    pageViews: number;
    historyEvents: number;
  };
};

export function DashboardLayoutShell({ blocks, editMode, onEditModeChange, showEditChrome = true, metrics }: Props) {
  const [layout, setLayout] = useState<LayoutState>({ order: defaultOrder, sizes: {}, customKpis: [] });
  const [dragId, setDragId] = useState<DashboardBlockId | null>(null);
  const [touchDragId, setTouchDragId] = useState<DashboardBlockId | null>(null);
  const touchTargetRef = useRef<DashboardBlockId | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LayoutState;
      if (Array.isArray(parsed.order)) {
        setLayout({
          order: parsed.order,
          sizes: parsed.sizes || {},
          customKpis: parsed.customKpis || []
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(layout));
  }, [layout]);

  const ordered = useMemo(() => {
    const known = layout.order.filter((id) => blocks[id] || id.startsWith("custom-"));
    const missing = Object.keys(blocks).filter((id) => !known.includes(id as DashboardBlockId));
    return [...known, ...missing] as DashboardBlockId[];
  }, [blocks, layout.order]);

  function renderCustomKpi(config: CustomKpiConfig) {
    if (!metrics) return null;
    const valueByMetric = {
      movies: formatNumber(metrics.movies),
      episodes: formatNumber(metrics.episodes),
      watch_time: formatDuration(metrics.watchTime),
      continue: formatNumber(metrics.continue),
      page_views: formatNumber(metrics.pageViews),
      history_events: formatNumber(metrics.historyEvents)
    } as const;
    const iconByMetric = {
      movies: Film,
      episodes: Tv,
      watch_time: Clock3,
      continue: PlayCircle,
      page_views: Clock3,
      history_events: Clock3
    } as const;
    const toneByMetric = {
      movies: "blue",
      episodes: "green",
      watch_time: "gold",
      continue: "pink",
      page_views: "blue",
      history_events: "pink"
    } as const;

    return (
      <KpiCard
        label={config.label}
        value={valueByMetric[config.metric]}
        hint="KPI personnalisé"
        icon={iconByMetric[config.metric]}
        tone={toneByMetric[config.metric]}
      />
    );
  }

  function reorder(sourceId: DashboardBlockId, targetId: DashboardBlockId) {
    if (sourceId === targetId) return;
    setLayout((current) => {
      const nextOrder = [...current.order];
      const from = nextOrder.indexOf(sourceId);
      const to = nextOrder.indexOf(targetId);
      if (from < 0 || to < 0) return current;
      nextOrder.splice(from, 1);
      nextOrder.splice(to, 0, sourceId);
      return { ...current, order: nextOrder };
    });
  }

  function setBlockSize(id: DashboardBlockId, size: BlockSize) {
    setLayout((current) => ({ ...current, sizes: { ...current.sizes, [id]: size } }));
  }

  function addCustomKpi() {
    const id = `custom-${Date.now()}`;
    const entry: CustomKpiConfig = { id, label: "Nouveau KPI", metric: "movies" };
    setLayout((current) => ({
      ...current,
      customKpis: [...current.customKpis, entry],
      order: [...current.order, id as DashboardBlockId]
    }));
  }

  function removeCustomKpi(id: string) {
    setLayout((current) => ({
      ...current,
      customKpis: current.customKpis.filter((item) => item.id !== id),
      order: current.order.filter((item) => item !== id)
    }));
  }

  function updateCustomKpi(id: string, patch: Partial<CustomKpiConfig>) {
    setLayout((current) => ({
      ...current,
      customKpis: current.customKpis.map((item) => (item.id === id ? { ...item, ...patch } : item))
    }));
  }

  const kpiIds = ordered.filter((id) => id.startsWith("kpi-") || id.startsWith("custom-"));
  const panelIds = ordered.filter((id) => !id.startsWith("kpi-") && !id.startsWith("custom-"));

  return (
    <div className="min-w-0 max-w-full space-y-6">
      {showEditChrome && editMode ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-4 py-3">
          <p className="text-sm text-[var(--mega-text-muted)]">Mode édition — glissez-déposez les cartes, redimensionnez ou ajoutez un KPI.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={addCustomKpi} className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] px-3 py-1.5 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              KPI custom
            </button>
            <button type="button" onClick={() => onEditModeChange?.(false)} className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] px-3 py-1.5 text-xs font-semibold">
              <Check className="h-3.5 w-3.5" />
              Terminer
            </button>
          </div>
        </div>
      ) : null}

      <div className={clsx("grid min-w-0 max-w-full gap-4", editMode ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-4")}>
        {kpiIds.map((id) => (
          <DashboardBlock
            key={id}
            id={id}
            editMode={editMode}
            size={layout.sizes[id] || "default"}
            dragging={dragId === id || touchDragId === id}
            customKpi={layout.customKpis.find((item) => item.id === id)}
            onCustomKpiChange={(patch) => updateCustomKpi(id, patch)}
            onRemoveCustom={() => removeCustomKpi(id)}
            onDragStart={() => setDragId(id)}
            onDragEnd={() => setDragId(null)}
            onDropOn={() => {
              if (dragId) reorder(dragId, id);
              if (touchDragId) reorder(touchDragId, id);
              setDragId(null);
              setTouchDragId(null);
            }}
            onTouchDragStart={() => {
              setTouchDragId(id);
              touchTargetRef.current = id;
            }}
            onTouchDragEnter={() => {
              if (touchDragId && touchDragId !== id) touchTargetRef.current = id;
            }}
            onTouchDragEnd={() => {
              if (touchDragId && touchTargetRef.current) reorder(touchDragId, touchTargetRef.current);
              setTouchDragId(null);
              touchTargetRef.current = null;
            }}
            onResize={(size) => setBlockSize(id, size)}
          >
            {blocks[id] ?? (layout.customKpis.find((item) => item.id === id) ? renderCustomKpi(layout.customKpis.find((item) => item.id === id)!) : null)}
          </DashboardBlock>
        ))}
      </div>

      <div className="grid min-w-0 max-w-full gap-6 xl:grid-cols-2">
        {panelIds.map((id) => (
          <DashboardBlock
            key={id}
            id={id}
            editMode={editMode}
            size={layout.sizes[id] || (id === "continue-watching" || id === "activity-chart" ? "wide" : "default")}
            dragging={dragId === id || touchDragId === id}
            onDragStart={() => setDragId(id)}
            onDragEnd={() => setDragId(null)}
            onDropOn={() => {
              if (dragId) reorder(dragId, id);
              if (touchDragId) reorder(touchDragId, id);
              setDragId(null);
              setTouchDragId(null);
            }}
            onTouchDragStart={() => {
              setTouchDragId(id);
              touchTargetRef.current = id;
            }}
            onTouchDragEnter={() => {
              if (touchDragId && touchDragId !== id) touchTargetRef.current = id;
            }}
            onTouchDragEnd={() => {
              if (touchDragId && touchTargetRef.current) reorder(touchDragId, touchTargetRef.current);
              setTouchDragId(null);
              touchTargetRef.current = null;
            }}
            onResize={(size) => setBlockSize(id, size)}
            className={clsx(sizeClasses[layout.sizes[id] || "default"], layout.sizes[id] === "full" && "xl:col-span-2")}
          >
            {blocks[id]}
          </DashboardBlock>
        ))}
      </div>
    </div>
  );
}

function DashboardBlock({
  id,
  editMode,
  size,
  dragging,
  customKpi,
  onCustomKpiChange,
  onRemoveCustom,
  onDragStart,
  onDragEnd,
  onDropOn,
  onTouchDragStart,
  onTouchDragEnter,
  onTouchDragEnd,
  onResize,
  className,
  children
}: {
  id: DashboardBlockId;
  editMode: boolean;
  size: BlockSize;
  dragging?: boolean;
  customKpi?: CustomKpiConfig;
  onCustomKpiChange?: (patch: Partial<CustomKpiConfig>) => void;
  onRemoveCustom?: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropOn: () => void;
  onTouchDragStart: () => void;
  onTouchDragEnter: () => void;
  onTouchDragEnd: () => void;
  onResize: (size: BlockSize) => void;
  className?: string;
  children: ReactNode;
}) {
  const isCustom = id.startsWith("custom-");

  return (
    <div
      className={clsx(
        "relative min-w-0 max-w-full transition",
        className,
        sizeClasses[size],
        editMode && "rounded-[28px] ring-2 ring-[var(--mega-border-strong)] ring-offset-2 ring-offset-transparent max-lg:ring-offset-0 lg:dashboard-edit-shake",
        dragging && "opacity-70"
      )}
      draggable={editMode}
      onDragStart={(event) => {
        if (!editMode) return;
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (!editMode) return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!editMode) return;
        event.preventDefault();
        onDropOn();
      }}
      onTouchStart={() => {
        if (editMode) onTouchDragStart();
      }}
      onTouchMove={() => {
        if (editMode) onTouchDragEnter();
      }}
      onTouchEnd={() => {
        if (editMode) onTouchDragEnd();
      }}
    >
      {editMode ? (
        <div className="absolute right-3 top-3 z-20 flex flex-wrap items-center gap-1">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] text-[var(--mega-text-muted)]">
            <GripVertical className="h-4 w-4" />
          </span>
          <button type="button" className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-shell-nav)]" onClick={() => onResize(size === "wide" ? "default" : "wide")} aria-label="Redimensionner">
            {size === "wide" || size === "full" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {isCustom ? (
            <button type="button" className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-300/30 bg-red-500/10 text-red-100" onClick={onRemoveCustom} aria-label="Supprimer le KPI">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {editMode && isCustom && customKpi ? (
        <div className="mb-3 grid gap-2 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] p-3">
          <input
            value={customKpi.label}
            onChange={(event) => onCustomKpiChange?.({ label: event.target.value })}
            className="focus-ring rounded-xl border border-[var(--mega-border)] bg-transparent px-3 py-2 text-sm"
            placeholder="Titre du KPI"
          />
          <select
            value={customKpi.metric}
            onChange={(event) => onCustomKpiChange?.({ metric: event.target.value as CustomKpiConfig["metric"] })}
            className="focus-ring rounded-xl border border-[var(--mega-border)] bg-transparent px-3 py-2 text-sm"
          >
            <option value="movies">Films regardés</option>
            <option value="episodes">Épisodes regardés</option>
            <option value="watch_time">Temps total</option>
            <option value="continue">Reprises</option>
            <option value="page_views">Pages Companion</option>
            <option value="history_events">Événements historique</option>
          </select>
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function DashboardEditToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Terminer la personnalisation" : "Personnaliser le dashboard"}
      className={clsx(
        "focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition",
        active
          ? "border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)] text-[var(--mega-text)]"
          : "border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
      )}
    >
      {active ? <X className="h-4 w-4" /> : <PencilIcon />}
    </button>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
