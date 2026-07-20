"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const MEGA_COLORS = ["#3f9ae6", "#d8497f", "#f2b43c", "#5fbf5a", "#ee6a54"];

type Segment = { label: string; value: number; color: string };

export function CinemaRechartsDonut({ label, segments }: { label: string; segments: Segment[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const data = useMemo(
    () => segments.map((s) => ({ name: s.label, value: Math.max(s.value, 0), color: s.color })),
    [segments]
  );
  const total = Math.max(data.reduce((sum, row) => sum + row.value, 0), 1);
  const active = activeIndex != null ? data[activeIndex] : null;

  return (
    <div className="mega-recharts-donut grid items-center gap-6 sm:grid-cols-[minmax(0,168px)_1fr]">
      <div className="relative mx-auto h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={2}
              isAnimationActive
              animationBegin={80}
              animationDuration={900}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={activeIndex == null || activeIndex === index ? 1 : 0.28}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(8,10,14,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                fontSize: 12
              }}
              formatter={(value) => [`${Math.round((Number(value) / total) * 100)}%`, "Part"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Total</p>
          <p className="text-2xl font-black text-white">{active ? Math.round((active.value / total) * 100) : 100}%</p>
        </div>
      </div>
      <div className="space-y-2" role="img" aria-label={label}>
        {data.map((row, index) => (
          <button
            key={row.name}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
              activeIndex === index ? "border-white/20 bg-white/8" : "border-transparent hover:border-white/10 hover:bg-white/5"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5 text-white/65">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: row.color }} />
              <span className="truncate font-medium">{row.name}</span>
            </span>
            <span className="font-bold text-white">{Math.round((row.value / total) * 100)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CinemaRechartsArea({ points, labels }: { points: number[]; labels?: string[] }) {
  const data = points.map((value, index) => ({
    label: labels?.[index] ?? `${index + 1}`,
    value
  }));

  return (
    <div className="mega-recharts-area h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="megaAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f9ae6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#3f9ae6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="megaAreaStroke" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#3f9ae6" />
              <stop offset="0.55" stopColor="#f2b43c" />
              <stop offset="1" stopColor="#d8497f" />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip
            contentStyle={{
              background: "rgba(8,10,14,0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              fontSize: 12
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#megaAreaStroke)"
            strokeWidth={2.5}
            fill="url(#megaAreaFill)"
            dot={false}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
            activeDot={{ r: 4, fill: "#fff", stroke: "#f2b43c", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CinemaRechartsBars({
  rows
}: {
  rows: Array<{ label: string; value: number; sublabel?: string }>;
}) {
  const data = rows.map((row) => ({ name: row.label, value: row.value, sub: row.sublabel }));
  const max = Math.max(...data.map((r) => r.value), 1);

  return (
    <div className="mega-recharts-bars h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide domain={[0, max]} />
          <Tooltip
            contentStyle={{
              background: "rgba(8,10,14,0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              fontSize: 12
            }}
            formatter={(value) => [Number(value), "Score"]}
          />
          <Bar dataKey="value" radius={[999, 999, 999, 999]} maxBarSize={48} isAnimationActive animationDuration={800} animationEasing="ease-out">
            {data.map((_, index) => (
              <Cell key={index} fill={MEGA_COLORS[index % MEGA_COLORS.length]} fillOpacity={0.92} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
