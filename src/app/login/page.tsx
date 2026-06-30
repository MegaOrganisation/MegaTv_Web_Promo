import Image from "next/image";
import { Suspense } from "react";
import { ArrowLeft, BarChart3, Cloud, LockKeyhole, ShieldCheck } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";
import { LoginForm } from "@/features/auth/LoginForm";

const bullets = [
  { icon: ShieldCheck, label: "Connexion ID MegaTv", text: "Utilisez le compte MegaTv Cloud déjà associé à vos appareils." },
  { icon: Cloud, label: "Session synchronisée", text: "Après connexion, vous revenez automatiquement vers MegaCompagnon." },
  { icon: LockKeyhole, label: "Données isolées", text: "Supabase RLS limite l'accès aux données autorisées par votre compte." }
];

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <MegaLink href="/" variant="ghost" className="inline-flex">
            <ArrowLeft className="h-4 w-4" />
            Site promo
          </MegaLink>
          <MegaLink href="/companion" variant="ghost" className="hidden sm:inline-flex">
            <BarChart3 className="h-4 w-4" />
            Companion
          </MegaLink>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_450px]">
          <GlassCard className="relative min-h-[520px] overflow-hidden p-8 sm:p-10">
            <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#d8497f]/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-[#3f9ae6]/20 blur-3xl" />
            <div className="relative">
              <Image src="/assets/logo.png" alt="MegaTv" width={156} height={48} className="mb-10 h-auto w-40" priority />
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white/38">MegaCompagnon sécurisé</p>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-6xl">
                Connectez votre <span className="spectrum-text">ID MegaTv</span>.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/58">
                Entrez l'adresse e-mail et le mot de passe de votre compte MegaTv Cloud. Une fois authentifié, le dashboard web Companion s'ouvre automatiquement.
              </p>
              <div className="mt-8 grid gap-3">
                {bullets.map(({ icon: Icon, label, text }) => (
                  <div key={label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-white/48">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <Image src="/assets/mark.png" alt="MegaTv" width={42} height={42} className="rounded-xl" />
              <div>
                <h2 className="text-2xl font-bold text-white">Connexion ID MegaTv</h2>
                <p className="mt-1 text-sm leading-6 text-white/52">Accès au Companion web.</p>
              </div>
            </div>
            <Suspense fallback={<div className="text-sm text-white/50">Chargement...</div>}>
              <LoginForm />
            </Suspense>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
