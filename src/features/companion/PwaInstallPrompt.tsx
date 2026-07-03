"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { MegaButton } from "@/components/ui/MegaButton";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt({ embedded = false }: { embedded?: boolean }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const media = window.matchMedia("(display-mode: standalone)");
    setInstalled(media.matches);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (installed) {
    return <p className="text-sm text-[var(--mega-text-muted)]">MegaCompagnon est déjà installé sur cet appareil.</p>;
  }

  if (!deferred || hidden) {
    return (
      <p className="text-sm leading-6 text-[var(--mega-text-muted)]">
        Sur Chrome ou Edge mobile : menu du navigateur → « Ajouter à l&apos;écran d&apos;accueil ». Sur iOS Safari : partager → « Sur l&apos;écran d&apos;accueil ».
      </p>
    );
  }

  if (embedded) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--mega-text-muted)]">Bannière d&apos;installation disponible pour cet appareil.</p>
        <MegaButton
          type="button"
          variant="ghost"
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setHidden(true);
          }}
        >
          <Download className="h-4 w-4" />
          Installer
        </MegaButton>
      </div>
    );
  }

  return null;
}
