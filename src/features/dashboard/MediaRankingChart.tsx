"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { motion } from "motion/react";

import { formatDuration } from "@/lib/format";

export const MEGA_CHART_COLORS = [
  "#3f9ae6",
  "#f2b43c",
  "#d8497f",
  "#1fa8a0",
  "#a78bfa",
  "#84cc16",
  "#ee6a54",
  "#60a5fa"
] as const;

export type MediaRankingItem = {
  id: string;
  label: string;
  watchSeconds: number;
  imageUrl?: string | null;
  imageKind?: "poster" | "avatar" | "logo";
  subtitle?: string | null;
};

export type MediaRankingVariant = "bars-h" | "bars-v" | "area";

type Props = {
  items: MediaRankingItem[];
  className?: string;
  emptyLabel?: string;
  valueLabel?: string;
  variant?: MediaRankingVariant;
  onItemClick?: (item: MediaRankingItem) => void;
};

function RankThumb({ item }: { item: MediaRankingItem }) {
  const [broken, setBroken] = useState(false);
  const showImg = Boolean(item.imageUrl) && !broken;

  return (
    <div
      className={clsx(
        "rank-chart__thumb",
        item.imageKind === "avatar" && "is-avatar",
        item.imageKind === "logo" && "is-logo"
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl!}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      ) : (
        <span>{(item.label || "?").slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
}

/**
 * Rankings MegaTv — colonnes/lignes alignées (posters + multi-color + hover tooltip).
 * Animations type bklit (grow stagger + fade hover), sans BarYAxis maxWidth:70 cassé.
 */
export function MediaRankingChart({
  items,
  className,
  emptyLabel = "Aucune donnée pour le moment.",
  valueLabel = "Temps",
  variant = "bars-v",
  onItemClick
}: Props) {
  const sliced = useMemo(() => items.filter((i) => i.watchSeconds > 0).slice(0, 8), [items]);
  const maxSec = useMemo(
    () => Math.max(1, ...sliced.map((i) => i.watchSeconds)),
    [sliced]
  );
  const [hovered, setHovered] = useState<string | null>(null);

  if (sliced.length === 0) {
    return <p className="text-sm text-[var(--mega-text-faint)]">{emptyLabel}</p>;
  }

  const tip = sliced.find((i) => i.id === hovered);

  if (variant === "bars-h") {
    return (
      <div className={clsx("rank-chart rank-chart--h", className)}>
        <ul className="rank-chart__h-list">
          {sliced.map((item, i) => {
            const color = MEGA_CHART_COLORS[i % MEGA_CHART_COLORS.length];
            const pct = Math.max(8, (item.watchSeconds / maxSec) * 100);
            const active = hovered === item.id || !hovered;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={clsx("rank-chart__h-row", !active && "is-dim")}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(item.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onItemClick?.(item)}
                >
                  <RankThumb item={item} />
                  <div className="rank-chart__h-meta">
                    <p className="rank-chart__label" title={item.label}>
                      {item.label}
                    </p>
                    {item.subtitle ? <p className="rank-chart__sub">{item.subtitle}</p> : null}
                    <div className="rank-chart__h-track">
                      <motion.div
                        className="rank-chart__h-bar"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                  <span className="rank-chart__value tabular-nums">{formatDuration(item.watchSeconds)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // bars-v + area : colonnes alignées poster → barre → label
  return (
    <div className={clsx("rank-chart rank-chart--v", variant === "area" && "rank-chart--area", className)}>
      <div
        className="rank-chart__v-grid"
        style={{ gridTemplateColumns: `repeat(${sliced.length}, minmax(0, 1fr))` }}
      >
        {sliced.map((item, i) => {
          const color = MEGA_CHART_COLORS[i % MEGA_CHART_COLORS.length];
          const pct = Math.max(10, (item.watchSeconds / maxSec) * 100);
          const active = hovered === item.id || !hovered;
          return (
            <button
              key={item.id}
              type="button"
              className={clsx("rank-chart__v-col", !active && "is-dim")}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(item.id)}
              onBlur={() => setHovered(null)}
              onClick={() => onItemClick?.(item)}
            >
              <RankThumb item={item} />
              <div className="rank-chart__v-plot">
                {variant === "area" ? (
                  <motion.div
                    className="rank-chart__area-fill"
                    style={{
                      background: `linear-gradient(180deg, ${color}aa 0%, ${color}22 70%, transparent 100%)`,
                      borderTop: `2px solid ${color}`
                    }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${pct}%`, opacity: 1 }}
                    transition={{ duration: 1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <motion.div
                    className="rank-chart__v-bar"
                    style={{ background: color }}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.95, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </div>
              <p className="rank-chart__label" title={item.label}>
                {item.label}
              </p>
            </button>
          );
        })}
      </div>

      {tip ? (
        <div className="rank-chart__tip" role="status">
          <strong>{tip.label}</strong>
          {tip.subtitle ? <span> · {tip.subtitle}</span> : null}
          <span className="tabular-nums">
            {" "}
            — {valueLabel} {formatDuration(tip.watchSeconds)}
          </span>
        </div>
      ) : (
        <p className="rank-chart__tip is-idle">
          {onItemClick ? "Clique une colonne pour le détail" : "Survole une colonne pour le détail"}
        </p>
      )}
    </div>
  );
}
