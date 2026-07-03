"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useCompanionModal } from "@/features/companion/CompanionChromeContext";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function MobileModalSheet({ open, onClose, title, children }: Props) {
  const [mounted, setMounted] = useState(false);
  useCompanionModal(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col overscroll-contain lg:hidden" role="dialog" aria-modal="true">
      <button type="button" aria-label="Fermer" className="min-h-0 flex-1 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="shrink-0 overflow-y-auto overscroll-contain rounded-t-[28px] border border-[var(--mega-border)] bg-[var(--mega-surface)] shadow-[0_-24px_80px_-24px_rgba(0,0,0,0.75)]"
        style={{
          maxHeight: "min(78dvh, calc(100dvh - var(--companion-mobile-header) - var(--companion-mobile-nav)))",
          marginBottom: "var(--companion-mobile-nav)",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))"
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--mega-border)] bg-[var(--mega-surface)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--mega-text)]">{title || "Détails"}</p>
          <button type="button" onClick={onClose} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
