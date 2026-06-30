import Image from "next/image";
import Link from "next/link";
import { BarChart3, Home, MonitorCog, Settings, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { MegaLink } from "@/components/ui/MegaButton";

const navItems = [
  { href: "/companion", label: "Dashboard", icon: Home },
  { href: "/companion/settings", label: "Profils", icon: UserRound },
  { href: "/companion/admin", label: "Admin", icon: ShieldCheck },
  { href: "/companion/settings", label: "Réglages", icon: Settings }
];

export function ResponsiveShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <aside className="fixed left-5 top-5 z-30 hidden h-[calc(100vh-40px)] w-72 flex-col justify-between rounded-[32px] border border-white/10 bg-black/35 p-5 backdrop-blur-2xl lg:flex">
        <div>
          <Link href="/" className="focus-ring mb-8 flex items-center gap-3 rounded-2xl">
            <Image src="/assets/mark.png" alt="MegaTv" width={42} height={42} className="rounded-xl" />
            <div>
              <p className="text-sm text-white/45">MegaTv</p>
              <p className="text-lg font-bold text-white">MegaCompagnon</p>
            </div>
          </Link>
          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                className="focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/62 transition hover:bg-white/[0.07] hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <MonitorCog className="mb-3 h-5 w-5 text-white/70" />
          <p className="text-sm font-semibold text-white">Vue officielle MegaTv</p>
          <p className="mt-1 text-xs leading-5 text-white/45">Données isolées par compte Supabase et profil actif.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#06070a]/72 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-2xl">
            <Image src="/assets/mark.png" alt="MegaTv" width={34} height={34} className="rounded-lg" />
            <span className="font-bold">MegaCompagnon</span>
          </Link>
          <MegaLink href="/companion" variant="ghost" className="min-h-9 px-3 text-xs">
            <BarChart3 className="h-4 w-4" />
            Stats
          </MegaLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:ml-80 lg:px-8 lg:py-10">
        <div className="mb-7 sm:mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/38">MegaCompagnon</p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">{subtitle}</p> : null}
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-2 rounded-[26px] border border-white/10 bg-black/62 p-2 backdrop-blur-2xl lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={`${href}-${label}-mobile`} href={href} className="focus-ring flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold text-white/58">
            <Icon className="h-4 w-4" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
