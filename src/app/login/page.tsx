import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, BarChart3 } from "lucide-react";

import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Navigation */}
      <div className="mb-6 flex w-full max-w-[440px] items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Site promo</span>
        </Link>
        <Link
          href="/companion"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Companion</span>
        </Link>
      </div>

      {/* Brand logo centered above card (parité TV & Mobile app - PJ 2) */}
      <div className="mb-4 sm:mb-5 flex items-center justify-center">
        <Image
          src="/assets/logo.png"
          alt="MegaTv"
          width={150}
          height={44}
          className="h-9 sm:h-10 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          priority
        />
      </div>

      {/* White Auth Card matching TV and Mobile App */}
      <div className="w-full max-w-[440px] rounded-[28px] sm:rounded-[32px] bg-white p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] border border-slate-100/80">
        <Suspense fallback={<div className="py-12 text-center text-sm font-medium text-slate-400">Chargement...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
