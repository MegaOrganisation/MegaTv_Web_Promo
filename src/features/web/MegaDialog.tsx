"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import {
  megaDialogBackdrop,
  megaDialogPanel,
  megaSheetPanel,
  MEGA_DURATION,
  MEGA_EASE_APPLE
} from "@/features/web/motion/mega-motion";

export type MegaDialogSize = "sm" | "md" | "lg" | "trailer" | "fullscreen";
export type MegaDialogPresentation = "center" | "sheet";

type MegaDialogProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  size?: MegaDialogSize;
  presentation?: MegaDialogPresentation;
  className?: string;
  panelClassName?: string;
  showClose?: boolean;
};

const SIZE_CLASS: Record<MegaDialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-4xl",
  trailer: "max-w-3xl",
  fullscreen: "max-w-[1500px]"
};

/** Unified glass modal — Apple springs, dark/light tokens, sheet on mobile. */
export function MegaDialog({
  open,
  onClose,
  label,
  children,
  size = "md",
  presentation = "center",
  className,
  panelClassName,
  showClose = true
}: MegaDialogProps) {
  const reduceMotion = useReducedMotion();
  const isSheet = presentation === "sheet";

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

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mega-dialog-root"
          className={clsx(
            "mega-dialog-root fixed inset-0 z-[200] flex overscroll-contain",
            isSheet
              ? "items-end justify-center p-0 sm:items-center sm:p-4"
              : "items-start justify-center overflow-y-auto p-4 sm:items-center",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.button
            type="button"
            aria-label="Fermer"
            className="mega-dialog-scrim absolute inset-0"
            variants={reduceMotion ? undefined : megaDialogBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />

          <motion.div
            className={clsx(
              "mega-dialog-panel relative z-[1] my-auto flex w-full flex-col overflow-hidden",
              isSheet
                ? "max-h-[min(92vh,820px)] rounded-t-[var(--mega-dialog-radius)] sm:rounded-[var(--mega-dialog-radius)]"
                : "rounded-[var(--mega-dialog-radius)]",
              SIZE_CLASS[size],
              panelClassName
            )}
            variants={reduceMotion ? undefined : isSheet ? megaSheetPanel : megaDialogPanel}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(event) => event.stopPropagation()}
          >
            {showClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="focus-ring mega-dialog-close absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

/** Staggered list enter for modal grids (rail see-all, filmography). */
export function MegaDialogStaggerItem({
  children,
  index = 0,
  className
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MEGA_DURATION.standard,
        ease: MEGA_EASE_APPLE,
        delay: Math.min(index * 0.035, 0.28)
      }}
    >
      {children}
    </motion.div>
  );
}
