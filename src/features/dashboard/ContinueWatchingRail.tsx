import { PosterMetricRow } from "@/features/dashboard/PosterMetricRow";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

export function ContinueWatchingRail({ items }: { items: ContinueWatchingRow[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/14 bg-white/[0.025] p-8 text-center">
        <p className="font-semibold text-white">Aucune reprise de lecture</p>
        <p className="mt-2 text-sm text-white/45">Les contenus repris dans MegaTv apparaîtront ici dès que la synchronisation Cloud aura des données.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.slice(0, 8).map((item, index) => (
        <PosterMetricRow key={item.track_id} item={item} rank={index + 1} />
      ))}
    </div>
  );
}
