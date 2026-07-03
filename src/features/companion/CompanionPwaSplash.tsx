"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_KEY = "megacompanion_splash_seen";

export function CompanionPwaSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!standalone) return;
    if (sessionStorage.getItem(SPLASH_KEY) === "1") return;

    setVisible(true);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setVisible(false);
    }, 1100);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#000000] transition-opacity duration-300"
      aria-hidden="true"
    >
      <Image
        src="/assets/companion-splash-mark.png"
        alt=""
        width={520}
        height={520}
        priority
        className="h-[44vmin] w-[44vmin] max-h-[520px] max-w-[520px] object-contain"
      />
      <p className="mt-[3.4vmin] font-[family-name:var(--font-bricolage)] text-[6.2vmin] font-bold tracking-[0.06em] text-white">Compagnon</p>
    </div>
  );
}
