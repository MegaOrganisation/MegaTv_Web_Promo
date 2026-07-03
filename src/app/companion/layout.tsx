import { Suspense, type ReactNode } from "react";

import { CompanionRouteProgress } from "@/features/companion/CompanionRouteProgress";
import { CompanionChromeProvider } from "@/features/companion/CompanionChromeContext";
import { CompanionProfileProvider } from "@/features/companion/CompanionProfileProvider";
import { getDashboardData } from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";

async function CompanionProfileBoundary({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { profiles, profileAvatarUrlsById } = user ? await getDashboardData(null) : { profiles: [], profileAvatarUrlsById: {} };

  return (
    <CompanionProfileProvider profiles={profiles} profileAvatarUrlsById={profileAvatarUrlsById}>
      <CompanionChromeProvider>{children}</CompanionChromeProvider>
    </CompanionProfileProvider>
  );
}

export default function CompanionRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CompanionRouteProgress />
      <Suspense fallback={children}>
        <CompanionProfileBoundary>{children}</CompanionProfileBoundary>
      </Suspense>
    </>
  );
}
