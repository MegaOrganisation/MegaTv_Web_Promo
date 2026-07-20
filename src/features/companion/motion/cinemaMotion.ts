/** Presets motion premium — transitions fluides sans blank frame. */

export const cinemaEase = [0.22, 1, 0.36, 1] as const;

export const cinemaSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.85
};

export const cinemaSpringSnappy = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.75
};

/** Crossfade soft — pas de mode wait (évite clignotement). */
export const pageEnter = {
  initial: { opacity: 0.35, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0.2, y: -6, filter: "blur(3px)" },
  transition: { duration: 0.38, ease: cinemaEase }
};

export const fadeUp = (index = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { ...cinemaSpring, delay: index * 0.05 }
});

export const hoverLift = {
  whileHover: { y: -4, scale: 1.02, transition: cinemaSpringSnappy },
  whileTap: { scale: 0.97, transition: { duration: 0.12 } }
};

export const pressScale = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.94, transition: { duration: 0.1 } }
};

export const iconTap = {
  whileHover: { scale: 1.08, transition: cinemaSpringSnappy },
  whileTap: { scale: 0.9, transition: { duration: 0.1 } }
};
