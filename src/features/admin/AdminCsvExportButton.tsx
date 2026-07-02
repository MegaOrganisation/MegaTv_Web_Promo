"use client";

import { Download } from "lucide-react";

import { MegaButton } from "@/components/ui/MegaButton";
import type { AdminPeriodDays } from "@/lib/admin/period";

export function AdminCsvExportButton({ days }: { days: AdminPeriodDays }) {
  return (
    <MegaButton variant="ghost" onClick={() => window.open(`/api/admin/export-csv?days=${days}`, "_blank")}>
      <Download className="h-4 w-4" />
      Export CSV
    </MegaButton>
  );
}
