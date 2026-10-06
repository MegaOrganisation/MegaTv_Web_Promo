import type { Metadata } from "next";
import { Check } from "lucide-react";
import Link from "next/link";

import { MegaFloatingNav } from "@/components/ui/MegaFloatingNav";

export const metadata: Metadata = {
  title: "Formules Premium & Supporter — MegaTv",
  description: "Formules Premium & Supporter MegaTv : thèmes exclusifs, profils multiples, synchronisation cloud illimitée et sous-titres IA."
};

export default function PremiumPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-[#F1F0F4] flex flex-col items-center" style={{ background: "#10191C" }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div
          className="absolute rounded-full"
          style={{
            width: "60vw",
            height: "60vw",
            top: "-22vw",
            left: "-12vw",
            background: "radial-gradient(circle, rgba(63,154,230,0.55), transparent 65%)",
            filter: "blur(90px)",
            opacity: 0.22,
            mixBlendMode: "screen"
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "55vw",
            height: "55vw",
            top: "30vh",
            right: "-18vw",
            background: "radial-gradient(circle, rgba(216,73,127,0.45), transparent 65%)",
            filter: "blur(90px)",
            opacity: 0.22,
            mixBlendMode: "screen"
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "48vw",
            height: "48vw",
            top: "70vh",
            left: "20vw",
            background: "radial-gradient(circle, rgba(31,168,160,0.4), transparent 65%)",
            filter: "blur(90px)",
            opacity: 0.18,
            mixBlendMode: "screen"
          }}
        />
      </div>
      {/* Top Floating Pill Bar (ISO Nuvio) */}
      <MegaFloatingNav currentTab="premium" />

      {/* Main Content Area */}
      <main className="w-full max-w-5xl px-4 sm:px-6 pt-24 sm:pt-32 pb-24 flex flex-col items-center">
        {/* Header (ISO Image 1) */}
        <div className="text-center max-w-2xl mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-4 h-0.5 rounded-full bg-gradient-to-r from-teal-400 to-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent">
              SOUTENEZ MEGATV
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Formules Premium &amp; Supporter
          </h1>

          <p className="text-sm sm:text-base text-white/60 leading-relaxed font-normal max-w-xl mx-auto">
            Le lecteur de base reste 100% gratuit. Votre abonnement Supporter permet de financer les serveurs et débloque des bonus exclusifs.
          </p>
        </div>

        {/* 3 Cards Grid (ISO Image 1) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: SUPPORTER */}
          <div className="rounded-[26px] bg-[#0e111a] border border-white/8 p-7 flex flex-col justify-between transition-all hover:border-white/14">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-white/45 mb-2">
                SUPPORTER
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">1,50</span>
                <span className="text-xs font-medium text-white/45">$US/mois</span>
              </div>
              <p className="text-xs text-white/40 mb-6">Pour soutenir le projet</p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Thèmes gradients exclusifs</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Arrière-plans catalogue</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Avatars étendus</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Badge Supporter</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Rôle Discord Supporter</span>
                </div>
              </div>
            </div>

            <a
              href="/api/checkout?plan=monthly"
              className="w-full py-3 px-4 rounded-full bg-white/10 hover:bg-white/16 border border-white/8 text-white font-semibold text-xs text-center transition-all"
            >
              Rejoindre
            </a>
          </div>

          {/* Card 2: SUPPORTER PLUS (Featured) */}
          <div className="rounded-[26px] bg-[#111422] border border-indigo-500/35 p-7 flex flex-col justify-between relative shadow-[0_0_50px_rgba(99,102,241,0.14)] transition-all hover:border-indigo-400/50">
            {/* Badge Plus Populaire */}
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 shadow-md">
              PLUS POPULAIRE
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300 bg-clip-text text-transparent mb-2">
                SUPPORTER PLUS
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">3,00</span>
                <span className="text-xs font-medium text-white/45">$US/mois</span>
              </div>
              <p className="text-xs text-white/40 mb-6">Expérience complète</p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Tout Supporter +</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Jusqu&apos;à 5 profils familiaux</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Synchronisation Cloud illimitée</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Votes sur les fonctionnalités</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Sous-titres IA illimités</span>
                </div>
              </div>
            </div>

            <a
              href="/api/checkout?plan=yearly"
              className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300 hover:opacity-95 text-black font-extrabold text-xs text-center transition-all shadow-lg shadow-teal-500/20"
            >
              Devenir Supporter Plus
            </a>
          </div>

          {/* Card 3: ONE TIME PASS */}
          <div className="rounded-[26px] bg-[#0e111a] border border-white/8 p-7 flex flex-col justify-between transition-all hover:border-white/14">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-white/45 mb-2">
                ONE TIME PASS
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">Dès 10</span>
                <span className="text-xs font-medium text-white/45">$US unique</span>
              </div>
              <p className="text-xs text-white/40 mb-6">12 mois sans engagement</p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Tous les avantages Supporter Plus</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Pas de renouvellement automatique</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Montant libre dès 10$</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80">
                  <div className="w-4 h-4 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-teal-400" />
                  </div>
                  <span>Accès instantané</span>
                </div>
              </div>
            </div>

            <a
              href="/api/checkout?plan=lifetime"
              className="w-full py-3 px-4 rounded-full bg-white/10 hover:bg-white/16 border border-white/8 text-white font-semibold text-xs text-center transition-all"
            >
              Choisir un montant
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
