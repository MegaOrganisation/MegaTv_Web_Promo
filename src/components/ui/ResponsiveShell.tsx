import type { ReactNode } from "react";

import { DesktopCompanionNav, MobileCompanionChrome } from "@/components/ui/ResponsiveShellNav";

export function ResponsiveShell({
  children,
  title,
  subtitle,
  isAdmin = false
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <DesktopCompanionNav isAdmin={isAdmin} />
      <MobileCompanionChrome isAdmin={isAdmin} />

      <main className="w-full px-4 py-6 sm:px-6 lg:ml-28 lg:w-[calc(100%-7rem)] lg:px-6 lg:py-8 xl:px-8 2xl:px-10">
        <div className="mb-7 sm:mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/38">MegaCompagnon</p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58 sm:text-base">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
