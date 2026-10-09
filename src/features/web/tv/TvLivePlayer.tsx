"use client";

import { clsx } from "clsx";
import { ArrowUpRight, Maximize, Minimize, PictureInPicture2, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Spinner } from "@/features/web/Spinner";
import type { IptvChannel } from "@/lib/web/iptv-channels";

type Props = {
  channel: IptvChannel;
  subtitle?: string | null;
  onClose: () => void;
  isPiP?: boolean;
  onTogglePiP?: () => void;
  onExpand?: () => void;
};

function streamType(url: string): "hls" | "file" | "other" {
  if (/\.m3u8(\?|$)/i.test(url)) return "hls";
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return "file";
  return "other";
}

/**
 * Embedded live player for `/web/tv`. Instantiated ONLY on channel select
 * (mirrors the Android "Optimisé" rule: no player while browsing the grid).
 * Live streams have no seek bar; controls are mute + fullscreen.
 *
 * CORS: plays streams the browser can reach directly. MPEG-TS (`.ts`) live
 * feeds and CORS-blocked origins need the Edge remux/proxy — deferred to P3.
 */
export function TvLivePlayer({ channel, subtitle, onClose, isPiP = false, onTogglePiP, onExpand }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  // Raw MPEG-TS / unknown container: not playable natively in-browser. A remux
  // (TS → fMP4) is out of scope (needs a transcoder, not a proxy).
  const unsupported = streamType(channel.url) === "other";

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // On a fatal (often CORS) HLS error we retry once through the signed Edge proxy.
  // The parent remounts this component per channel (key={channel.id}), so this
  // state resets naturally on channel change — no reset effect needed.
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const triedProxyRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || unsupported) return;

    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;

    const activeUrl = proxyUrl || channel.url;

    const retryViaProxy = async () => {
      if (triedProxyRef.current) {
        setError("Flux indisponible ou bloqué (CORS).");
        return;
      }
      triedProxyRef.current = true;
      try {
        const res = await fetch(`/api/web/stream-proxy/sign?url=${encodeURIComponent(channel.url)}`);
        const json = await res.json();
        if (json?.ok && json.url) setProxyUrl(json.url as string);
        else setError("Flux indisponible ou bloqué (CORS).");
      } catch {
        setError("Flux indisponible ou bloqué (CORS).");
      }
    };

    async function attach() {
      if (!video) return;
      const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
      if (streamType(channel.url) === "file" || canNativeHls) {
        video.src = activeUrl;
        setReady(true);
        void video.play().catch(() => undefined);
        return;
      }
      try {
        const mod = await import("hls.js");
        const Hls = mod.default;
        if (destroyed) return;
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(activeUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setReady(true);
            void video.play().catch(() => undefined);
          });
          hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal?: boolean }) => {
            if (data?.fatal) void retryViaProxy();
          });
        } else {
          video.src = activeUrl;
          setReady(true);
        }
      } catch {
        setError("Moteur de lecture indisponible.");
      }
    }

    void attach();
    return () => {
      destroyed = true;
      if (hls) hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel.url, unsupported, proxyUrl]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else shell.requestFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div
      ref={shellRef}
      className={clsx(
        "group/player relative aspect-video w-full overflow-hidden bg-black",
        isPiP ? "rounded-none" : "rounded-2xl border border-[var(--mega-border)]"
      )}
    >
      <video ref={videoRef} className="h-full w-full bg-black object-contain" playsInline autoPlay />

      {!ready && !error && !unsupported ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Spinner size={isPiP ? "sm" : "lg"} />
        </div>
      ) : null}

      {error || unsupported ? (
        <div className="absolute inset-0 grid place-items-center bg-black/75 p-4 text-center">
          <p className="max-w-sm text-xs font-medium text-white/90">
            {error || "Ce flux MPEG-TS brut n'est pas lisible en navigateur. Les flux HLS/mp4 sont supportés."}
          </p>
        </div>
      ) : null}

      {/* Top gradient: channel identity + PiP actions */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-[linear-gradient(180deg,rgba(0,0,0,0.7),transparent)] p-2.5 sm:p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mega-red)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Live
            </span>
            <p className={clsx("truncate font-semibold text-white", isPiP ? "text-xs" : "text-sm")}>
              {channel.name}
            </p>
          </div>
          {subtitle && !isPiP ? (
            <p className="mt-0.5 truncate text-[11px] text-white/60">{subtitle}</p>
          ) : null}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          {isPiP && onExpand ? (
            <button
              type="button"
              onClick={onExpand}
              aria-label="Agrandir le lecteur"
              title="Agrandir le lecteur"
              className="focus-ring grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/80"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le lecteur"
            title="Fermer"
            className={clsx(
              "focus-ring grid place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/80",
              isPiP ? "h-7 w-7" : "h-8 w-8"
            )}
          >
            <X className={isPiP ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        </div>
      </div>

      {/* Bottom gradient: quick controls */}
      <div
        className={clsx(
          "absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-[linear-gradient(0deg,rgba(0,0,0,0.65),transparent)] p-2.5 transition-opacity",
          isPiP
            ? "opacity-90 group-hover/player:opacity-100"
            : "opacity-0 group-hover/player:opacity-100 focus-within:opacity-100"
        )}
      >
        {!isPiP && onTogglePiP ? (
          <button
            type="button"
            onClick={onTogglePiP}
            aria-label="Basculer en mini-lecteur PiP"
            title="Mode mini-lecteur (PiP)"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <PictureInPicture2 className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          title={muted ? "Activer le son" : "Couper le son"}
          className={clsx(
            "focus-ring grid place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20",
            isPiP ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          {muted ? (
            <VolumeX className={isPiP ? "h-3.5 w-3.5" : "h-4 w-4"} />
          ) : (
            <Volume2 className={isPiP ? "h-3.5 w-3.5" : "h-4 w-4"} />
          )}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Plein écran"
          title="Plein écran"
          className={clsx(
            "focus-ring grid place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20",
            isPiP ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          {fullscreen ? (
            <Minimize className={isPiP ? "h-3.5 w-3.5" : "h-4 w-4"} />
          ) : (
            <Maximize className={isPiP ? "h-3.5 w-3.5" : "h-4 w-4"} />
          )}
        </button>
      </div>
    </div>
  );
}
