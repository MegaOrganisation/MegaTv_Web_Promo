"use client";

import { useMemo, useState } from "react";

import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { RingChart } from "@/components/charts/ring-chart";
import type { RingData } from "@/components/charts/ring-context";

export type ActivityRingSegment = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  segments: ActivityRingSegment[];
  defaultLabel?: string;
  size?: number;
};

/**
 * Répartition — bklit Ring Chart Three Quarter :
 * arc 270° de top-left → bottom-left (ouverture à droite).
 * startAngle = -π, endAngle = π/2 (VisX / d3).
 * Chaque anneau = value / max (indépendant), pas un donut 360°.
 */
export function ActivityRingChart({
  segments,
  defaultLabel = "Activité",
  size = 250
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const data = useMemo((): RingData[] => {
    const cleaned = segments.map((s) => ({
      label: s.label,
      value: Math.max(0, Number(s.value) || 0),
      color: s.color
    }));
    // Plafond partagé = pic des métriques (anneaux comparables, jamais 360°)
    const peak = Math.max(1, ...cleaned.map((s) => s.value));
    return cleaned.map((s) => ({
      label: s.label,
      value: s.value,
      maxValue: peak,
      color: s.color
    }));
  }, [segments]);

  if (data.every((d) => d.value <= 0)) {
    return <p className="text-sm text-[var(--mega-text-faint)]">Pas encore d’activité à répartir.</p>;
  }

  return (
    <div className="activity-ring-chart flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
      <div className="activity-ring-chart__plot shrink-0" style={{ width: size, height: size }}>
        <RingChart
          data={data}
          size={size}
          strokeWidth={14}
          ringGap={8}
          baseInnerRadius={48}
          startAngle={-Math.PI}
          endAngle={Math.PI / 2}
          hoveredIndex={hovered}
          onHoverChange={setHovered}
          className="mx-auto"
        >
          {data.map((_, index) => (
            <Ring key={data[index]!.label} index={index} color={data[index]!.color} lineCap="round" />
          ))}
          <RingCenter
            defaultLabel={defaultLabel}
            valueClassName="!text-white font-bold tabular-nums leading-none text-[clamp(0.85rem,22cqw,1.875rem)]"
            labelClassName="!text-white/75 max-w-full truncate leading-tight text-[clamp(0.625rem,9cqw,0.75rem)]"
          />
        </RingChart>
      </div>

      <ul className="activity-ring-chart__legend m-0 flex list-none flex-col gap-3 p-0">
        {data.map((item, index) => {
          const pct = Math.round((item.value / item.maxValue) * 100);
          return (
            <li
              key={item.label}
              className="flex min-w-[148px] cursor-pointer flex-col gap-1.5"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center gap-2.5 text-sm text-[var(--mega-text)]">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: item.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 font-medium">{item.label}</span>
                <span className="tabular-nums text-[var(--mega-text-muted)]">
                  {item.value.toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${Math.max(pct, item.value > 0 ? 4 : 0)}%`,
                    background: item.color
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
