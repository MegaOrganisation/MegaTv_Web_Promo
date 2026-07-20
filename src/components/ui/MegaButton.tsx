import Link from "next/link";
import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const baseClass =
  "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-[var(--brand-gold)] text-[#0c0e12] shadow-[0_12px_28px_-14px_rgba(242,180,60,0.75)] hover:-translate-y-0.5 hover:brightness-105",
  ghost: "border border-white/12 bg-white/[0.055] text-white hover:border-white/24 hover:bg-white/[0.09]",
  danger: "border border-red-400/30 bg-red-500/12 text-red-100 hover:bg-red-500/18"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
};

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: keyof typeof variants;
};

export function MegaButton({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={clsx(baseClass, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function MegaLink({ children, className, variant = "primary", href, ...props }: LinkProps) {
  return (
    <Link className={clsx(baseClass, variants[variant], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
