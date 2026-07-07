"use client";

import { Tv } from "lucide-react";
import { useState } from "react";

/** IPTV logos come from arbitrary hosts — native img + no-referrer (Next/Image allowlist is TMDB-only). */
export function IptvChannelLogo({ src, className }: { src: string | null; className?: string }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return <Tv className="h-5 w-5 text-[var(--mega-text-faint)]" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className || "h-full w-full object-contain"}
      onError={() => setBroken(true)}
    />
  );
}
