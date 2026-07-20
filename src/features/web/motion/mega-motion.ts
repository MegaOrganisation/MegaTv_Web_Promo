import type { Transition, Variants } from "motion/react";

/** Apple-like snappy spring — nav chips, poster hover, micro-interactions. */
export const MEGA_SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.82
};

/** Gentle spring — modals, hero metadata, layout shifts. */
export const MEGA_SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 30,
  mass: 1
};

/** Layout / poster expand width transitions. */
export const MEGA_SPRING_LAYOUT: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 36,
  mass: 0.92
};

export const MEGA_EASE_APPLE = [0.25, 0.1, 0.25, 1] as const;

export const MEGA_DURATION = {
  micro: 0.18,
  standard: 0.32,
  emphasis: 0.42,
  exit: 0.22
} as const;

export const megaFadeUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MEGA_DURATION.standard, ease: MEGA_EASE_APPLE }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: MEGA_DURATION.exit, ease: MEGA_EASE_APPLE }
  }
};

export const megaDialogBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: MEGA_DURATION.micro } },
  exit: { opacity: 0, transition: { duration: MEGA_DURATION.exit } }
};

export const megaDialogPanel: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 18 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: MEGA_SPRING_GENTLE
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 12,
    transition: { duration: MEGA_DURATION.exit, ease: MEGA_EASE_APPLE }
  }
};

export const megaSheetPanel: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: {
    opacity: 1,
    y: 0,
    transition: MEGA_SPRING_GENTLE
  },
  exit: {
    opacity: 0,
    y: "18%",
    transition: { duration: MEGA_DURATION.standard, ease: MEGA_EASE_APPLE }
  }
};

export const megaHeroCrossfade: Variants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: MEGA_DURATION.emphasis, ease: MEGA_EASE_APPLE }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: { duration: MEGA_DURATION.standard, ease: MEGA_EASE_APPLE }
  }
};
