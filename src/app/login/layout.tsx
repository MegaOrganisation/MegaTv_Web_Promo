import type { ReactNode } from "react";

import { CompanionLiquidGlassRoot } from "@/features/companion/liquid-glass/CompanionLiquidGlassRoot";
import { CompanionPosterBackdrop } from "@/features/companion/liquid-glass/CompanionPosterBackdrop";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <CompanionLiquidGlassRoot>
      <div className="companion-auth-shell relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto">
        <CompanionPosterBackdrop />
        <div className="relative z-[1] min-h-[100dvh] w-full flex flex-col">{children}</div>
      </div>
    </CompanionLiquidGlassRoot>
  );
}
