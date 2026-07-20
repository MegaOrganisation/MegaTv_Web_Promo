"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";

import { MegaTvIcon } from "@/components/icons/MegaTvIcon";
import { MegaCompagnonBrand, MegaTvMark } from "@/components/ui/MegaTvMark";
import {
  COMPANION_ADMIN_ROUTE,
  COMPANION_DOCK_ROUTES,
  isCompanionRouteActive
} from "@/features/companion/navigation/companionNavConfig";
import { createClient } from "@/lib/supabase/client";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { DockLottieIcon } from "@/features/companion/ui/DockLottieIcon";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";

export function MobileCompanionChrome({
  isAdmin = false,
  headerEnd,
  profileAnchor
}: {
  isAdmin?: boolean;
  headerEnd?: ReactNode;
  docked?: boolean;
  profileAnchor?: ReactNode;
}) {
  return (
    <header className="companion-mobile-header pointer-events-none fixed inset-x-0 top-0 z-[90] w-full max-w-[100vw] lg:hidden">
      <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-3 px-3 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <Link href="/companion" className="focus-ring flex min-w-0 items-center gap-2 rounded-2xl">
          <MegaCompagnonBrand size={30} />
        </Link>
        <div className="pj2-mobile-header-actions">
          {headerEnd ? <div className="shrink-0">{headerEnd}</div> : null}
          {isAdmin ? (
            <Link
              href="/companion/admin"
              className="focus-ring inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 text-xs font-semibold text-white/90"
            >
              <MegaTvIcon name="shield" size={16} />
            </Link>
          ) : null}
          <div className="shrink-0">{profileAnchor}</div>
        </div>
      </div>
    </header>
  );
}

/** Mobile dock FileSnap — CSS glass + bulle active spring (pas Lottie fond). */
export function MobileCompanionNav({ isAdmin: _isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { withProfile } = useCompanionProfile();
  const items = COMPANION_DOCK_ROUTES;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] lg:hidden">
      <LayoutGroup id="mobile-dock">
        <nav
          className="companion-mobile-nav v10-mobile-dock mega-dock pj2-mobile-dock companion-glass-tray pointer-events-auto mx-auto grid w-full max-w-md gap-0.5 p-1.5"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          aria-label="Navigation principale"
        >
          {items.map((item) => {
            const active = isCompanionRouteActive(pathname, item.href, item.exact);
            return (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={cinemaSpringSnappy}
                className="min-w-0"
              >
                <Link
                  href={withProfile(item.href)}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  className={clsx("mega-dock-item v10-mobile-dock-item pj2-dock-item focus-ring relative min-w-0", active && "is-active")}
                >
                  {active ? (
                    <motion.span layoutId="companion-dock-active" className="pj2-dock-active-pill" transition={cinemaSpringSnappy} />
                  ) : null}
                  <motion.span
                    className="relative z-[1] inline-flex flex-col items-center"
                    animate={{ scale: active ? 1.06 : 1 }}
                    transition={cinemaSpringSnappy}
                  >
                    <DockLottieIcon name={item.icon} active={active} size={18} className="text-inherit" />
                    {active ? (
                      <span className="mt-0.5 block w-full truncate text-center text-[10px] font-bold leading-none text-[#10191c]">
                        {item.shortLabel}
                      </span>
                    ) : null}
                  </motion.span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </LayoutGroup>
    </div>
  );
}

export function DesktopCompanionNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { withProfile } = useCompanionProfile();
  const items = isAdmin ? [...COMPANION_DOCK_ROUTES, COMPANION_ADMIN_ROUTE] : COMPANION_DOCK_ROUTES;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mega-cinema-dock-wrap">
      <Link href="/" className="focus-ring grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
        <MegaTvMark size={36} />
      </Link>
      <nav aria-label="Navigation MegaCompagnon" className="mega-cinema-dock">
        {items.map((item) => {
          const active = isCompanionRouteActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={withProfile(item.href)}
              prefetch
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={clsx("mega-cinema-dock-item focus-ring", active && "is-active")}
            >
              <span className="mega-cinema-dock-core">
                <MegaTvIcon name={item.icon} size={18} />
              </span>
            </Link>
          );
        })}
      </nav>
      <button type="button" onClick={signOut} title="Se déconnecter" className="focus-ring mega-cinema-dock-item text-white/45 hover:text-white/90">
        <span className="mega-cinema-dock-core">↗</span>
      </button>
    </div>
  );
}
