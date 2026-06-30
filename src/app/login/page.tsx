import Image from "next/image";
import { Suspense } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <MegaLink href="/" variant="ghost" className="mb-6 inline-flex">
          Retour au site
        </MegaLink>
        <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
          <GlassCard className="relative min-h-[420px] overflow-hidden p-8 sm:p-10">
            <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#d8497f]/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-[#3f9ae6]/20 blur-3xl" />
            <div className="relative">
              <Image src="/assets/logo.png" alt="MegaTv" width={156} height={48} className="mb-10 h-auto w-40" priority />
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white/38">Dashboard officiel</p>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-6xl">
                Bienvenue dans <span className="spectrum-text">MegaCompagnon</span>.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/58">
                Connectez-vous à MegaTv Cloud pour retrouver vos stats de visionnage, vos profils, vos appareils et vos contenus favoris dans une interface sécurisée.
              </p>
            </div>
          </GlassCard>
          <GlassCard className="p-6 sm:p-7">
            <h2 className="text-2xl font-bold text-white">Connexion MegaTv Cloud</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">Votre session est utilisée uniquement côté Companion. Les droits restent contrôlés par Supabase RLS.</p>
            <div className="mt-6">
              <Suspense fallback={<div className="text-sm text-white/50">Chargement...</div>}>
                <LoginForm />
              </Suspense>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
