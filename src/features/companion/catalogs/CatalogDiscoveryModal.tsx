"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { Loader2, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { MegaButton } from "@/components/ui/MegaButton";
import { MobileModalOverlay } from "@/components/ui/MobileModalOverlay";
import type { CatalogDiscoveryResult } from "@/app/api/catalogs/discover/route";

type Props = {
  open: boolean;
  existingUrls: string[];
  onClose: () => void;
  onConfirmAdd: (result: CatalogDiscoveryResult) => void;
};

export function CatalogDiscoveryModal({ open, existingUrls, onClose, onConfirmAdd }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogDiscoveryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<CatalogDiscoveryResult | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setPending(null);
    }
  }, [open]);

  async function search() {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setError("Saisissez au moins 2 caractères");
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/catalogs/discover?q=${encodeURIComponent(normalized)}`);
    const json = (await response.json()) as { results?: CatalogDiscoveryResult[]; error?: string | null };
    setLoading(false);
    setResults(json.results || []);
    setError(json.results?.length ? null : json.error || "Aucune liste trouvée");
  }

  if (!open) return null;

  const existing = new Set(existingUrls.map((url) => url.toLowerCase()));

  return (
    <MobileModalOverlay open={open} onClose={onClose}>
      <div className="relative flex max-h-full w-full max-w-3xl flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="mega-glass mega-lg-modal flex max-h-full w-full flex-col overflow-hidden rounded-[28px] border border-[var(--mega-border)]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--mega-border)] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id="catalog-discovery-title" className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">
              Ajouter un catalogue
            </h2>
            <p className="mt-1 text-xs text-[var(--mega-text-muted)] sm:text-sm">Recherche Trakt ou MDBList, comme dans l&apos;app MegaTv.</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-[var(--mega-border)] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && search()}
              placeholder="Nom de liste Trakt ou MDBList…"
              className="focus-ring min-h-11 flex-1 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-4 text-sm text-[var(--mega-text)] outline-none"
            />
            <MegaButton type="button" onClick={search} disabled={loading} className="shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Rechercher
            </MegaButton>
          </div>
          {error ? <p className="mt-3 text-sm text-[var(--mega-text-muted)]">{error}</p> : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {results.length === 0 && !loading ? (
            <p className="text-sm text-[var(--mega-text-faint)]">Les résultats apparaîtront ici.</p>
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                const alreadyAdded = existing.has(result.sourceUrl.toLowerCase());
                return (
                  <button
                    key={result.id}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => setPending(result)}
                    className={clsx(
                      "focus-ring flex w-full min-w-0 gap-3 rounded-[22px] border p-3 text-left transition",
                      alreadyAdded
                        ? "cursor-not-allowed border-[var(--mega-border)] opacity-50"
                        : "border-[var(--mega-border)] bg-[var(--mega-card-bg)] hover:border-[var(--mega-border-strong)]"
                    )}
                  >
                    <div className="flex shrink-0 gap-1">
                      {result.previewPosterUrls.length > 0 ? (
                        result.previewPosterUrls.slice(0, 3).map((poster, index) => (
                          <Image key={`${result.id}-${index}`} src={poster} alt="" width={42} height={63} unoptimized className="h-16 w-11 rounded-lg object-cover" />
                        ))
                      ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-xl border border-dashed border-[var(--mega-border)] text-[10px] text-[var(--mega-text-faint)]">
                          {result.sourceType}
                        </div>
                      )}
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[var(--mega-text)]">{result.title}</span>
                      <span className="mt-1 block truncate text-xs text-[var(--mega-text-muted)]">
                        {result.sourceType}
                        {result.creatorHandle ? ` · @${result.creatorHandle}` : ""}
                        {result.itemCount ? ` · ${result.itemCount} titres` : ""}
                      </span>
                      {result.description ? <span className="mt-1 line-clamp-2 text-xs text-[var(--mega-text-faint)]">{result.description}</span> : null}
                    </span>
                    <span className="shrink-0 self-center text-xs font-semibold text-[var(--mega-text-muted)]">{alreadyAdded ? "Ajouté" : "Choisir"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        </div>

        {pending ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-black/55 p-4 backdrop-blur-sm"
            onClick={() => setPending(null)}
          >
            <div className="mega-glass w-full max-w-md rounded-[24px] border border-[var(--mega-border)] p-5" onClick={(event) => event.stopPropagation()}>
              <h3 className="text-lg font-bold text-[var(--mega-text)]">Confirmer l&apos;ajout</h3>
              <p className="mt-2 text-sm text-[var(--mega-text-muted)]">
                Ajouter <strong>{pending.title}</strong> ({pending.sourceType}) à ce profil ?
              </p>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <MegaButton type="button" variant="ghost" onClick={() => setPending(null)}>
                  Annuler
                </MegaButton>
                <MegaButton
                  type="button"
                  onClick={() => {
                    onConfirmAdd(pending);
                    setPending(null);
                    onClose();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </MegaButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MobileModalOverlay>
  );
}
