import { Suspense, type ReactNode } from "react";

import { CompanionRouteProgress } from "@/features/companion/CompanionRouteProgress";
import { CompanionChromeProvider } from "@/features/companion/CompanionChromeContext";
import { CompanionLiquidGlassRoot } from "@/features/companion/liquid-glass/CompanionLiquidGlassRoot";
import { CompanionProfileProvider } from "@/features/companion/CompanionProfileProvider";
import { CompanionAmbientShell } from "@/features/companion/ui/CompanionAmbientShell";
import { CompanionBackgroundProvider } from "@/features/companion/CompanionBackgroundContext";
import { getDashboardData } from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";

async function CompanionProfileBoundary({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { profiles, profileAvatarUrlsById } = user ? await getDashboardData(null) : { profiles: [], profileAvatarUrlsById: {} };

  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--mega-text-faint)]">Chargement…</div>}>
      <CompanionProfileProvider profiles={profiles} profileAvatarUrlsById={profileAvatarUrlsById}>
        <CompanionChromeProvider>{children}</CompanionChromeProvider>
      </CompanionProfileProvider>
    </Suspense>
  );
}

/** Suspense autour du provider profil (useSearchParams) — évite crash / hydration. */
export default async function CompanionRootLayout({ children }: { children: ReactNode }) {
  return (
    <CompanionLiquidGlassRoot>
      <CompanionBackgroundProvider>
        <CompanionAmbientShell>
          <CompanionRouteProgress />
          <CompanionProfileBoundary>{children}</CompanionProfileBoundary>
        </CompanionAmbientShell>
      </CompanionBackgroundProvider>
    </CompanionLiquidGlassRoot>
  );
}
