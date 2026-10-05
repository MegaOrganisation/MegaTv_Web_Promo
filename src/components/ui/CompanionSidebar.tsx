"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Puzzle,
  Tv,
  ListVideo,
  Library,
  FolderHeart,
  CheckCircle2,
  Tv2,
  Smartphone,
  CreditCard,
  Laptop2,
  SlidersHorizontal,
  ShieldAlert
} from "lucide-react";

import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

type CompanionSidebarProps = {
  userEmail?: string | null;
  counts?: {
    plugins?: number;
    addons?: number;
    watchProgress?: number;
    library?: number;
    collections?: number;
    watched?: number;
  };
  isAdmin?: boolean;
};

export function CompanionSidebar({ userEmail, counts, isAdmin }: CompanionSidebarProps) {
  const pathname = usePathname();
  const { activeProfile, profileAvatarUrlsById, withProfile } = useCompanionProfile();

  const emailDisplay = userEmail || "sousou62410@gmail.com";
  const profileName = activeProfile?.name || "Famille Duriez";

  const navCounts = {
    plugins: counts?.plugins ?? 0,
    addons: counts?.addons ?? 8,
    watchProgress: counts?.watchProgress ?? 41,
    library: counts?.library ?? 54,
    collections: counts?.collections ?? 3,
    watched: counts?.watched ?? 39
  };

  const isExactActive = (href: string) => pathname === href;
  const isPrefixActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="w-60 lg:w-64 shrink-0 flex flex-col py-6 px-4 bg-[#0c0d12] border-r border-white/5 select-none">
      {/* Top Header: MEGATV SYNC + User Account (ISO User Feedback - Profile is in Top Bar) */}
      <div className="mb-6 px-2">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-1">
          MEGATV SYNC
        </p>
        <p className="text-xs font-semibold text-white/90 truncate">
          {emailDisplay}
        </p>
      </div>

      {/* Navigation Sections (ISO PJ 3 & PJ 4) */}
      <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Section: GENERAL */}
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-white/35">
            GENERAL
          </p>
          <div className="space-y-0.5">
            <Link
              href={withProfile("/companion")}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isExactActive("/companion")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <LayoutDashboard size={14} className="opacity-70" />
              <span>Overview</span>
            </Link>
            <Link
              href={withProfile("/companion/profiles")}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/companion/profiles")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Users size={14} className="opacity-70" />
              <span>Profiles</span>
            </Link>
          </div>
        </div>

        {/* Section: SYNC DATA */}
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-white/35">
            SYNC DATA
          </p>
          <div className="space-y-0.5">
            <Link
              href={withProfile("/companion/manage/addons")}
              className={clsx(
                "flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                pathname.includes("/companion/manage/addons")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Puzzle size={14} className="opacity-70" />
                Plugins
              </span>
              <span className="text-[11px] font-semibold text-white/50">{navCounts.addons}</span>
            </Link>

            <Link
              href={withProfile("/companion/manage/addons")}
              className={clsx(
                "flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                pathname.includes("/companion/manage/addons")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Tv size={14} className="opacity-70" />
                Addons
              </span>
              <span className="text-[11px] font-semibold text-white/50">{navCounts.addons}</span>
            </Link>

            <Link
              href={withProfile("/companion/watchlist")}
              className={clsx(
                "flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/companion/watchlist")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2.5">
                <ListVideo size={14} className="opacity-70" />
                Watch Progress
              </span>
              <span className="text-[11px] font-semibold text-white/50">{navCounts.watchProgress}</span>
            </Link>

            <Link
              href={withProfile("/companion/manage/catalogs")}
              className={clsx(
                "flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/companion/manage/catalogs")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Library size={14} className="opacity-70" />
                Library
              </span>
              <span className="text-[11px] font-semibold text-white/50">{navCounts.library}</span>
            </Link>

            <Link
              href={withProfile("/companion/manage/catalogs")}
              className={clsx(
                "flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/companion/manage/catalogs")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2.5">
                <FolderHeart size={14} className="opacity-70" />
                Catalogues
              </span>
              <span className="text-[11px] font-semibold text-white/50">{navCounts.collections}</span>
            </Link>

            <Link
              href={withProfile("/companion#history")}
              className={clsx(
                "flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                pathname === "/companion"
                  ? "text-white/60 hover:text-white hover:bg-white/5"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="opacity-70" />
                Watched
              </span>
              <span className="text-[11px] font-semibold text-white/50">{navCounts.watched}</span>
            </Link>
          </div>
        </div>

        {/* Section: SYSTEM */}
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-white/35">
            SYSTEM
          </p>
          <div className="space-y-0.5">
            <Link
              href={withProfile("/companion/manage/settings")}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/companion/manage/settings")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Tv2 size={14} className="opacity-70" />
              <span>TV Settings</span>
            </Link>
            <Link
              href={withProfile("/companion/settings")}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/companion/settings")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Smartphone size={14} className="opacity-70" />
              <span>Mobile Settings</span>
            </Link>
          </div>
        </div>

        {/* Section: ACCOUNT */}
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-white/35">
            ACCOUNT
          </p>
          <div className="space-y-0.5">
            <Link
              href="/premium"
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/premium")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <CreditCard size={14} className="opacity-70" />
              <span>Membership</span>
            </Link>
            <Link
              href={withProfile("/companion/devices")}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isPrefixActive("/companion/devices")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Laptop2 size={14} className="opacity-70" />
              <span>Devices</span>
            </Link>
            <Link
              href={withProfile("/companion/manage")}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                isExactActive("/companion/manage")
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <SlidersHorizontal size={14} className="opacity-70" />
              <span>Advanced</span>
            </Link>

            {isAdmin && (
              <Link
                href="/companion/admin"
                className={clsx(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-amber-400",
                  isPrefixActive("/companion/admin")
                    ? "bg-amber-400/15 font-semibold"
                    : "hover:bg-amber-400/10"
                )}
              >
                <ShieldAlert size={14} />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
