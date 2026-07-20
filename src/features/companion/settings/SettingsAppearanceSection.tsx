"use client";

import { Bolt, ImageIcon } from "lucide-react";

import { CompanionBackgroundPicker, QuickAccessSelector } from "@/features/companion/ui/CompanionBackgroundPicker";
import { MegaSurface } from "@/features/companion/ui/MegaSurface";
import { ThemeSelector } from "@/features/theme/ThemeSelector";

export function SettingsAppearanceSection({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <MegaSurface as="section" elevated className="mega-cinema-settings-grid__wide">
        <div className="mb-3 flex items-center gap-3">
          <div className="mega-metric-icon-wrap">
            <ImageIcon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="mega-cinema-display text-lg">Fond d&apos;écran</h2>
            <p className="mt-0.5 text-xs text-white/45">Change immédiatement l’ambiance — inclut Posters flous (portail Cloud).</p>
          </div>
        </div>
        <CompanionBackgroundPicker />
      </MegaSurface>

      <MegaSurface as="section" elevated>
        <div className="mb-3 flex items-center gap-3">
          <div className="mega-metric-icon-wrap">
            <Bolt className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="mega-cinema-display text-lg">Accès rapide (dock)</h2>
            <p className="mt-0.5 text-xs text-white/45">4ᵉ bouton barre gauche.</p>
          </div>
        </div>
        <QuickAccessSelector isAdmin={isAdmin} />
      </MegaSurface>

      <MegaSurface as="section" elevated>
        <div className="mb-3">
          <h2 className="mega-cinema-display text-lg">Thème clair / sombre</h2>
        </div>
        <ThemeSelector />
      </MegaSurface>
    </>
  );
}
