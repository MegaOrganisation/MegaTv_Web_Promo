/** True for daily Top 10 catalog rails — mirrors Android `CatalogConfig.isTop10Catalog()`. */
export function isTop10Catalog(catalog: { id?: string; title?: string; sourceUrl?: string | null }): boolean {
  const id = (catalog.id || "").toLowerCase();
  if (id.includes("top10")) return true;
  const title = (catalog.title || "").toLowerCase();
  if (title.includes("top 10")) return true;
  const url = (catalog.sourceUrl || "").toLowerCase();
  return url.includes("top-10");
}
