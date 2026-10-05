"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem("megatv_cookie_consent");
      if (!accepted) {
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch (_) {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("megatv_cookie_consent", "true");
    } catch (_) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-3 sm:left-6 z-[9999] max-w-md w-[calc(100vw-24px)] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
      <div className="flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#0e111a]/95 backdrop-blur-2xl border border-white/14 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(63,154,230,0.2)] text-white">
        <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0 text-cyan-400">
          <Cookie size={17} />
        </div>
        <p className="text-xs sm:text-[13px] text-white/80 leading-snug">
          Ce site utilise des cookies pour garantir la synchronisation de votre session et la meilleure expérience.{" "}
          <Link href="/#legal" className="text-cyan-400 underline font-semibold hover:text-cyan-300">
            En savoir plus
          </Link>
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="px-4 py-2 rounded-full text-xs sm:text-[13px] font-extrabold text-white bg-gradient-to-r from-[#3f9ae6] via-[#1fa8a0] via-[#5fbf5a] via-[#f2b43c] via-[#ee6a54] to-[#d8497f] hover:opacity-95 shadow-[0_4px_15px_rgba(63,154,230,0.4)] shrink-0 transition-transform hover:scale-105 active:scale-95"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
