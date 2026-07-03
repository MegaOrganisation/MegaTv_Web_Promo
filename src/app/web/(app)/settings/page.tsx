import { WebSettings } from "@/features/web/WebSettings";
import { getCurrentUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function WebSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <h1 className="px-1 text-2xl font-bold text-[var(--mega-text)]">Réglages</h1>
      <WebSettings accountEmail={user?.email ?? null} />
    </div>
  );
}
