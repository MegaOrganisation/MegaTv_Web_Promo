"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-[#06070a] text-[#ededed]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">MegaCompagnon</p>
            <h1 className="mt-3 text-2xl font-black">Une erreur est survenue</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">L&apos;incident a été signalé à Sentry. Vous pouvez réessayer.</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex min-h-11 items-center rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
