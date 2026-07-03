import type { LucideIcon } from "lucide-react";

export function WebPlaceholder({ icon: Icon, title, description, phase }: { icon: LucideIcon; title: string; description: string; phase: string }) {
  return (
    <div className="mega-glass mx-auto mt-10 flex max-w-lg flex-col items-center gap-4 rounded-[28px] p-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--mega-card-bg)] text-[var(--mega-text)]">
        <Icon className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-bold text-[var(--mega-text)]">{title}</h1>
      <p className="text-sm text-[var(--mega-text-muted)]">{description}</p>
      <span className="rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--mega-text-faint)]">
        {phase}
      </span>
    </div>
  );
}
