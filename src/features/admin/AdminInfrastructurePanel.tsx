import { Database, Eye, Film, HardDrive, Users } from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { formatCompact, formatNumber } from "@/lib/format";

export type AdminOverview = {
  active_users?: number;
  profile_count?: number;
  device_count?: number;
  continue_watching_items?: number;
  tracks_updated?: number;
  page_views?: number;
  watch_events?: number;
  database_size_bytes?: number;
} | null;

export function AdminInfrastructurePanel({ overview, periodDays = 30 }: { overview: AdminOverview; periodDays?: number }) {
  const dbGb = Number(overview?.database_size_bytes || 0) / 1024 / 1024 / 1024;
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Utilisateurs actifs" value={formatNumber(overview?.active_users)} hint={`${periodDays} derniers jours`} icon={Users} tone="blue" />
      <KpiCard label="Profils" value={formatNumber(overview?.profile_count)} hint={`${formatNumber(overview?.device_count)} appareils`} icon={HardDrive} tone="green" />
      <KpiCard label="Tracks MAJ" value={formatCompact(overview?.tracks_updated)} hint={`${formatNumber(overview?.continue_watching_items)} reprises`} icon={Film} tone="pink" />
      <KpiCard label="BDD" value={`${dbGb.toFixed(2)} Go`} hint={`${formatNumber(overview?.page_views)} pages vues`} icon={Database} tone="gold" />
      <KpiCard label="Events lecture" value={formatCompact(overview?.watch_events)} hint="Table Companion" icon={Eye} tone="blue" />
    </section>
  );
}
