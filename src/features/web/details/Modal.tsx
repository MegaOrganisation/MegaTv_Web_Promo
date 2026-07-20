"use client";

import type { ReactNode } from "react";

import { MegaDialog, type MegaDialogPresentation, type MegaDialogSize } from "@/features/web/MegaDialog";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible label for the dialog (screen readers). */
  label: string;
  children: ReactNode;
  /** Widens the panel for filmography grids / trailers. */
  size?: MegaDialogSize;
  presentation?: MegaDialogPresentation;
  className?: string;
  panelClassName?: string;
};

/** Accessible, portalled, themed modal (Escape + click-outside close). */
export function Modal({
  open,
  onClose,
  label,
  children,
  size = "md",
  presentation = "center",
  className,
  panelClassName
}: ModalProps) {
  return (
    <MegaDialog
      open={open}
      onClose={onClose}
      label={label}
      size={size}
      presentation={presentation}
      className={className}
      panelClassName={panelClassName}
    >
      {children}
    </MegaDialog>
  );
}
