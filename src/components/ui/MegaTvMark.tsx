"use client";

import Image from "next/image";
import { clsx } from "clsx";

/** Triangle MegaTv officiel (PNG transparent) — pas de carré noir. */
export function MegaTvMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/assets/companion/triangle-mark-clear.png"
      alt=""
      width={size}
      height={size}
      className={clsx("mega-tv-mark shrink-0 object-contain", className)}
      style={{ background: "transparent", width: size, height: size }}
      priority={size >= 30}
    />
  );
}

/** Brand Companion : triangle + libellé. */
export function MegaCompagnonBrand({
  size = 36,
  stacked = false,
  className
}: {
  size?: number;
  stacked?: boolean;
  className?: string;
}) {
  if (stacked) {
    return (
      <div className={clsx("mega-compagnon-brand mega-compagnon-brand--stacked flex flex-col items-center gap-1 bg-transparent", className)}>
        <MegaTvMark size={size} />
        <span className="max-w-[4.75rem] text-center text-[9px] font-bold leading-tight tracking-tight text-[var(--mega-text)]">
          MegaCompagnon
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("mega-compagnon-brand flex min-w-0 items-center gap-2.5 bg-transparent", className)}>
      <MegaTvMark size={size} />
      <span className="truncate text-lg font-extrabold tracking-tight text-[var(--mega-text)]">MegaCompagnon</span>
    </div>
  );
}
