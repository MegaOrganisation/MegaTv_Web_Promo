import { percent } from "@/lib/format";

export function WatchProgressBar({ value }: { value: number | null | undefined }) {
  const safe = Math.max(0, Math.min(1, Number(value || 0)));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-white/45">
        <span>Progression</span>
        <span>{percent(safe)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-[linear-gradient(110deg,#3f9ae6,#5fbf5a,#f2b43c,#d8497f)]" style={{ width: `${safe * 100}%` }} />
      </div>
    </div>
  );
}
