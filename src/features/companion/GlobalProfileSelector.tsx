"use client";

import { clsx } from "clsx";
import { Check, ChevronDown, UsersRound } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";

type MenuPlacement = "end" | "sidebar";

/**
 * Sélecteur profil — menu toujours en portal (body) pour éviter le clip
 * `overflow:hidden` de la topbar.
 */
export function GlobalProfileSelector({ menuPlacement = "end" }: { menuPlacement?: MenuPlacement }) {
  const { profiles, activeProfileId, activeProfile, setActiveProfileId } = useCompanionProfile();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuStyle(null);
      return;
    }
    const sync = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 288;
      if (menuPlacement === "sidebar") {
        setMenuStyle({ top: rect.top, left: rect.right + 12, width });
        return;
      }
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      setMenuStyle({ top: rect.bottom + 8, left, width });
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open, menuPlacement]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        const menu = document.getElementById("companion-profile-menu");
        if (menu?.contains(event.target as Node)) return;
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (profiles.length === 0) return null;

  const menu = (
    <div
      id="companion-profile-menu"
      role="listbox"
      aria-label="Sélection du profil"
      className="fixed z-[140] w-[min(92vw,18rem)] overflow-hidden rounded-[22px] border border-[var(--mega-border)] bg-[rgba(12,16,24,0.96)] p-2 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)] backdrop-blur-xl"
      style={
        menuStyle
          ? { top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }
          : { visibility: "hidden" }
      }
    >
      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--mega-text-faint)]">Filtrer par profil</p>
      <button
        type="button"
        role="option"
        aria-selected={!activeProfileId}
        onClick={() => {
          setActiveProfileId(null);
          setOpen(false);
        }}
        className={clsx(
          "focus-ring flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left transition",
          !activeProfileId ? "bg-[var(--mega-card-bg)]" : "hover:bg-[var(--mega-card-bg)]"
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#3f9ae6,#d8497f)] text-xs font-black text-white">T</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[var(--mega-text)]">Tous</span>
          <span className="block text-xs text-[var(--mega-text-faint)]">Vue compte complète</span>
        </span>
        {!activeProfileId ? <Check className="h-4 w-4 shrink-0 text-[var(--mega-text)]" /> : null}
      </button>
      {profiles.map((profile) => {
        const selected = activeProfileId === profile.profile_id;
        return (
          <button
            key={profile.profile_id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => {
              setActiveProfileId(profile.profile_id);
              setOpen(false);
            }}
            className={clsx(
              "focus-ring mt-1 flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left transition",
              selected ? "bg-[var(--mega-card-bg)]" : "hover:bg-[var(--mega-card-bg)]"
            )}
          >
            <PresetAvatarCircle avatarId={profile.avatar_id || 1} size="md" label={profile.name || "Profil"} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--mega-text)]">{profile.name || "Profil MegaTv"}</span>
              <span className="block truncate text-xs text-[var(--mega-text-faint)]">{profile.is_kids_profile ? "Enfant" : "Adulte"}</span>
            </span>
            {selected ? <Check className="h-4 w-4 shrink-0 text-[var(--mega-text)]" /> : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={activeProfile ? `Profil ${activeProfile.name}` : "Tous les profils"}
        onClick={() => setOpen((value) => !value)}
        className={clsx(
          "focus-ring relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition",
          open ? "border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)]" : "border-[var(--mega-border)] bg-[var(--mega-card-bg)] hover:border-[var(--mega-border-strong)]"
        )}
      >
        {activeProfile ? (
          <PresetAvatarCircle avatarId={activeProfile.avatar_id || 1} size="sm" label={activeProfile.name || "Profil"} className="!h-9 !w-9 !border-0 !p-0" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#3f9ae6,#d8497f)] text-sm font-black text-white">
            <UsersRound className="h-4 w-4" />
          </span>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] text-[var(--mega-text-muted)]">
          <ChevronDown className={clsx("h-3 w-3 transition", open && "rotate-180")} />
        </span>
      </button>

      {open && mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}
