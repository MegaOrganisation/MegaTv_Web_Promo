import type { ReactNode } from "react";

import { CompanionLiquidGlassRoot } from "@/features/companion/liquid-glass/CompanionLiquidGlassRoot";
import { CompanionPosterBackdrop } from "@/features/companion/liquid-glass/CompanionPosterBackdrop";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <CompanionLiquidGlassRoot>
      <div className="companion-auth-shell relative min-h-screen">
        <CompanionPosterBackdrop />
        <div className="relative z-[1]">{children}</div>
      </div>
    </CompanionLiquidGlassRoot>
  );
}
