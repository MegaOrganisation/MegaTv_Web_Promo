"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { motion } from "motion/react";

const spectrum = "linear-gradient(110deg,#3f9ae6 0%,#1fa8a0 19%,#5fbf5a 35%,#f2b43c 55%,#ee6a54 76%,#d8497f 100%)";

export function BarRankingChart({
  rows
}: {
  rows: Array<{ label: string; value: number; accent?: string; sublabel?: string }>;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="mega-chart-ranking space-y-5">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`}>
          <div className="mb-2.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-[var(--mega-text)]">{row.label}</span>
            <span className="shrink-0 rounded-full border border-[var(--mega-cp-border)] bg-[var(--mega-card-bg)] px-2 py-0.5 text-xs font-bold text-[var(--mega-text-muted)]">
              {formatCompact(row.value)}
            </span>
          </div>
          <div className="mega-chart-track h-3.5 overflow-hidden rounded-full bg-[var(--mega-card-bg)]">
            <motion.div
              className={clsx("mega-chart-fill h-full rounded-full", !row.accent && "mega-chart-fill-spectrum")}
              style={row.accent ? { background: row.accent } : undefined}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(10, (row.value / max) * 100)}%` }}
              transition={{ delay: index * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {row.sublabel ? <p className="mt-1.5 text-xs text-[var(--mega-text-faint)]">{row.sublabel}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  segments,
  label,
  activeLabel,
  onActiveLabelChange
}: {
  label: string;
  segments: Array<{ label: string; value: number; color: string }>;
  activeLabel?: string | null;
  onActiveLabelChange?: (label: string | null) => void;
}) {
  const total = Math.max(segments.reduce((sum, item) => sum + item.value, 0), 1);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const renderedSegments = segments.map((segment, index) => {
    const previous = segments.slice(0, index).reduce((sum, item) => sum + (item.value / total) * circumference, 0);
    const length = (segment.value / total) * circumference;
    return { ...segment, dash: `${length} ${circumference - length}`, dashOffset: -previous };
  });
  const active = segments.find((s) => s.label === activeLabel);

  return (
    <div className="mega-donut grid items-center gap-6 sm:grid-cols-[minmax(0,168px)_1fr]">
      <div className="relative mx-auto grid h-44 w-44 place-items-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label={label}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
          {renderedSegments.map((segment) => {
            const isActive = !activeLabel || activeLabel === segment.label;
            return (
              <motion.circle
                key={segment.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeLinecap="round"
                strokeWidth={isActive ? 18 : 14}
                strokeDasharray={segment.dash}
                strokeDashoffset={segment.dashOffset}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0.25 }}
                className={onActiveLabelChange ? "cursor-pointer" : undefined}
                onMouseEnter={() => onActiveLabelChange?.(segment.label)}
                onMouseLeave={() => onActiveLabelChange?.(null)}
                onClick={() => onActiveLabelChange?.(activeLabel === segment.label ? null : segment.label)}
              />
            );
          })}
        </svg>
        <div className="relative text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--mega-text-faint)]">Total</p>
          <p className="text-2xl font-black text-[var(--mega-text)]">{active ? Math.round((active.value / total) * 100) : 100}%</p>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((segment) => (
          <button
            key={segment.label}
            type="button"
            onMouseEnter={() => onActiveLabelChange?.(segment.label)}
            onMouseLeave={() => onActiveLabelChange?.(null)}
            onClick={() => onActiveLabelChange?.(activeLabel === segment.label ? null : segment.label)}
            className={clsx(
              "mega-hover-lift flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition",
              activeLabel === segment.label
                ? "border-[var(--mega-cp-border-strong)] bg-[var(--mega-card-bg)]"
                : "border-transparent hover:border-[var(--mega-cp-border)] hover:bg-[var(--mega-card-bg)]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5 text-[var(--mega-text-muted)]">
              <span className="h-3 w-3 shrink-0 rounded-full shadow-[0_0_12px_-2px_currentColor]" style={{ background: segment.color, color: segment.color }} />
              <span className="truncate font-medium">{segment.label}</span>
            </span>
            <span className="font-bold text-[var(--mega-text)]">{Math.round((segment.value / total) * 100)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function InteractiveDonutChart(props: { label: string; segments: Array<{ label: string; value: number; color: string }> }) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  return <DonutChart {...props} activeLabel={activeLabel} onActiveLabelChange={setActiveLabel} />;
}

export function InteractiveBarRankingChart({
  rows
}: {
  rows: Array<{ label: string; value: number; accent?: string; sublabel?: string }>;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="mega-chart-capsules flex h-40 items-end justify-between gap-2 sm:gap-3 sm:h-44">
      {rows.map((row, index) => {
        const active = activeIndex === index;
        const barHeight = Math.max(28, (row.value / max) * 140);
        return (
          <button
            key={`${row.label}-${index}`}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => setActiveIndex(active ? null : index)}
            className="group flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            {active ? (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mega-chart-tooltip rounded-full border border-[var(--mega-cp-border-strong)] bg-[var(--mega-cp-canvas)] px-2 py-1 text-[10px] font-bold text-[var(--mega-text)] shadow-lg"
              >
                {formatCompact(row.value)}
              </motion.span>
            ) : (
              <span className="h-6" aria-hidden />
            )}
            <motion.div
              className={clsx(
                "mega-chart-capsule w-full max-w-[3.25rem] rounded-full border border-[var(--mega-cp-border)]",
                active ? "mega-chart-capsule-active border-[var(--mega-cp-border-strong)]" : "bg-[var(--mega-card-bg)]"
              )}
              style={row.accent ? { background: active ? row.accent : undefined } : undefined}
              initial={{ height: 0 }}
              animate={{ height: barHeight }}
              transition={{ delay: index * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className={clsx("w-full truncate text-center text-[10px] font-semibold leading-tight", active ? "text-[var(--mega-text)]" : "text-[var(--mega-text-faint)]")}>
              {row.label.split(" ").slice(0, 2).join(" ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function DonutChartStatic(props: { label: string; segments: Array<{ label: string; value: number; color: string }> }) {
  return <DonutChart {...props} />;
}

export function MiniLineChart({ points }: { points: number[] }) {
  const width = 420;
  const height = 150;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const d = points
    .map((point, index) => {
      const x = points.length === 1 ? width : (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="mega-line-chart h-44 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Évolution récente">
      <defs>
        <linearGradient id="megaLineGradient" x1="0" x2="1" y1="0" y2="0">
          <stop stopColor="#3f9ae6" />
          <stop offset="0.55" stopColor="#f2b43c" />
          <stop offset="1" stopColor="#d8497f" />
        </linearGradient>
        <linearGradient id="megaAreaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#3f9ae6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3f9ae6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L${width},${height} L0,${height} Z`}
        fill="url(#megaAreaGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="url(#megaLineGradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export { spectrum as chartSpectrumGradient };
