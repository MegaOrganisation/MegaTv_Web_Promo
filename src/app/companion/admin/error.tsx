"use client";

import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { MegaButton } from "@/components/ui/MegaButton";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--mega-background-deep)] px-4">
      <div className="mega-glass w-full max-w-lg rounded-[28px] border border-[var(--mega-border)] p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mega-text-faint)]">MegaCompagnon Admin</p>
        <h1 className="mt-3 text-2xl font-black text-[var(--mega-text)]">Vue admin indisponible</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--mega-text-muted)]">
          Le chargement a échoué. Vérifiez votre droit admin (`megacompanion_admins`) et les RPC `megacompanion_admin_*`.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <MegaButton type="button" onClick={reset}>
            Réessayer
          </MegaButton>
          <Link href="/companion" className="focus-ring inline-flex min-h-11 items-center rounded-full border border-[var(--mega-border)] px-4 text-sm font-semibold text-[var(--mega-text)]">
            Retour dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
