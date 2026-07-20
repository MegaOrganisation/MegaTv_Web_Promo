import { MonitorSmartphone } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { DeviceManagementPanel } from "@/features/dashboard/DeviceManagementPanel";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { requireUser } from "@/lib/auth/require-user";
import { getMergedDevices } from "@/lib/devices/queries";
import { getDashboardData } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function CompanionDevicesPage() {
  await requireUser("/companion/devices");
  const { isAdmin } = await getDashboardData(null);
  // List by device_id (rename keeps uniqueness). Soft hardware ghosts only for cleanup banner.
  const [{ devices, duplicateIds }, raw] = await Promise.all([getMergedDevices({ dedupe: true }), getMergedDevices({ dedupe: false })]);

  return (
    <ResponsiveShell
      title="Appareils"
      subtitle="Appareils liés au compte — statut en ligne, renommage et suppression."
      isAdmin={isAdmin}
      hidePageHeader
    >
      <PageEventTracker page="Companion Devices" />
      <GlassCard as="section" className="min-w-0 max-w-full overflow-hidden">
        <div className="mb-5 flex items-center gap-3">
          <MonitorSmartphone className="h-6 w-6 text-white/70" />
          <div>
            <h2 className="text-2xl font-bold text-white">Appareils cloud</h2>
            <p className="mt-1 text-sm text-white/45">
              {devices.length} appareil(s) unique(s)
              {raw.devices.length > devices.length ? ` · ${raw.devices.length - devices.length} doublon(s) détecté(s)` : ""}
            </p>
          </div>
        </div>
        <DeviceManagementPanel devices={devices} duplicateCount={duplicateIds.length} />
      </GlassCard>
    </ResponsiveShell>
  );
}
