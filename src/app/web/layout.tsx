import { Suspense, type ReactNode } from "react";

import { WebProfileProvider } from "@/features/web/WebProfileProvider";
import { requireUser } from "@/lib/auth/require-user";
import { getWebProfiles } from "@/lib/web/profiles";

export const dynamic = "force-dynamic";

export default async function WebLayout({ children }: { children: ReactNode }) {
  await requireUser("/web");
  const profiles = await getWebProfiles();

  return (
    <Suspense fallback={null}>
      <WebProfileProvider profiles={profiles}>{children}</WebProfileProvider>
    </Suspense>
  );
}
