import { LockKeyhole, Palette, Smartphone, UserRound } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { PwaInstallPrompt } from "@/features/companion/PwaInstallPrompt";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { ThemeSelector } from "@/features/theme/ThemeSelector";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function CompanionSettingsPage() {
  const user = await requireUser("/companion/settings");
  const { isAdmin } = await getDashboardData(null);

  return (
    <ResponsiveShell title="Réglages" subtitle="Compte connecté, sécurité et apparence du MegaCompagnon." isAdmin={isAdmin}>
      <PageEventTracker page="Companion Settings" />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard as="section">
          <UserRound className="mb-4 h-6 w-6 text-white/70" />
          <h2 className="text-2xl font-bold text-white">Compte connecté</h2>
          <p className="mt-2 break-all text-sm text-white/52">{user.email || user.id}</p>
          <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-white/52">
            Statut admin : <span className="font-semibold text-white">{isAdmin ? "activé" : "non activé"}</span>
          </div>
          <div className="mt-5">
            <SignOutButton />
          </div>
        </GlassCard>

        <GlassCard as="section">
          <LockKeyhole className="mb-4 h-6 w-6 text-white/70" />
          <h2 className="text-2xl font-bold text-white">Sécurité des données</h2>
          <p className="mt-3 text-sm leading-7 text-white/52">
            Les modifications passent par des routes serveur authentifiées : aucun user_id n&apos;est accepté depuis le client et les écritures restent filtrées par votre session Supabase.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["RLS user_id", "profile_id strict", "payload synchronisé"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center text-xs font-semibold text-white/60">
                {item}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard as="section" className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <Smartphone className="h-6 w-6 text-white/70" />
          <div>
            <h2 className="text-2xl font-bold text-white">Application mobile</h2>
            <p className="mt-1 text-sm text-white/45">Installez MegaCompagnon sur l&apos;écran d&apos;accueil (PWA).</p>
          </div>
        </div>
        <PwaInstallPrompt embedded />
      </GlassCard>

      <GlassCard as="section" className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <Palette className="h-6 w-6 text-white/70" />
          <div>
            <h2 className="text-2xl font-bold text-white">Apparence</h2>
            <p className="mt-1 text-sm text-white/45">Thème clair, sombre ou automatique selon le système.</p>
          </div>
        </div>
        <ThemeSelector />
      </GlassCard>
    </ResponsiveShell>
  );
}
