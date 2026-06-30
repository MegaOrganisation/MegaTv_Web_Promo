"use client";

import { clsx } from "clsx";
import { Loader2, MonitorSmartphone, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { MegaButton } from "@/components/ui/MegaButton";
import { formatDate } from "@/lib/format";
import type { DeviceRow } from "@/lib/supabase/types";

type Props = {
  devices: DeviceRow[];
};

export function DeviceManagementPanel({ devices }: Props) {
  const router = useRouter();
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.device_id || "");
  const selectedDevice = devices.find((device) => device.device_id === selectedDeviceId) || devices[0] || null;
  const [namesByDeviceId, setNamesByDeviceId] = useState<Record<string, string>>(() => Object.fromEntries(devices.map((device) => [device.device_id, device.display_name || ""])));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceName = useMemo(() => {
    if (!selectedDevice) return "";
    return namesByDeviceId[selectedDevice.device_id] ?? selectedDevice.display_name ?? "";
  }, [namesByDeviceId, selectedDevice]);

  if (devices.length === 0 || !selectedDevice) {
    return <p className="text-sm text-white/45">Aucun appareil synchronisé.</p>;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDevice) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/devices/${encodeURIComponent(selectedDevice.device_id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: deviceName })
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Renommage de l'appareil impossible.");
      return;
    }

    setMessage("Appareil mis à jour.");
    router.refresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-3">
        {devices.map((device) => {
          const active = device.device_id === selectedDevice.device_id;
          return (
            <button
              key={device.device_id}
              type="button"
              onClick={() => {
                setSelectedDeviceId(device.device_id);
                setMessage(null);
                setError(null);
              }}
              className={clsx(
                "focus-ring flex w-full items-center gap-3 rounded-[22px] border p-3 text-left transition",
                active ? "border-white/24 bg-white/12" : "border-white/8 bg-white/[0.035] hover:bg-white/[0.06]"
              )}
            >
              <DeviceIcon active={active} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">{device.display_name || device.default_label || device.model || "Appareil MegaTv"}</span>
                <span className="mt-1 block truncate text-xs text-white/42">{device.device_type || "unknown"} · {formatDate(device.last_seen_at)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="rounded-[26px] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <DeviceIcon active className="h-16 w-16 rounded-[24px]" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/38">Appareil sélectionné</p>
            <h3 className="mt-1 truncate text-2xl font-black text-white">{selectedDevice.display_name || selectedDevice.default_label || selectedDevice.model || "Appareil MegaTv"}</h3>
            <p className="mt-1 text-sm text-white/45">{selectedDevice.manufacturer || "Fabricant inconnu"} · {selectedDevice.model || "modèle inconnu"}</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-white/70">Nom affiché</span>
          <input
            value={deviceName}
            onChange={(event) => {
              setMessage(null);
              setError(null);
              setNamesByDeviceId((current) => ({ ...current, [selectedDevice.device_id]: event.target.value }));
            }}
            maxLength={60}
            className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/22 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/28"
            placeholder={selectedDevice.default_label || selectedDevice.model || "Appareil MegaTv"}
          />
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Info label="Type" value={selectedDevice.device_type || "unknown"} />
          <Info label="Version app" value={selectedDevice.app_version || "version inconnue"} />
          <Info label="Première connexion" value={formatDate(selectedDevice.first_seen_at)} />
          <Info label="Dernière activité" value={formatDate(selectedDevice.last_seen_at)} />
        </div>

        <p className="mt-5 rounded-2xl border border-white/10 bg-black/18 p-4 text-xs leading-5 text-white/42">
          Le schéma MegaTv Cloud actuel ne stocke pas de couleur ou photo pour les appareils. Côté web, seule la modification du nom est donc activée pour rester compatible avec l'app Android.
        </p>

        {message ? <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/8 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/8 px-4 py-3 text-sm text-red-100">{error}</p> : null}

        <div className="mt-6 flex justify-end">
          <MegaButton type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </MegaButton>
        </div>
      </form>
    </div>
  );
}

function DeviceIcon({ active, className }: { active: boolean; className?: string }) {
  return (
    <span className={clsx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl border", active ? "border-white/20 bg-white/12 text-white" : "border-white/8 bg-white/[0.055] text-white/58", className)}>
      <MonitorSmartphone className="h-5 w-5" />
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white/70">{value}</p>
    </div>
  );
}
