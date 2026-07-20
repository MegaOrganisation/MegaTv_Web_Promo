"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { clsx } from "clsx";
import {
  Check,
  Clock3,
  Film,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
  Tv,
  PlayCircle,
  Eye,
  EyeOff,
  X
} from "lucide-react";

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

export type ColSpan = 1 | 2 | 3 | 4;

export type CustomKpiConfig = {
  id: string;
  label: string;
  metric: "movies" | "episodes" | "watch_time" | "continue" | "page_views" | "history_events";
};

type LayoutState = {
  order: DashboardBlockId[];
  hidden: DashboardBlockId[];
  spans: Partial<Record<string, ColSpan>>;
  customKpis: CustomKpiConfig[];
};

const storageKey = "megacompanion_dashboard_layout_v4";
const legacyKeys = ["megacompanion_dashboard_layout_v3", "megacompanion_dashboard_layout_v2"];

const BLOCK_LABELS: Record<string, string> = {
  "kpi-movies": "KPI Films",
  "kpi-episodes": "KPI Épisodes",
  "kpi-time": "KPI Temps",
  "kpi-continue": "KPI Reprises",
  "continue-watching": "Reprendre",
  "donut-chart": "Répartition",
  "top-content": "Top contenus",
  "activity-chart": "Progression",
  history: "Historique"
};

/** Grille 4 cols sans trou : CW|donut 2+2, top full, activity|history 2+2 */
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

const defaultSpans: Partial<Record<DashboardBlockId, ColSpan>> = {
  "kpi-movies": 1,
  "kpi-episodes": 1,
  "kpi-time": 1,
  "kpi-continue": 1,
  "continue-watching": 2,
  "donut-chart": 2,
  "top-content": 4,
  "activity-chart": 2,
  history: 2
};

const spanClass: Record<ColSpan, string> = {
  1: "col-span-1",
  2: "col-span-1 sm:col-span-2",
  3: "col-span-1 sm:col-span-2 xl:col-span-3",
  4: "col-span-1 sm:col-span-2 xl:col-span-4"
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

function clampSpan(n: number): ColSpan {
  if (n <= 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 4;
}

function migrateLegacy(raw: string): LayoutState | null {
  try {
    const parsed = JSON.parse(raw) as {
      order?: DashboardBlockId[];
      sizes?: Partial<Record<string, string>>;
      customKpis?: CustomKpiConfig[];
    };
    if (!Array.isArray(parsed.order)) return null;
    const order = [...parsed.order];
    if (!order.includes("continue-watching")) {
      const afterKpi = order.findIndex((id) => !id.startsWith("kpi-") && !id.startsWith("custom-"));
      order.splice(afterKpi >= 0 ? afterKpi : order.length, 0, "continue-watching");
    }
    const spans: Partial<Record<string, ColSpan>> = { ...defaultSpans };
    for (const [id, size] of Object.entries(parsed.sizes || {})) {
      if (size === "wide" || size === "full") spans[id] = id.startsWith("kpi-") || id.startsWith("custom-") ? 2 : 4;
      else if (size === "compact") spans[id] = 1;
    }
    return { order, hidden: [], spans, customKpis: parsed.customKpis || [] };
  } catch {
    return null;
  }
}

export function DashboardLayoutShell({ blocks, editMode, onEditModeChange, showEditChrome = true, metrics }: Props) {
  const [layout, setLayout] = useState<LayoutState>({
    order: defaultOrder,
    hidden: [],
    spans: defaultSpans,
    customKpis: []
  });
  const [dragId, setDragId] = useState<DashboardBlockId | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const touchTargetRef = useRef<DashboardBlockId | null>(null);
  const [touchDragId, setTouchDragId] = useState<DashboardBlockId | null>(null);

  useEffect(() => {
    try {
      const v4 = window.localStorage.getItem(storageKey);
      if (v4) {
        const parsed = JSON.parse(v4) as LayoutState;
        if (Array.isArray(parsed.order)) {
          setLayout({
            order: parsed.order,
            hidden: parsed.hidden || [],
            spans: { ...defaultSpans, ...(parsed.spans || {}) },
            customKpis: parsed.customKpis || []
          });
          return;
        }
      }
      // Migration : ordre/KPI custom, spans = défauts propres (anti trous v3)
      for (const key of legacyKeys) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const migrated = migrateLegacy(raw);
        if (migrated) {
          setLayout({
            ...migrated,
            spans: { ...defaultSpans },
            order: migrated.order.includes("continue-watching")
              ? migrated.order
              : defaultOrder
          });
          break;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(layout));
  }, [layout]);

  const visibleOrder = useMemo(() => {
    const hidden = new Set(layout.hidden);
    const known = layout.order.filter((id) => (blocks[id] || id.startsWith("custom-")) && !hidden.has(id));
    const missing = Object.keys(blocks).filter(
      (id) => !layout.order.includes(id as DashboardBlockId) && !hidden.has(id as DashboardBlockId)
    ) as DashboardBlockId[];
    return [...known, ...missing];
  }, [blocks, layout.hidden, layout.order]);

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

  function setSpan(id: DashboardBlockId, span: ColSpan) {
    setLayout((current) => ({ ...current, spans: { ...current.spans, [id]: span } }));
  }

  function hideBlock(id: DashboardBlockId) {
    setLayout((current) => ({
      ...current,
      hidden: current.hidden.includes(id) ? current.hidden : [...current.hidden, id],
      customKpis: id.startsWith("custom-") ? current.customKpis.filter((k) => k.id !== id) : current.customKpis,
      order: id.startsWith("custom-") ? current.order.filter((item) => item !== id) : current.order
    }));
  }

  function showBlock(id: DashboardBlockId) {
    setLayout((current) => ({
      ...current,
      hidden: current.hidden.filter((item) => item !== id),
      order: current.order.includes(id) ? current.order : [...current.order, id]
    }));
  }

  function addCustomKpi() {
    const id = `custom-${Date.now()}` as DashboardBlockId;
    const entry: CustomKpiConfig = { id, label: "Nouveau KPI", metric: "movies" };
    setLayout((current) => ({
      ...current,
      customKpis: [...current.customKpis, entry],
      order: [...current.order, id],
      spans: { ...current.spans, [id]: 1 },
      hidden: current.hidden.filter((item) => item !== id)
    }));
  }

  function updateCustomKpi(id: string, patch: Partial<CustomKpiConfig>) {
    setLayout((current) => ({
      ...current,
      customKpis: current.customKpis.map((item) => (item.id === id ? { ...item, ...patch } : item))
    }));
  }

  function resetLayout() {
    setLayout({ order: defaultOrder, hidden: [], spans: defaultSpans, customKpis: [] });
  }

  const availableToAdd = useMemo(() => {
    const hiddenBuiltins = defaultOrder.filter((id) => layout.hidden.includes(id));
    return hiddenBuiltins;
  }, [layout.hidden]);

  return (
    <div className="min-w-0 max-w-full space-y-4">
      {showEditChrome && editMode ? (
        <div className="dashboard-edit-chrome flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-4 py-3">
          <p className="text-sm text-[var(--mega-text-muted)]">
            Mode édition — glissez, redimensionnez (bord droit), masquez ou ajoutez des encarts (dont Reprendre).
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen((v) => !v)}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] px-3 py-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
            <button
              type="button"
              onClick={addCustomKpi}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] px-3 py-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              KPI
            </button>
            <button
              type="button"
              onClick={resetLayout}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] px-3 py-1.5 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => onEditModeChange?.(false)}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] px-3 py-1.5 text-xs font-semibold"
            >
              <Check className="h-3.5 w-3.5" />
              Terminer
            </button>
          </div>
        </div>
      ) : null}

      {editMode && paletteOpen ? (
        <div className="dashboard-edit-palette rounded-[22px] border border-[var(--mega-border)] bg-[var(--mega-card-bg)] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--mega-text-faint)]">Encarts masqués</p>
          {availableToAdd.length === 0 ? (
            <p className="text-sm text-[var(--mega-text-muted)]">Tous les encarts sont visibles. Masquez-en un pour le retrouver ici.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableToAdd.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => showBlock(id)}
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--brand-gold)]/40 bg-[var(--brand-gold)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--brand-gold)]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {BLOCK_LABELS[id] || id}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="dashboard-layout-grid grid min-w-0 max-w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {visibleOrder.map((id) => {
          const span = clampSpan(layout.spans[id] ?? defaultSpans[id as DashboardBlockId] ?? (id.startsWith("kpi-") || id.startsWith("custom-") ? 1 : 2));
          const custom = layout.customKpis.find((item) => item.id === id);
          return (
            <DashboardBlock
              key={id}
              id={id}
              editMode={editMode}
              span={span}
              dragging={dragId === id || touchDragId === id}
              customKpi={custom}
              onCustomKpiChange={(patch) => updateCustomKpi(id, patch)}
              onHide={() => hideBlock(id)}
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
              onSpanChange={(next) => setSpan(id, next)}
              className={spanClass[span]}
            >
              {blocks[id] ?? (custom ? renderCustomKpi(custom) : null)}
            </DashboardBlock>
          );
        })}
      </div>

    </div>
  );
}

function DashboardBlock({
  id,
  editMode,
  span,
  dragging,
  customKpi,
  onCustomKpiChange,
  onHide,
  onDragStart,
  onDragEnd,
  onDropOn,
  onTouchDragStart,
  onTouchDragEnter,
  onTouchDragEnd,
  onSpanChange,
  className,
  children
}: {
  id: DashboardBlockId;
  editMode: boolean;
  span: ColSpan;
  dragging?: boolean;
  customKpi?: CustomKpiConfig;
  onCustomKpiChange?: (patch: Partial<CustomKpiConfig>) => void;
  onHide: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropOn: () => void;
  onTouchDragStart: () => void;
  onTouchDragEnter: () => void;
  onTouchDragEnd: () => void;
  onSpanChange: (span: ColSpan) => void;
  className?: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);

  function onResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    const el = rootRef.current;
    if (!el) return;
    resizing.current = true;
    el.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startSpan = span;
    const cellW = el.parentElement ? el.parentElement.getBoundingClientRect().width / 4 : 280;

    function onMove(e: PointerEvent) {
      if (!resizing.current) return;
      const delta = e.clientX - startX;
      const steps = Math.round(delta / Math.max(80, cellW * 0.85));
      onSpanChange(clampSpan(startSpan + steps));
    }
    function onUp(e: PointerEvent) {
      resizing.current = false;
      el?.releasePointerCapture(e.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      ref={rootRef}
      className={clsx(
        "dashboard-layout-block relative min-w-0 max-w-full transition",
        className,
        editMode && "dashboard-layout-block--edit rounded-[28px] ring-2 ring-[var(--mega-border-strong)] ring-offset-2 ring-offset-transparent",
        dragging && "opacity-60 scale-[0.98]"
      )}
      draggable={editMode && !resizing.current}
      onDragStart={(event) => {
        if (!editMode || resizing.current) {
          event.preventDefault();
          return;
        }
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
        <div className="dashboard-layout-block__toolbar absolute right-2 top-2 z-20 flex flex-wrap items-center gap-1">
          <span
            className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] text-[var(--mega-text-muted)] active:cursor-grabbing"
            title="Glisser"
          >
            <GripVertical className="h-4 w-4" />
          </span>
          <div className="inline-flex overflow-hidden rounded-full border border-[var(--mega-border)] bg-[var(--mega-shell-nav)]">
            {([1, 2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                className={clsx(
                  "focus-ring h-8 min-w-7 px-1.5 text-[10px] font-bold",
                  span === n ? "bg-[var(--brand-gold)] text-[#0c0e12]" : "text-[var(--mega-text-muted)]"
                )}
                onClick={() => onSpanChange(n)}
                aria-label={`Largeur ${n} colonnes`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-300/30 bg-red-500/10 text-red-100"
            onClick={onHide}
            aria-label="Masquer l'encart"
            title="Masquer"
          >
            {id.startsWith("custom-") ? <Trash2 className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      ) : null}

      {editMode ? (
        <div
          className="dashboard-layout-block__resize"
          onPointerDown={onResizePointerDown}
          title="Glisser pour redimensionner"
          aria-hidden
        />
      ) : null}

      {editMode && customKpi ? (
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

      {editMode ? (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mega-text-faint)]">
          {BLOCK_LABELS[id] || "KPI custom"} · {span}/4
        </p>
      ) : null}

      <div className={clsx(editMode && "pointer-events-none select-none")}>{children}</div>
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
