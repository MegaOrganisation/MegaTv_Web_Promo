import type { ReactNode } from "react";

import { RouteTransition } from "@/features/web/RouteTransition";
import { WebShellNav } from "@/features/web/WebShellNav";

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <WebShellNav />
      <main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pl-24 lg:pr-8">
        <RouteTransition>{children}</RouteTransition>
      </main>
    </div>
  );
}
