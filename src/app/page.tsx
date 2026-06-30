import Image from "next/image";
import { Activity, BarChart3, DatabaseZap, Film, LockKeyhole, ShieldCheck, Smartphone, Tv } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";

const features = [
  { icon: Film, title: "Stats personnelles", text: "Films, épisodes, temps total, reprise de lecture et contenus favoris par profil." },
  { icon: ShieldCheck, title: "Isolation RLS", text: "Chaque utilisateur lit uniquement ses lignes Supabase via user_id et profile_id." },
  { icon: DatabaseZap, title: "Vue admin", text: "Agrégats d'infrastructure, activité produit, BDD et état de la synchronisation." },
  { icon: Activity, title: "Sentry", text: "Top erreurs et crash rate remontés côté serveur, sans exposer de token." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Image src="/assets/logo.png" alt="MegaTv" width={140} height={44} priority className="h-auto w-36" />
        <div className="flex items-center gap-2">
          <MegaLink href="/login" variant="ghost" className="hidden sm:inline-flex">Connexion</MegaLink>
          <MegaLink href="/companion">Ouvrir le compagnon</MegaLink>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-90px)] w-full max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-xs font-semibold text-white/62 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-[#00d588] shadow-[0_0_20px_rgba(0,213,136,0.8)]" />
            Dashboard officiel de l'écosystème MegaTv
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Mega<span className="spectrum-text">Compagnon</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
            Votre cockpit MegaTv : statistiques de visionnage, top contenus enrichis TMDB, profils, appareils, santé Supabase et monitoring Sentry dans une interface glassmorphism mobile-first.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <MegaLink href="/login" className="sm:min-w-52">Se connecter</MegaLink>
            <MegaLink href="#vision" variant="ghost">Découvrir l'architecture</MegaLink>
          </div>
          <div className="mt-9 flex flex-wrap gap-3 text-sm text-white/48">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Supabase RLS</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">TMDB posters</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Sentry Admin</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Web → Mobile ready</span>
          </div>
        </div>

        <DashboardMockup />
      </section>

      <section id="vision" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/38">Architecture</p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Pensé pour vos utilisateurs et pour l'admin.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <GlassCard key={title} className="min-h-56">
              <Icon className="mb-5 h-6 w-6 text-white/72" />
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </main>
  );
}

function DashboardMockup() {
  return (
    <GlassCard className="spectrum-border relative overflow-hidden p-4 sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,73,127,0.20),transparent_45%)]" />
      <div className="relative rounded-[24px] border border-white/10 bg-black/28 p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/assets/mark.png" alt="MegaTv" width={42} height={42} className="rounded-xl" />
            <div>
              <p className="text-xs text-white/42">Bienvenue</p>
              <p className="font-bold text-white">Dashboard</p>
            </div>
          </div>
          <div className="flex gap-2 text-white/50">
            <BarChart3 className="h-5 w-5" />
            <LockKeyhole className="h-5 w-5" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniMetric label="Films vus" value="215" icon={<Film className="h-4 w-4" />} />
          <MiniMetric label="Heures" value="128 h" icon={<Tv className="h-4 w-4" />} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <p className="mb-4 text-sm font-bold text-white">Top contenus</p>
            {["Dune", "The Boys", "Loki"].map((item, index) => (
              <div key={item} className="mb-3 last:mb-0">
                <div className="mb-2 flex justify-between text-xs text-white/55"><span>{item}</span><span>{92 - index * 17}%</span></div>
                <div className="h-2 rounded-full bg-white/8"><div className="h-2 rounded-full bg-[linear-gradient(110deg,#3f9ae6,#f2b43c,#d8497f)]" style={{ width: `${92 - index * 17}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <p className="mb-4 text-sm font-bold text-white">Écrans</p>
            <div className="grid grid-cols-2 gap-3 text-center text-xs text-white/55">
              <div className="rounded-2xl bg-white/[0.06] p-3"><Smartphone className="mx-auto mb-2 h-5 w-5" />Mobile</div>
              <div className="rounded-2xl bg-white/[0.06] p-3"><Tv className="mx-auto mb-2 h-5 w-5" />TV</div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function MiniMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-3 text-white/52">{icon}</div>
      <p className="text-xs text-white/42">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
