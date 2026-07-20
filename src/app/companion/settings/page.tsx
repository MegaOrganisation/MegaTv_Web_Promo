import { LockKeyhole, Smartphone, UserRound } from "lucide-react";

import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { MegaSurface } from "@/features/companion/ui/MegaSurface";
import { PwaInstallPrompt } from "@/features/companion/PwaInstallPrompt";
import { SettingsAppearanceSection } from "@/features/companion/settings/SettingsAppearanceSection";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function CompanionSettingsPage() {
  const user = await requireUser("/companion/settings");
  const { isAdmin } = await getDashboardData(null);

  return (
    <ResponsiveShell
      title="Réglages"
      subtitle="Compte, sécurité, fond d'écran liquid glass et accès rapide."
      isAdmin={isAdmin}
      hidePageHeader
    >
      <PageEventTracker page="Companion Settings" />
      <div className="mega-cinema-settings-grid">
        <MegaSurface as="section" elevated id="compte">
          <div className="mb-3 flex items-center gap-3">
            <div className="mega-metric-icon-wrap">
              <UserRound className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="mega-cinema-display text-lg">Compte connecté</h2>
              <p className="mt-0.5 text-xs text-white/45">Session Supabase active.</p>
            </div>
          </div>
          <p className="break-all text-sm text-white/55">{user.email || user.id}</p>
          <p className="mt-3 text-sm text-white/55">
            Admin : <span className="font-semibold text-white">{isAdmin ? "activé" : "non activé"}</span>
          </p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </MegaSurface>

        <MegaSurface as="section" elevated>
          <div className="mb-3 flex items-center gap-3">
            <div className="mega-metric-icon-wrap">
              <LockKeyhole className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="mega-cinema-display text-lg">Sécurité des données</h2>
              <p className="mt-0.5 text-xs text-white/45">RLS + écritures batch serveur.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-white/55">
            Les modifications passent par des routes serveur authentifiées : aucun user_id n&apos;est accepté depuis le
            client et les écritures restent filtrées par votre session Supabase.
          </p>
        </MegaSurface>

        <div id="apparence" className="contents">
          <SettingsAppearanceSection isAdmin={isAdmin} />
        </div>

        <MegaSurface as="section" elevated id="sync">
          <div className="mb-3 flex items-center gap-3">
            <div className="mega-metric-icon-wrap">
              <Smartphone className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="mega-cinema-display text-lg">Application mobile</h2>
              <p className="mt-0.5 text-xs text-white/45">PWA et sync appareils.</p>
            </div>
          </div>
          <PwaInstallPrompt embedded />
        </MegaSurface>
      </div>
    </ResponsiveShell>
  );
}
