"use client";

import { clsx } from "clsx";
import { Loader2, MonitorSmartphone, Save, Trash2, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { MegaButton } from "@/components/ui/MegaButton";
import { formatDate } from "@/lib/format";
import type { MergedDevice } from "@/lib/devices/queries";

type Props = {
  devices: MergedDevice[];
  duplicateCount?: number;
};

export function DeviceManagementPanel({ devices, duplicateCount = 0 }: Props) {
  const router = useRouter();
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.device_id || "");
  const selectedDevice = devices.find((device) => device.device_id === selectedDeviceId) || devices[0] || null;
  const [namesByDeviceId, setNamesByDeviceId] = useState<Record<string, string>>(() =>
    Object.fromEntries(devices.map((device) => [device.device_id, device.display_name || ""]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNamesByDeviceId(Object.fromEntries(devices.map((device) => [device.device_id, device.display_name || ""])));
    if (!devices.some((device) => device.device_id === selectedDeviceId)) {
      setSelectedDeviceId(devices[0]?.device_id || "");
    }
  }, [devices, selectedDeviceId]);

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

  async function removeDevice() {
    if (!selectedDevice) return;
    if (!window.confirm("Supprimer cet appareil du compte cloud ?")) return;

    setIsSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/devices/${encodeURIComponent(selectedDevice.device_id)}`, { method: "DELETE" });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(body.error || "Suppression impossible.");
      return;
    }

    setMessage("Appareil supprimé.");
    router.refresh();
  }

  async function cleanupDuplicates() {
    setIsCleaning(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/devices/cleanup-duplicates", { method: "POST" });
    const body = (await response.json().catch(() => ({}))) as { error?: string; removed?: number };
    setIsCleaning(false);

    if (!response.ok) {
      setError(body.error || "Nettoyage impossible.");
      return;
    }

    setMessage(body.removed ? `${body.removed} doublon(s) supprimé(s).` : "Aucun doublon détecté.");
    router.refresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="max-h-[min(70vh,720px)] space-y-3 overflow-y-auto pr-1">
        {duplicateCount > 0 ? (
          <div className="rounded-[22px] border border-yellow-300/20 bg-yellow-300/8 p-3 text-xs text-yellow-100">
            {duplicateCount} doublon(s) masqué(s) par fabricant/modèle/libellé.{" "}
            <button type="button" className="font-semibold underline" onClick={cleanupDuplicates} disabled={isCleaning}>
              {isCleaning ? "Nettoyage…" : "Nettoyer le cloud"}
            </button>
          </div>
        ) : null}
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
              <DeviceIcon active={active} online={device.is_online} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-white">
                  {device.display_name || device.default_label || device.model || "Appareil MegaTv"}
                </span>
                <span className="mt-1 block truncate text-xs text-white/42">
                  {device.is_online ? "En ligne" : "Hors ligne"} · {device.device_type || "unknown"} · {formatDate(device.last_seen_at)}
                  {device.duplicate_count ? ` · ×${device.duplicate_count}` : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="rounded-[26px] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <DeviceIcon active online={selectedDevice.is_online} className="h-16 w-16 rounded-[24px]" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/38">Appareil sélectionné</p>
            <h3 className="mt-1 truncate text-2xl font-black text-white">
              {selectedDevice.display_name || selectedDevice.default_label || selectedDevice.model || "Appareil MegaTv"}
            </h3>
            <p className="mt-1 text-sm text-white/45">
              {selectedDevice.is_online ? "En ligne" : "Hors ligne"} · {selectedDevice.manufacturer || "Fabricant inconnu"} · {selectedDevice.model || "modèle inconnu"}
            </p>
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
          <Info label="Dernière activité" value={formatDate(selectedDevice.last_app_active_at || selectedDevice.last_seen_at)} />
        </div>

        {message ? <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/8 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/8 px-4 py-3 text-sm text-red-100">{error}</p> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <MegaButton type="button" variant="ghost" onClick={removeDevice} disabled={isSaving}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </MegaButton>
          <MegaButton type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </MegaButton>
        </div>
      </form>
    </div>
  );
}

function DeviceIcon({ active, online, className }: { active: boolean; online?: boolean; className?: string }) {
  return (
    <span
      className={clsx(
        "relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border",
        active ? "border-white/20 bg-white/12 text-white" : "border-white/8 bg-white/[0.055] text-white/58",
        className
      )}
    >
      <MonitorSmartphone className="h-5 w-5" />
      <span
        className={clsx(
          "absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border",
          online ? "border-emerald-300/30 bg-emerald-500/20 text-emerald-100" : "border-white/12 bg-black/70 text-white/45"
        )}
      >
        {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      </span>
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
