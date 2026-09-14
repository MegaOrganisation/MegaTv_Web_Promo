"use client";

import type { ReactNode } from "react";

import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { AdminTabs } from "@/features/admin/AdminTabs";

export function AdminLayoutChrome({ children }: { children: ReactNode }) {
  return (
    <ResponsiveShell title="Admin" subtitle="Ops MegaTv Cloud" isAdmin showRail={false} hidePageHeader>
      <AdminTabs />
      {children}
    </ResponsiveShell>
  );
}
