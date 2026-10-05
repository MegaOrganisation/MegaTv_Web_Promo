"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";

import { MegaFloatingNav } from "@/components/ui/MegaFloatingNav";
import { CompanionSidebar } from "@/components/ui/CompanionSidebar";
import { MobileCompanionChrome, MobileCompanionNav } from "@/components/ui/ResponsiveShellNav";
import { GlobalProfileSelector } from "@/features/companion/GlobalProfileSelector";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

export function ResponsiveShell({
  children,
  title,
  subtitle,
  isAdmin = false,
  headerEnd,
  hero,
  hidePageHeader = false,
  continueWatching: _continueWatching
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
  headerEnd?: ReactNode;
  hero?: ReactNode;
  showRail?: boolean;
  continueWatching?: ContinueWatchingRow[];
  hidePageHeader?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const mobileNav = mounted ? createPortal(<MobileCompanionNav isAdmin={isAdmin} />, document.body) : null;
  const mobileChrome = mounted
    ? createPortal(
        <MobileCompanionChrome isAdmin={isAdmin} headerEnd={headerEnd} profileAnchor={<GlobalProfileSelector />} />,
        document.body
      )
    : null;

  return (
    <div className="min-h-screen bg-[#090b10] text-[#eef1f7] flex flex-col font-sans">
      {/* Top Floating Pill Navbar (ISO Nuvio) */}
      <MegaFloatingNav currentTab="companion" />

      {/* Top Space for Floating Nav */}
      <div className="h-16 sm:h-20 shrink-0" />

      {/* Main Layout: Left Sidebar + Main Body */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar (ISO PJ 3 & PJ 4) */}
        <div className="hidden md:flex shrink-0 sticky top-20 h-[calc(100vh-5rem)]">
          <CompanionSidebar isAdmin={isAdmin} />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[120] md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-[#0c0d12] h-full z-10 flex flex-col shadow-2xl">
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CompanionSidebar isAdmin={isAdmin} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area (Clean matte background, ISO PJ 3 & PJ 4) */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {/* Mobile Sidebar Toggle Button */}
          <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs font-medium text-white/80 hover:text-white"
            >
              <Menu size={15} />
              <span>Menu Compagnon</span>
            </button>
            {headerEnd ? <div>{headerEnd}</div> : null}
          </div>

          {/* Optional Hero */}
          {hero ? <div className="mb-6">{hero}</div> : null}

          {/* Clean Page Header (if not hidden) */}
          {!hidePageHeader ? (
            <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
                {subtitle ? <p className="text-xs sm:text-sm text-white/50 mt-1">{subtitle}</p> : null}
              </div>
              {headerEnd ? <div className="hidden sm:block">{headerEnd}</div> : null}
            </header>
          ) : null}

          {/* Children View (Overview, Watchlist, Settings, etc.) */}
          <div className="w-full">{children}</div>
        </main>
      </div>

      {/* Mobile nav fallback if needed */}
      {mobileChrome}
      {mobileNav}
    </div>
  );
}
