import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

export function GlassCard({
  children,
  className,
  as: Component = "div",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; as?: "div" | "section" | "article" }) {
  return (
    <Component className={clsx("mega-glass rounded-[28px] p-5 sm:p-6", className)} {...props}>
      {children}
    </Component>
  );
}
