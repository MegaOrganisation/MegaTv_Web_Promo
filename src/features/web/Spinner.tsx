import { clsx } from "clsx";

const SIZES = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4"
} as const;

/** Unified MegaTv Web spinner used for every transition (profile/page/poster). */
export function Spinner({ size = "md", className }: { size?: keyof typeof SIZES; className?: string }) {
  return <span role="status" aria-label="Chargement" className={clsx("web-spinner block", SIZES[size], className)} />;
}

/** Full-area centered spinner overlay. */
export function SpinnerOverlay({ label }: { label?: string }) {
  return (
    <div className="grid place-items-center gap-3 py-16 text-[var(--mega-text-faint)]">
      <Spinner size="lg" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
