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
  tabs: Array<{ href: string; label: string; shortLabel?: string; icon: LucideIcon }>;
  withHref: (href: string) => string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="mega-pill-tabs mb-6 grid w-full grid-cols-5 gap-0.5 overflow-x-visible p-1 sm:flex sm:gap-1 sm:overflow-x-auto sm:overflow-y-visible sm:p-1.5"
      aria-label="Navigation secondaire"
    >
      {tabs.map(({ href, label, shortLabel, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const linkHref = withHref(href);
        return (
          <Link
            key={href}
            href={linkHref}
            prefetch
            title={label}
            className={clsx(
              "mega-pill-tab focus-ring relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-center text-[10px] font-semibold leading-tight transition sm:shrink-0 sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm sm:leading-normal",
              active && "is-active"
            )}
            aria-current={active ? "page" : undefined}
          >
            {active ? (
              <motion.span
                layoutId="mega-pill-tab-active"
                className="absolute inset-0 rounded-full bg-[var(--mega-text)] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Icon
              className={clsx(
                "relative z-[1] h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4",
                active ? "text-[var(--mega-cp-canvas)]" : "text-[var(--mega-text-muted)]"
              )}
              strokeWidth={2}
            />
            <span
              className={clsx(
                "relative z-[1] max-w-full truncate sm:overflow-visible sm:whitespace-normal",
                active ? "text-[var(--mega-cp-canvas)]" : "text-[var(--mega-text-muted)]"
              )}
            >
              <span className="sm:hidden">{shortLabel || label}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
