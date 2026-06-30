import { MonitorSmartphone } from "lucide-react";

import { formatDate } from "@/lib/format";
import type { DeviceRow } from "@/lib/supabase/types";

export function DeviceList({ devices }: { devices: DeviceRow[] }) {
  if (devices.length === 0) {
    return <p className="text-sm text-white/45">Aucun appareil synchronisé.</p>;
  }

  return (
    <div className="space-y-3">
      {devices.map((device) => (
        <div key={device.device_id} className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.035] p-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] text-white/65">
            <MonitorSmartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{device.display_name || device.default_label || device.model || "Appareil MegaTv"}</p>
            <p className="truncate text-xs text-white/38">
              {device.device_type || "unknown"} · {device.app_version || "version inconnue"}
            </p>
          </div>
          <div className="hidden text-right text-xs text-white/38 sm:block">
            {formatDate(device.last_seen_at)}
          </div>
        </div>
      ))}
    </div>
  );
}
