"use client";

import { useState } from "react";
import { clsx } from "clsx";

export function BarRankingChart({
  rows
}: {
  rows: Array<{ label: string; value: number; accent?: string; sublabel?: string }>;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-white">{row.label}</span>
              <span className="text-xs text-white/45">{formatCompact(row.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/[0.065]">
              <div
                className={clsx("h-full rounded-full", row.accent || "bg-[linear-gradient(110deg,#3f9ae6,#d8497f)]")}
                style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }}
              />
            </div>
            {row.sublabel ? <p className="mt-1 text-xs text-white/35">{row.sublabel}</p> : null}
          </div>
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
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const renderedSegments = segments.map((segment, index) => {
    const previous = segments.slice(0, index).reduce((sum, item) => sum + (item.value / total) * circumference, 0);
    const length = (segment.value / total) * circumference;
    return {
      ...segment,
      dash: `${length} ${circumference - length}`,
      dashOffset: -previous
    };
  });

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[160px_minmax(0,1fr)]">
      <svg className="mx-auto h-40 w-40 -rotate-90" viewBox="0 0 120 120" role="img" aria-label={label}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="18" />
        {renderedSegments.map((segment) => {
          const active = !activeLabel || activeLabel === segment.label;
          return (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeLinecap="round"
              strokeWidth={active ? 20 : 16}
              strokeDasharray={segment.dash}
              strokeDashoffset={segment.dashOffset}
              className={onActiveLabelChange ? "cursor-pointer transition-all duration-200" : undefined}
              style={{ opacity: active ? 1 : 0.28 }}
              onMouseEnter={() => onActiveLabelChange?.(segment.label)}
              onMouseLeave={() => onActiveLabelChange?.(null)}
              onClick={() => onActiveLabelChange?.(activeLabel === segment.label ? null : segment.label)}
            />
          );
        })}
      </svg>
      <div className="space-y-3">
        {segments.map((segment) => (
          <button
            key={segment.label}
            type="button"
            onMouseEnter={() => onActiveLabelChange?.(segment.label)}
            onMouseLeave={() => onActiveLabelChange?.(null)}
            onClick={() => onActiveLabelChange?.(activeLabel === segment.label ? null : segment.label)}
            className={clsx(
              "flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition",
              activeLabel === segment.label ? "bg-white/10" : "hover:bg-white/5"
            )}
          >
            <span className="flex min-w-0 items-center gap-2 text-white/72">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
              <span className="truncate">{segment.label}</span>
            </span>
            <span className="font-semibold text-white">{Math.round((segment.value / total) * 100)}%</span>
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
    <div className="space-y-4">
      {rows.map((row, index) => {
        const active = activeIndex === index;
        return (
          <button
            key={`${row.label}-${index}`}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => setActiveIndex(active ? null : index)}
            className={clsx("grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-2xl px-2 py-1 text-left transition", active && "bg-white/8")}
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-white">{row.label}</span>
                <span className="text-xs text-white/45">{formatCompact(row.value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.065]">
                <div
                  className={clsx("h-full rounded-full transition-all duration-300", row.accent || "bg-[linear-gradient(110deg,#3f9ae6,#d8497f)]")}
                  style={{ width: `${Math.max(active ? 12 : 8, (row.value / max) * 100)}%` }}
                />
              </div>
              {row.sublabel ? <p className="mt-1 text-xs text-white/35">{row.sublabel}</p> : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function DonutChartStatic({
  segments,
  label
}: {
  label: string;
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = Math.max(segments.reduce((sum, item) => sum + item.value, 0), 1);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const renderedSegments = segments.map((segment, index) => {
    const previous = segments.slice(0, index).reduce((sum, item) => sum + (item.value / total) * circumference, 0);
    const length = (segment.value / total) * circumference;
    return {
      ...segment,
      dash: `${length} ${circumference - length}`,
      dashOffset: -previous
    };
  });

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[160px_minmax(0,1fr)]">
      <svg className="mx-auto h-40 w-40 -rotate-90" viewBox="0 0 120 120" role="img" aria-label={label}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="18" />
        {renderedSegments.map((segment) => {
          return (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeLinecap="round"
              strokeWidth="18"
              strokeDasharray={segment.dash}
              strokeDashoffset={segment.dashOffset}
            />
          );
        })}
      </svg>
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-white/72">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
              <span className="truncate">{segment.label}</span>
            </span>
            <span className="font-semibold text-white">{Math.round((segment.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
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
    <svg className="h-40 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Évolution récente">
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
          <stop stopColor="#3f9ae6" />
          <stop offset="0.55" stopColor="#f2b43c" />
          <stop offset="1" stopColor="#d8497f" />
        </linearGradient>
      </defs>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill="url(#lineGradient)" opacity="0.13" />
      <path d={d} fill="none" stroke="url(#lineGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
