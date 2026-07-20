import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

export function GlassCard({
  children,
  className,
  as: Component = "div",
  elevated = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; as?: "div" | "section" | "article"; elevated?: boolean }) {
  return (
    <Component
      className={clsx(
        "mega-liquid-glass mega-liquid-glass-panel",
        elevated && "mega-liquid-glass-elevated",
        className
      )}
      {...props}
    >
      <div className="mega-liquid-glass-shimmer pointer-events-none" aria-hidden="true" />
      <div className="mega-liquid-glass-inner relative z-[1]">{children}</div>
    </Component>
  );
}
