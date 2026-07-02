import { NextResponse } from "next/server";

import { parseAdminPeriod, periodRange } from "@/lib/admin/period";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminDashboardData } from "@/lib/dashboard/queries";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(request: Request) {
  await requireAdmin();
  const days = parseAdminPeriod(new URL(request.url).searchParams.get("days"));
  const { from, to } = periodRange(days);
  const dashboard = await getAdminDashboardData(from, to);

  const lines: string[] = [];
  lines.push(`# MegaCompagnon admin export (${days}d)`);
  lines.push("section,key,value");
  const overview = (dashboard.overview || {}) as Record<string, unknown>;
  Object.entries(overview).forEach(([key, value]) => {
    lines.push(["overview", key, value].map(csvEscape).join(","));
  });

  lines.push("");
  lines.push("top_content,media_type,tmdb_id,title,user_count,watch_seconds");
  (dashboard.topContent as Array<Record<string, unknown>>).forEach((row) => {
    lines.push(
      ["top", row.media_type, row.tmdb_id, row.title, row.user_count, row.watch_seconds].map(csvEscape).join(",")
    );
  });

  lines.push("");
  lines.push("page_analytics,page,route,views,users,avg_duration_ms");
  (dashboard.pageAnalytics as Array<Record<string, unknown>>).forEach((row) => {
    lines.push(
      ["pages", row.page, row.route, row.views, row.users, row.avg_duration_ms].map(csvEscape).join(",")
    );
  });

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="megacompanion-admin-${days}d.csv"`
    }
  });
}
