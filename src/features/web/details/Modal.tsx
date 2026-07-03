"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible label for the dialog (screen readers). */
  label: string;
  children: ReactNode;
  /** Widens the panel for filmography grids / trailers. */
  size?: "sm" | "md" | "lg" | "trailer";
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-4xl",
  trailer: "max-w-3xl"
};

/** Accessible, portalled, themed modal (Escape + click-outside close). */
export function Modal({ open, onClose, label, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className={clsx(
          "relative my-auto w-full rounded-[24px] border border-[var(--mega-border)] bg-[var(--mega-surface)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]",
          SIZE_CLASS[size],
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="focus-ring absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-background-deep)]/70 text-[var(--mega-text)] backdrop-blur transition hover:bg-[var(--mega-card-bg)]"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
