"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useCompanionModal } from "@/features/companion/CompanionChromeContext";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function MobileModalOverlay({ open, onClose, children, className }: Props) {
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
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden overscroll-contain bg-black/75 p-3 backdrop-blur-sm sm:p-4 ${className || ""}`}
      style={{
        paddingTop: "max(0.75rem, var(--companion-mobile-header))",
        paddingBottom: "max(0.75rem, var(--companion-mobile-nav))"
      }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {children}
    </div>,
    document.body
  );
}
