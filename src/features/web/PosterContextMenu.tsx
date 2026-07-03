"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Play, Info, Bookmark, Check } from "lucide-react";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { WebMediaItem } from "@/lib/web/media";

type MenuAction = {
  label: string;
  icon: typeof Play;
  href: string;
  primary?: boolean;
};

/**
 * Cursor-anchored quick-action popup for posters (web equivalent of the mobile
 * long-press menu). Rendered in a portal, fixed at the click point, closes on
 * outside click / Escape / scroll.
 *
 * Free Tier: watchlist / "vu" actions do NOT perform ad-hoc Supabase writes
 * (that would break batched sync). Until a batched client mutation exists they
 * route to the details page, where those actions live.
 */
export function PosterContextMenu({
  item,
  x,
  y,
  onClose
}: {
  item: WebMediaItem;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const { withProfile } = useWebProfile();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const details = withProfile(`/web/details/${item.mediaId}`);
  const actions: MenuAction[] = [
    { label: "Lire", icon: Play, href: withProfile(`/web/player/${item.mediaId}`), primary: true },
    { label: "Détails", icon: Info, href: details },
    { label: "Ajouter à ma liste", icon: Bookmark, href: details },
    { label: "Marquer comme vu", icon: Check, href: details }
  ];

  // Measure once mounted and clamp the menu inside the viewport.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const pad = 8;
    const nx = Math.min(x, window.innerWidth - rect.width - pad);
    const ny = Math.min(y, window.innerHeight - rect.height - pad);
    setPos({ x: Math.max(pad, nx), y: Math.max(pad, ny) });
  }, [x, y]);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  // Render at the raw cursor point first (pos === null), then snap to the clamped
  // position once measured. Hidden until measured to avoid a visible jump.
  const style: CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { left: x, top: y, visibility: "hidden" };

  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={style}
      className="mega-glass web-poster-in fixed z-[200] min-w-56 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
    >
      <p className="line-clamp-1 px-3 pb-1.5 pt-2 text-xs font-semibold text-[var(--mega-text-muted)]">{item.title}</p>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          role="menuitem"
          onClick={() => go(action.href)}
          className={clsx(
            "focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
            action.primary
              ? "font-semibold text-[var(--mega-text)] hover:bg-[var(--mega-card-bg)]"
              : "text-[var(--mega-text-muted)] hover:bg-[var(--mega-card-bg)] hover:text-[var(--mega-text)]"
          )}
        >
          <action.icon className="h-4 w-4 shrink-0" fill={action.primary ? "currentColor" : "none"} />
          {action.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
