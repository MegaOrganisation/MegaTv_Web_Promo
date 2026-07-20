"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

export function MegaPillTabs({
  tabs,
  withHref
}: {
  tabs: Array<{ href: string; label: string; icon: LucideIcon }>;
  withHref: (href: string) => string;
}) {
  const pathname = usePathname();

  return (
    <nav className="mega-pill-tabs mb-6 flex gap-1 overflow-x-auto p-1" aria-label="Navigation secondaire">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const linkHref = withHref(href);
        return (
          <Link
            key={href}
            href={linkHref}
            prefetch
            className={clsx("mega-pill-tab focus-ring relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition", active && "is-active")}
            aria-current={active ? "page" : undefined}
          >
            {active ? (
              <motion.span
                layoutId="mega-pill-tab-active"
                className="absolute inset-0 rounded-full bg-[var(--mega-text)] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Icon className={clsx("relative z-[1] h-4 w-4", active ? "text-[var(--mega-cp-canvas)]" : "text-[var(--mega-text-muted)]")} strokeWidth={2} />
            <span className={clsx("relative z-[1]", active ? "text-[var(--mega-cp-canvas)]" : "text-[var(--mega-text-muted)]")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
