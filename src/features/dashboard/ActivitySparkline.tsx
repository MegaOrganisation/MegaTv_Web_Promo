"use client";

import { useEffect, useState } from "react";

import { CinemaRechartsArea } from "@/components/ui/CinemaRecharts";
import { MegaButton } from "@/components/ui/MegaButton";

type ActivityDay = {
  day: string;
  tracks_count: number;
  watch_seconds: number;
  page_views: number;
  total_activity: number;
};

type Props = {
  profileId?: string | null;
  initialDays?: 7 | 30;
};

export function ActivitySparkline({ profileId, initialDays = 30 }: Props) {
  const [days, setDays] = useState<7 | 30>(initialDays);
  const [rows, setRows] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ days: String(days) });
    if (profileId) params.set("profile", profileId);

    void fetch(`/api/dashboard/activity?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Activity unavailable");
        return (await response.json()) as ActivityDay[];
      })
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setError("Données d'activité indisponibles. Appliquez la migration P0.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days, profileId]);

  const points = rows.map((row) => Number(row.total_activity || 0));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-white/45">
          {loading ? "Chargement…" : `${rows.length} jours · reprises + pages Companion`}
        </p>
        <div className="flex gap-2">
          <MegaButton type="button" variant={days === 7 ? "primary" : "ghost"} className="min-h-9 px-3 text-xs" onClick={() => setDays(7)}>
            7j
          </MegaButton>
          <MegaButton type="button" variant={days === 30 ? "primary" : "ghost"} className="min-h-9 px-3 text-xs" onClick={() => setDays(30)}>
            30j
          </MegaButton>
        </div>
      </div>
      {error ? <p className="mb-3 text-xs text-yellow-100/70">{error}</p> : null}
      <CinemaRechartsArea points={points.length ? points : [0]} labels={rows.map((row) => row.day.slice(5))} />
    </div>
  );
}
