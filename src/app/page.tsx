import Image from "next/image";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cloud,
  DatabaseZap,
  Film,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";

const appFeatures = [
  { icon: Film, title: "Films & séries", text: "Un hub premium pour vos catalogues, watchlists, collections, genres et reprises de lecture." },
  { icon: Tv, title: "Live TV / IPTV", text: "M3U, Xtream, favoris, EPG et lecture plein écran sur TV, mobile et tablette." },
  { icon: Cloud, title: "MegaTv Cloud", text: "Profils, paramètres, appareils, progression et listes synchronisés entre vos écrans." },
  { icon: PlayCircle, title: "Lecteur avancé", text: "Lecture ExoPlayer / Media3, pistes audio, sous-titres et commandes pensées pour la télécommande." }
];

const companionFeatures = [
  { icon: BarChart3, title: "Stats personnelles", text: "Films, épisodes, temps total, reprise de lecture et contenus favoris par profil." },
  { icon: ShieldCheck, title: "Connexion ID MegaTv", text: "Accès protégé par Supabase Auth avec redirection automatique vers le Companion." },
  { icon: DatabaseZap, title: "Données cloud", text: "Lecture sécurisée des profils, appareils et métriques via les politiques RLS existantes." },
  { icon: Activity, title: "Vue admin", text: "Agrégats d'infrastructure, activité produit et monitoring Sentry côté serveur." }
];

const steps = [
  "Sélectionnez MegaCompagnon depuis le site promo.",
  "Connectez-vous avec votre ID MegaTv Cloud.",
  "Accédez au dashboard web Companion et à vos données synchronisées."
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <MegaLink href="#hero" variant="ghost" className="min-h-0 border-0 bg-transparent p-0 hover:bg-transparent">
          <Image src="/assets/logo.png" alt="MegaTv" width={140} height={44} priority className="h-auto w-36" />
        </MegaLink>
        <div className="hidden items-center gap-5 text-sm font-semibold text-white/52 md:flex">
          <a href="#promo" className="transition hover:text-white">Application</a>
          <a href="#screens" className="transition hover:text-white">Captures</a>
          <a href="#companion" className="transition hover:text-white">Companion</a>
        </div>
        <div className="flex items-center gap-2">
          <MegaLink href="/login" variant="ghost" className="hidden sm:inline-flex">ID MegaTv</MegaLink>
          <MegaLink href="/login?next=%2Fcompanion">Ouvrir Companion</MegaLink>
        </div>
      </nav>

      <section id="hero" className="mx-auto grid min-h-[calc(100vh-90px)] w-full max-w-7xl items-center gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-xs font-semibold text-white/62 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-[#00d588] shadow-[0_0_20px_rgba(0,213,136,0.8)]" />
            Site officiel MegaTv · Promo + MegaCompagnon
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Films, séries <span className="spectrum-text">& TV live</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
            MegaTv réunit vos sources multimédias, vos profils et votre progression cloud. Depuis ce site, découvrez l'application puis ouvrez MegaCompagnon pour consulter vos stats avec votre ID MegaTv.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <MegaLink href="#promo" className="sm:min-w-52">
              Découvrir MegaTv
              <ArrowRight className="h-4 w-4" />
            </MegaLink>
            <MegaLink href="#companion" variant="ghost" className="sm:min-w-52">
              Sélectionner Companion
            </MegaLink>
          </div>
          <div className="mt-9 flex flex-wrap gap-3 text-sm text-white/48">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Android TV</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Mobile & tablette</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">IPTV / EPG</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Cloud Sync</span>
          </div>
        </div>

        <HeroShowcase />
      </section>

      <section id="promo" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/38">Application MegaTv</p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Une app. Toutes vos expériences.</h2>
          <p className="mt-4 text-base leading-7 text-white/52">
            Le site promo reste la porte d'entrée publique : il présente MegaTv, ses écrans et ses usages avant de proposer l'accès Companion.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {appFeatures.map(({ icon: Icon, title, text }) => (
            <GlassCard key={title} className="min-h-56">
              <Icon className="mb-5 h-6 w-6 text-white/72" />
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="screens" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/38">Interface premium</p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Conçu pour chaque écran.</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <GlassCard className="overflow-hidden p-3 sm:p-4">
            <Image src="/assets/tv-home.png" alt="MegaTv sur Android TV" width={1280} height={720} className="poster-shadow rounded-[24px] border border-white/10" />
          </GlassCard>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-1">
            <GlassCard className="overflow-hidden p-3 sm:p-4">
              <Image src="/assets/phone-home.png" alt="Accueil mobile MegaTv" width={420} height={860} className="mx-auto max-h-[420px] w-auto rounded-[28px]" />
            </GlassCard>
            <GlassCard className="overflow-hidden p-3 sm:p-4">
              <Image src="/assets/phone-detail.png" alt="Détails mobile MegaTv" width={420} height={860} className="mx-auto max-h-[420px] w-auto rounded-[28px]" />
            </GlassCard>
          </div>
        </div>
      </section>

      <section id="companion" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <GlassCard className="spectrum-border relative overflow-hidden p-7 sm:p-9">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d8497f]/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#3f9ae6]/20 blur-3xl" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/48">
                <Sparkles className="h-4 w-4" />
                Sélection Companion
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                Ouvrir <span className="spectrum-text">MegaCompagnon</span>
              </h2>
              <p className="mt-5 text-base leading-7 text-white/58">
                MegaCompagnon est l'app web connectée : sélectionnez-la, connectez-vous avec votre ID MegaTv, puis retrouvez votre dashboard cloud.
              </p>
              <div className="mt-7 space-y-3">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-white/58">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-black">{index + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MegaLink href="/login?next=%2Fcompanion" className="sm:min-w-56">
                  Connexion ID MegaTv
                  <ArrowRight className="h-4 w-4" />
                </MegaLink>
                <MegaLink href="/companion" variant="ghost" className="sm:min-w-52">
                  Accès direct sécurisé
                </MegaLink>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            {companionFeatures.map(({ icon: Icon, title, text }) => (
              <GlassCard key={title} className="min-h-52">
                <Icon className="mb-5 h-6 w-6 text-white/72" />
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{text}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <GlassCard className="grid items-center gap-6 p-7 sm:p-9 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/38">Sécurité</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Vos données restent liées à votre compte.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/52">
              Le Companion n'affiche que les données autorisées par votre session ID MegaTv. Les routes privées renvoient automatiquement vers la connexion puis reviennent au dashboard.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {["Supabase Auth", "RLS par utilisateur", "Admin agrégé"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white/60">
                <CheckCircle2 className="h-4 w-4 text-[#00d588]" />
                {item}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}

function HeroShowcase() {
  return (
    <GlassCard className="spectrum-border relative overflow-hidden p-4 sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,73,127,0.20),transparent_45%)]" />
      <div className="relative rounded-[24px] border border-white/10 bg-black/28 p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/assets/mark.png" alt="MegaTv" width={42} height={42} className="rounded-xl" />
            <div>
              <p className="text-xs text-white/42">Bienvenue</p>
              <p className="font-bold text-white">Écosystème MegaTv</p>
            </div>
          </div>
          <div className="flex gap-2 text-white/50">
            <Smartphone className="h-5 w-5" />
            <LockKeyhole className="h-5 w-5" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.45fr]">
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.045] p-3">
            <Image src="/assets/tv-home.png" alt="MegaTv Android TV" width={920} height={520} priority className="poster-shadow rounded-[18px]" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <Image src="/assets/phone-search.png" alt="Recherche MegaTv" width={220} height={450} className="mx-auto max-h-56 w-auto rounded-[20px]" />
            <Image src="/assets/phone-detail.png" alt="Détails MegaTv" width={220} height={450} className="mx-auto max-h-56 w-auto rounded-[20px]" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
