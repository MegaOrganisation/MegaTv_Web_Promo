import { MonitorSmartphone } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { DeviceManagementPanel } from "@/features/dashboard/DeviceManagementPanel";
import { getMergedDevices } from "@/lib/devices/queries";

export const dynamic = "force-dynamic";

export default async function ManageDevicesPage() {
  const [{ devices, duplicateIds }, raw] = await Promise.all([
    getMergedDevices({ dedupe: true }),
    getMergedDevices({ dedupe: false })
  ]);

  return (
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
  );
}
