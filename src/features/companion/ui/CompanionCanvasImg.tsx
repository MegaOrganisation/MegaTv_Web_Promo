import type { ImgHTMLAttributes } from "react";

/**
 * Image Companion — CORS pour extraction couleur / canvas.
 * Same-origin `/api/tmdb/image` : crossOrigin anonyme OK (proxy public + ACAO *).
 */
export function CompanionCanvasImg({ crossOrigin = "anonymous", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img crossOrigin={crossOrigin} decoding="async" {...props} />;
}
