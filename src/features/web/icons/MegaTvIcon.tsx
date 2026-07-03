import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Nav + common UI icons ported from the Android `ic_mega_*` vector drawables. */
export type MegaTvIconName =
  | "home"
  | "search"
  | "bookmark"
  | "tv"
  | "settings"
  | "logout"
  | "play"
  | "info"
  | "back";

type Props = {
  name: MegaTvIconName;
  /** Filled variant (active state), like MegaTVIcons.Filled / ic_mega_filled_* on Android. */
  filled?: boolean;
  className?: string;
  "aria-hidden"?: boolean;
};

function Svg({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("h-[1em] w-[1em] shrink-0", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function MegaTvIcon({ name, filled = false, className }: Props) {
  switch (name) {
    case "home":
      return filled ? (
        <Svg className={className}>
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10.11 5.08Q12 3.6 13.89 5.08L17.72 8.07Q19.3 9.3 19.14 11.29L18.57 18.31Q18.4 20.4 16.3 20.4H7.7Q5.6 20.4 5.43 18.31L4.86 11.29Q4.7 9.3 6.28 8.07Z M11.05 14.3H12.95V17.65H11.05Z"
          />
        </Svg>
      ) : (
        <Svg className={className}>
          <path
            d="M10.11 5.08Q12 3.6 13.89 5.08L17.72 8.07Q19.3 9.3 19.14 11.29L18.57 18.31Q18.4 20.4 16.3 20.4H7.7Q5.6 20.4 5.43 18.31L4.86 11.29Q4.7 9.3 6.28 8.07Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14.3H12Q12.95 14.3 12.95 15.25V17.65Q12.95 18.6 12 18.6H12Q11.05 18.6 11.05 17.65V15.25Q11.05 14.3 12 14.3Z"
            fill="currentColor"
          />
        </Svg>
      );

    case "search":
      return (
        <Svg className={className}>
          <path
            d="M11.3 3.8C15.11 3.8 18.2 6.89 18.2 10.7C18.2 14.51 15.11 17.6 11.3 17.6C7.49 17.6 4.4 14.51 4.4 10.7C4.4 6.89 7.49 3.8 11.3 3.8Z"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16.3 15.7L18.8 18.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    case "bookmark":
      return (
        <Svg className={className}>
          <path
            d="M7 4.5H17C17.6 4.5 18 4.9 18 5.5V19.7C18 20.2 17.4 20.5 17 20.2L12 16.5L7 20.2C6.6 20.5 6 20.2 6 19.7V5.5C6 4.9 6.4 4.5 7 4.5Z"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "tv":
      return (
        <Svg className={className}>
          <path
            d="M6.2 5H17.8Q20.6 5 20.6 7.8V14.8Q20.6 17.6 17.8 17.6H6.2Q3.4 17.6 3.4 14.8V7.8Q3.4 5 6.2 5Z"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8.5 21H15.5" stroke="currentColor" strokeWidth={filled ? 2.5 : 2.2} strokeLinecap="round" />
        </Svg>
      );

    case "settings":
      return filled ? (
        <Svg className={className}>
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M19.05 12.94C19.09 12.64 19.11 12.32 19.11 12C19.11 11.68 19.09 11.36 19.05 11.06L21.08 9.48C21.26 9.34 21.31 9.08 21.2 8.87L19.28 5.55C19.16 5.33 18.91 5.26 18.69 5.33L16.3 6.29C15.81 5.92 15.27 5.59 14.68 5.35L14.32 2.81C14.28 2.57 14.08 2.4 13.84 2.4H10C9.76 2.4 9.56 2.57 9.52 2.81L9.16 5.35C8.57 5.59 8.03 5.92 7.54 6.29L5.15 5.33C4.93 5.26 4.68 5.33 4.56 5.55L2.64 8.87C2.53 9.08 2.57 9.34 2.75 9.48L4.78 11.06C4.74 11.36 4.72 11.68 4.72 12C4.72 12.32 4.74 12.64 4.78 12.94L2.75 14.52C2.57 14.66 2.52 14.92 2.63 15.13L4.55 18.45C4.67 18.67 4.92 18.74 5.14 18.67L7.53 17.71C8.02 18.08 8.56 18.41 9.15 18.65L9.51 21.19C9.55 21.43 9.75 21.6 9.99 21.6H13.83C14.07 21.6 14.27 21.43 14.31 21.19L14.67 18.65C15.26 18.41 15.8 18.08 16.29 17.71L18.68 18.67C18.9 18.74 19.15 18.67 19.27 18.45L21.19 15.13C21.3 14.92 21.25 14.66 21.07 14.52ZM12 15.2A3.2 3.2 0 1 0 12 8.8A3.2 3.2 0 1 0 12 15.2Z"
          />
        </Svg>
      ) : (
        <Svg className={className}>
          <path
            d="M12 8.8A3.2 3.2 0 1 1 12 15.2A3.2 3.2 0 1 1 12 8.8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.05 12.94C19.09 12.64 19.11 12.32 19.11 12C19.11 11.68 19.09 11.36 19.05 11.06L21.08 9.48C21.26 9.34 21.31 9.08 21.2 8.87L19.28 5.55C19.16 5.33 18.91 5.26 18.69 5.33L16.3 6.29C15.81 5.92 15.27 5.59 14.68 5.35L14.32 2.81C14.28 2.57 14.08 2.4 13.84 2.4H10C9.76 2.4 9.56 2.57 9.52 2.81L9.16 5.35C8.57 5.59 8.03 5.92 7.54 6.29L5.15 5.33C4.93 5.26 4.68 5.33 4.56 5.55L2.64 8.87C2.53 9.08 2.57 9.34 2.75 9.48L4.78 11.06C4.74 11.36 4.72 11.68 4.72 12C4.72 12.32 4.74 12.64 4.78 12.94L2.75 14.52C2.57 14.66 2.52 14.92 2.63 15.13L4.55 18.45C4.67 18.67 4.92 18.74 5.14 18.67L7.53 17.71C8.02 18.08 8.56 18.41 9.15 18.65L9.51 21.19C9.55 21.43 9.75 21.6 9.99 21.6H13.83C14.07 21.6 14.27 21.43 14.31 21.19L14.67 18.65C15.26 18.41 15.8 18.08 16.29 17.71L18.68 18.67C18.9 18.74 19.15 18.67 19.27 18.45L21.19 15.13C21.3 14.92 21.25 14.66 21.07 14.52Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "logout":
      return (
        <Svg className={className}>
          <path d="M13 4.5H7.5C6.4 4.5 5.5 5.4 5.5 6.5V17.5C5.5 18.6 6.4 19.5 7.5 19.5H13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10.5 12H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M16.5 8.5L20 12L16.5 15.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case "play":
      return (
        <Svg className={className}>
          <path
            d="M8.5 6.2L17.2 11.4Q18.5 12.2 18.5 13.8Q18.5 15.4 17.2 16.2L8.5 21.4Q7 22.4 5.8 21.4Q4.6 20.4 4.6 18.8V9.8Q4.6 8.2 5.8 7.2Q7 6.2 8.5 6.2Z"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "info":
      return (
        <Svg className={className}>
          <path d="M12 16V12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M12 8.5H12.01" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <path
            d="M12 3.8C16.75 3.8 20.6 7.65 20.6 12.4C20.6 17.15 16.75 21 12 21C7.25 21 3.4 17.15 3.4 12.4C3.4 7.65 7.25 3.8 12 3.8Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "back":
      return (
        <Svg className={className}>
          <path d="M14.5 6.5L9 12L14.5 17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    default:
      return null;
  }
}
