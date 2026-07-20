"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { clsx } from "clsx";

import { useCompanionModal } from "@/features/companion/CompanionChromeContext";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
};

/** Popup CSS glass FileSnap (WebGL réservé à la topbar). */
export function LiquidGlassPopup({ open, onClose, title, children, wide, className }: Props) {
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

  const panel = (
    <div className={clsx("companion-popup-lg companion-css-glass-panel", wide && "companion-popup-lg--wide", className)}>
      <div className="companion-popup-lg__body" onClick={(e) => e.stopPropagation()}>
        {title ? (
          <header className="companion-popup-lg__header">
            <h2>{title}</h2>
            <button type="button" className="focus-ring companion-popup-lg__close" onClick={onClose} aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </header>
        ) : null}
        <div className="companion-popup-lg__content">{children}</div>
      </div>
    </div>
  );

  return createPortal(
    <div className="companion-popup-scrim" role="dialog" aria-modal="true" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{panel}</div>
    </div>,
    document.body
  );
}
