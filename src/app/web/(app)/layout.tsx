import type { ReactNode } from "react";

import { WebAppChrome } from "@/features/web/WebShellNav";

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return <WebAppChrome>{children}</WebAppChrome>;
}
