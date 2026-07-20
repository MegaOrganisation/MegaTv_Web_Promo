"use client";

import { clsx } from "clsx";
import type { SVGProps } from "react";

export type MegaTvIconName =
  | "home"
  | "bookmark"
  | "cloud"
  | "people"
  | "settings"
  | "search"
  | "bell"
  | "calendar"
  | "cast"
  | "chart"
  | "lock"
  | "tv"
  | "grid"
  | "shield";

type Props = SVGProps<SVGSVGElement> & {
  name: MegaTvIconName;
  size?: number;
  /** Actif dock = blanc plein. */
  filled?: boolean;
};

/** Icônes MegaTv — outline par défaut, filled blanc plein si `filled`. */
export function MegaTvIcon({ name, size = 20, filled = false, className, ...rest }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    className: clsx("shrink-0", className),
    ...rest
  };

  const stroke = filled ? undefined : "currentColor";
  const fill = filled ? "currentColor" : undefined;
  const sw = filled ? 0 : 2.2;

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          {filled ? (
            <>
              <path
                d="M12 3.2 L20.4 10.2 V20.2 C20.4 20.8 19.9 21.2 19.3 21.2 H14.2 V14.6 H9.8 V21.2 H4.7 C4.1 21.2 3.6 20.8 3.6 20.2 V10.2 Z"
                fill="currentColor"
              />
            </>
          ) : (
            <>
              <path
                d="M10.11 5.08 Q12 3.6 13.89 5.08 L17.72 8.07 Q19.3 9.3 19.14 11.29 L18.57 18.31 Q18.4 20.4 16.3 20.4 L7.7 20.4 Q5.6 20.4 5.43 18.31 L4.86 11.29 Q4.7 9.3 6.28 8.07 Z"
                stroke="currentColor"
                strokeWidth={2.2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 14.3 H12 Q12.95 14.3 12.95 15.25 V17.65 Q12.95 18.6 12 18.6 H12 Q11.05 18.6 11.05 17.65 V15.25 Q11.05 14.3 12 14.3 Z"
                fill="currentColor"
              />
            </>
          )}
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path
            d="M7 4.5 L17 4.5 C17.6 4.5 18 4.9 18 5.5 L18 19.7 C18 20.2 17.4 20.5 17 20.2 L12 16.5 L7 20.2 C6.6 20.5 6 20.2 6 19.7 L6 5.5 C6 4.9 6.4 4.5 7 4.5 Z"
            stroke={filled ? undefined : "currentColor"}
            strokeWidth={filled ? undefined : 2.2}
            fill={filled ? "currentColor" : "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path
            d="M7.2 18.6 C4.6 18.6 2.4 16.5 2.4 13.9 C2.4 11.6 4.1 9.6 6.4 9.2 C7.2 6.6 9.6 4.7 12.4 4.7 C15.5 4.7 18 7 18.4 10 C20.4 10.4 21.8 12.2 21.8 14.3 C21.8 16.7 19.8 18.6 17.4 18.6 Z"
            stroke={stroke}
            strokeWidth={sw || undefined}
            fill={fill || "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8.3" r="3" stroke={stroke} strokeWidth={sw || undefined} fill={fill || "none"} />
          <path
            d="M3.8 19.6 C4.2 15.8 6.2 13.8 9 13.8 C11.8 13.8 13.8 15.8 14.2 19.6"
            stroke={stroke || "currentColor"}
            strokeWidth={filled ? 2.4 : 2.2}
            fill={filled ? "currentColor" : "none"}
            strokeLinecap="round"
          />
          <circle cx="15.8" cy="7.6" r="2.4" stroke={stroke} strokeWidth={sw || undefined} fill={fill || "none"} />
          {!filled ? (
            <path d="M16.2 13.9 C18.6 14.2 20.2 16 20.4 18.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          ) : null}
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path
            d="M19.05 12.94 C19.09 12.64 19.11 12.32 19.11 12 C19.11 11.68 19.09 11.36 19.05 11.06 L21.08 9.48 C21.26 9.34 21.31 9.08 21.2 8.87 L19.28 5.55 C19.16 5.33 18.91 5.26 18.69 5.33 L16.3 6.29 C15.81 5.92 15.27 5.59 14.68 5.35 L14.32 2.81 C14.28 2.57 14.08 2.4 13.84 2.4 H10 C9.76 2.4 9.56 2.57 9.52 2.81 L9.16 5.35 C8.57 5.59 8.03 5.92 7.54 6.29 L5.15 5.33 C4.93 5.26 4.68 5.33 4.56 5.55 L2.64 8.87 C2.53 9.08 2.57 9.34 2.75 9.48 L4.78 11.06 C4.74 11.36 4.72 11.68 4.72 12 C4.72 12.32 4.74 12.64 4.78 12.94 L2.75 14.52 C2.57 14.66 2.52 14.92 2.63 15.13 L4.55 18.45 C4.67 18.67 4.92 18.74 5.14 18.67 L7.53 17.71 C8.02 18.08 8.56 18.41 9.15 18.65 L9.51 21.19 C9.55 21.43 9.75 21.6 9.99 21.6 H13.83 C14.07 21.6 14.27 21.43 14.31 21.19 L14.67 18.65 C15.26 18.41 15.8 18.08 16.29 17.71 L18.68 18.67 C18.9 18.74 19.15 18.67 19.27 18.45 L21.19 15.13 C21.3 14.92 21.25 14.66 21.07 14.52 Z"
            stroke={stroke}
            strokeWidth={sw || undefined}
            fill={fill || "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3.2" fill={filled ? "#10191C" : "none"} stroke={filled ? undefined : "currentColor"} strokeWidth={filled ? undefined : 2.2} opacity={filled ? 0.35 : 1} />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11.3" cy="10.7" r="6.9" stroke={stroke || "currentColor"} strokeWidth={filled ? 2.4 : 2.2} fill={filled ? "currentColor" : "none"} />
          <path d="M16.3 15.7 L18.8 18.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path
            d="M12 3.8 C8.5 3.8 6.3 6.5 6.3 9.9 L6.3 13 L4.9 15.9 C4.55 16.6 5.05 17.4 5.85 17.4 L18.15 17.4 C18.95 17.4 19.45 16.6 19.1 15.9 L17.7 13 L17.7 9.9 C17.7 6.5 15.5 3.8 12 3.8 Z"
            stroke={stroke}
            strokeWidth={sw || undefined}
            fill={fill || "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9.9 19.7 C10.3 20.5 11.05 21 12 21 C12.95 21 13.7 20.5 14.1 19.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          {filled ? (
            <>
              <path
                d="M6.6 4.2 H17.4 C19.6 4.2 21 5.6 21 7.8 V17.4 C21 19.6 19.6 21 17.4 21 H6.6 C4.4 21 3 19.6 3 17.4 V7.8 C3 5.6 4.4 4.2 6.6 4.2 Z"
                fill="currentColor"
              />
              <path d="M5 9 H19 V10.4 H5 Z" fill="#10191C" opacity="0.35" />
              <path d="M8 2.8 V5.6 M16 2.8 V5.6" stroke="#10191C" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
            </>
          ) : (
            <>
              <path
                d="M6.6 5 H17.4 Q20.4 5 20.4 8 V17 Q20.4 20 17.4 20 H6.6 Q3.6 20 3.6 17 V8 Q3.6 5 6.6 5 Z"
                stroke="currentColor"
                strokeWidth={2.2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M3.6 9.5 L20.4 9.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M8 3.3 L8 6.3 M16 3.3 L16 6.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    case "cast":
      return (
        <svg {...common}>
          <path d="M5 5.5 L18.5 5.5 C19.6 5.5 20.5 6.4 20.5 7.5 L20.5 16.5 C20.5 17.6 19.6 18.5 18.5 18.5 L15 18.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.6 12 C6.6 12 9 14.4 9 17.4 M3.6 8.4 C8.6 8.4 12.6 12.4 12.6 17.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="4" cy="17.2" r="1" fill="currentColor" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19 V5 M4 19 H20 M8 15 V11 M12 15 V8 M16 15 V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <path d="M7 11 V8.5 C7 6 9 4 12 4 C15 4 17 6 17 8.5 V11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M6 11 H18 C19.1 11 20 11.9 20 13 V18 C20 19.1 19.1 20 18 20 H6 C4.9 20 4 19.1 4 18 V13 C4 11.9 4.9 11 6 11 Z"
            stroke={stroke}
            strokeWidth={sw || undefined}
            fill={fill || "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "tv":
      return (
        <svg {...common}>
          <path
            d="M4 7 H20 C21.1 7 22 7.9 22 9 V17 C22 18.1 21.1 19 20 19 H4 C2.9 19 2 18.1 2 17 V9 C2 7.9 2.9 7 4 7 Z"
            stroke={stroke}
            strokeWidth={sw || undefined}
            fill={fill || "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 22 L16 22 M12 19 V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke={stroke} strokeWidth={sw || undefined} fill={fill || "none"} />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke={stroke} strokeWidth={sw || undefined} fill={fill || "none"} />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke={stroke} strokeWidth={sw || undefined} fill={fill || "none"} />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke={stroke} strokeWidth={sw || undefined} fill={fill || "none"} />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path
            d="M12 3 L19 6 V11.5 C19 16 15.5 19.2 12 20.5 C8.5 19.2 5 16 5 11.5 V6 Z"
            stroke={stroke}
            strokeWidth={sw || undefined}
            fill={fill || "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
