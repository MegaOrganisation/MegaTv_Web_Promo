"use client";

import { Tv } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { iptvLogoProxyUrl } from "@/lib/web/iptv-logo";

/** IPTV logos — proxied same-origin (hotlink / UA blocks on raw playlist hosts). */
export function IptvChannelLogo({
  src,
  className,
  fallback
}: {
  src: string | null;
  className?: string;
  fallback?: ReactNode;
}) {
  const displaySrc = iptvLogoProxyUrl(src);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [displaySrc]);

  if (!displaySrc || broken) {
    return <>{fallback ?? <Tv className="h-5 w-5 text-[var(--mega-text-faint)]" />}</>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className || "h-full w-full object-contain"}
      onError={() => setBroken(true)}
    />
  );
}
