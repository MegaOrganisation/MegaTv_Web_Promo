"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

import { FloatingProfileSlot } from "@/components/ui/FloatingProfileSlot";
import { DesktopCompanionNav, MobileCompanionChrome, MobileCompanionNav } from "@/components/ui/ResponsiveShellNav";
import { GlobalProfileSelector } from "@/features/companion/GlobalProfileSelector";
import { useCompanionChrome } from "@/features/companion/CompanionChromeContext";

const SCROLL_DOCK_THRESHOLD = 48;

export function ResponsiveShell({
  children,
  title,
  subtitle,
  isAdmin = false,
  headerEnd
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
  headerEnd?: ReactNode;
}) {
  const [docked, setDocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { modalActive } = useCompanionChrome();
  const headerProfileRef = useRef<HTMLDivElement>(null);
  const dockProfileRef = useRef<HTMLDivElement>(null);
  const effectiveDocked = docked || modalActive;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY > SCROLL_DOCK_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  const mobileChrome = mounted
    ? createPortal(
        <>
          <MobileCompanionChrome
            isAdmin={isAdmin}
            headerEnd={headerEnd}
            docked={effectiveDocked}
            profileAnchor={
              modalActive ? (
                <GlobalProfileSelector />
              ) : (
                <div ref={dockProfileRef} className="h-11 w-11 shrink-0" aria-hidden="true" />
              )
            }
          />
          <MobileCompanionNav />
        </>,
        document.body
      )
    : null;

  return (
    <div className="companion-shell min-h-screen overflow-x-clip pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:overflow-visible lg:pb-0">
      <DesktopCompanionNav isAdmin={isAdmin} />
      {mobileChrome}

      <main className="box-border w-full min-w-0 max-w-full overflow-x-clip px-4 py-6 pt-[calc(3.75rem+max(0.65rem,env(safe-area-inset-top)))] transition-[margin,width] duration-300 ease-out sm:px-6 lg:ml-[5.75rem] lg:w-[calc(100%-5.75rem)] lg:overflow-visible lg:px-6 lg:py-8 lg:pt-8 lg:peer-hover/nav:ml-[18rem] lg:peer-hover/nav:w-[calc(100%-18rem)] lg:peer-focus-within/nav:ml-[18rem] lg:peer-focus-within/nav:w-[calc(100%-18rem)] xl:px-8 2xl:px-10">
        <div className="mb-7 flex items-start justify-between gap-4 sm:mb-10">
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[var(--mega-text-faint)]">MegaCompagnon</p>
            <h1 className="text-3xl font-black tracking-tight text-[var(--mega-text)] sm:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mega-text-muted)] sm:text-base">{subtitle}</p> : null}
          </div>
          <div className="mt-1 mr-0.5 flex shrink-0 items-center gap-2 self-start pt-1 sm:mt-2 sm:mr-1 lg:mt-3 lg:mr-2">
            <div
              className={clsx(
                "transition-all duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                docked ? "max-lg:pointer-events-none max-lg:-translate-x-1 max-lg:opacity-0" : "max-lg:translate-x-0 max-lg:opacity-100"
              )}
            >
              {headerEnd}
            </div>
            <div ref={headerProfileRef} className="h-11 w-11 shrink-0 max-lg:invisible lg:hidden" aria-hidden="true" />
          </div>
        </div>
        {children}
      </main>

      {!modalActive ? (
        <FloatingProfileSlot docked={effectiveDocked} headerRef={headerProfileRef} dockRef={dockProfileRef}>
          <GlobalProfileSelector />
        </FloatingProfileSlot>
      ) : null}
    </div>
  );
}
