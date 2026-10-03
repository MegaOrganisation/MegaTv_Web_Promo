import { SlidersHorizontal } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ManageSettingsPanel } from "@/features/companion/settings/ManageSettingsPanel";

export const dynamic = "force-dynamic";

export default function ManageSettingsPage() {
  return (
    <GlassCard as="section" className="min-w-0 max-w-full overflow-hidden">
      <div className="mb-6 flex items-center gap-3">
        <SlidersHorizontal className="h-6 w-6 text-indigo-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Paramètres TV & Mobile</h2>
          <p className="mt-1 text-sm text-white/45">
            Configurez et synchronisez immédiatement tous les réglages de vos appareils connectés.
          </p>
        </div>
      </div>
      <ManageSettingsPanel />
    </GlassCard>
  );
}
