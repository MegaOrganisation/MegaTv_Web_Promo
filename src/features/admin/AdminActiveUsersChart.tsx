"use client";

import { useEffect, useState } from "react";

import { MiniLineChart } from "@/components/ui/Charts";
import { GlassCard } from "@/components/ui/GlassCard";
import type { AdminPeriodDays } from "@/lib/admin/period";

type Point = { day: string; active_users: number };

export function AdminActiveUsersChart({ days }: { days: AdminPeriodDays }) {
  const [series, setSeries] = useState<Point[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/daily-users?days=${days}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) setError(json.error);
        else setSeries(json.series || []);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger la série temporelle.");
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const points = series.map((row) => Number(row.active_users || 0));

  return (
    <GlassCard as="section">
      <h2 className="text-2xl font-bold text-white">Utilisateurs actifs / jour</h2>
      <p className="mt-2 text-sm text-white/45">Agrégat cross-compte sur {days} jours (RPC megacompanion_admin_daily_active_users).</p>
      {error ? <p className="mt-4 text-sm text-red-200/80">{error}</p> : null}
      <div className="mt-6">
        <MiniLineChart points={points.length ? points : [0]} />
      </div>
    </GlassCard>
  );
}
