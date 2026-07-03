import { WebSearch } from "@/features/web/WebSearch";

export const dynamic = "force-dynamic";

export default function WebSearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="px-1 text-2xl font-bold text-[var(--mega-text)]">Recherche</h1>
      <WebSearch />
    </div>
  );
}
