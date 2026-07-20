import type { SVGProps } from "react";

type IconName = "grid" | "bell" | "calendar" | "bolt" | "bookmark" | "home" | "settings" | "chart";

const paths: Record<IconName, React.ReactNode> = {
  grid: (
    <>
      <path d="M6 3.8 H8.6 Q10.8 3.8 10.8 6 V8.6 Q10.8 10.8 8.6 10.8 H6 Q3.8 10.8 3.8 8.6 V6 Q3.8 3.8 6 3.8 Z" />
      <path d="M15.4 3.8 H18 Q20.2 3.8 20.2 6 V8.6 Q20.2 10.8 18 10.8 H15.4 Q13.2 10.8 13.2 8.6 V6 Q13.2 3.8 15.4 3.8 Z" />
      <path d="M6 13.2 H8.6 Q10.8 13.2 10.8 15.4 V18 Q10.8 20.2 8.6 20.2 H6 Q3.8 20.2 3.8 18 V15.4 Q3.8 13.2 6 13.2 Z" />
      <path d="M15.4 13.2 H18 Q20.2 13.2 20.2 15.4 V18 Q20.2 20.2 18 20.2 H15.4 Q13.2 20.2 13.2 18 V15.4 Q13.2 13.2 15.4 13.2 Z" />
    </>
  ),
  bell: (
    <>
      <path d="M12 3.8 C8.5 3.8 6.3 6.5 6.3 9.9 L6.3 13 L4.9 15.9 C4.55 16.6 5.05 17.4 5.85 17.4 L18.15 17.4 C18.95 17.4 19.45 16.6 19.1 15.9 L17.7 13 L17.7 9.9 C17.7 6.5 15.5 3.8 12 3.8 Z" />
      <path d="M9.9 19.7 C10.3 20.5 11.05 21 12 21 C12.95 21 13.7 20.5 14.1 19.7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <path d="M6.6 5 H17.4 Q20.4 5 20.4 8 V17 Q20.4 20 17.4 20 H6.6 Q3.6 20 3.6 17 V8 Q3.6 5 6.6 5 Z M8 12.5 C8.55 12.5 9 12.95 9 13.5 C9 14.05 8.55 14.5 8 14.5 C7.45 14.5 7 14.05 7 13.5 C7 12.95 7.45 12.5 8 12.5 Z M12 12.5 C12.55 12.5 13 12.95 13 13.5 C13 14.05 12.55 14.5 12 14.5 C11.45 14.5 11 14.05 11 13.5 C11 12.95 11.45 12.5 12 12.5 Z M16 12.5 C16.55 12.5 17 12.95 17 13.5 C17 14.05 16.55 14.5 16 14.5 C15.45 14.5 15 14.05 15 13.5 C15 12.95 15.45 12.5 16 12.5 Z M8 16 C8.55 16 9 16.45 9 17 C9 17.55 8.55 18 8 18 C7.45 18 7 17.55 7 17 C7 16.45 7.45 16 8 16 Z M12 16 C12.55 16 13 16.45 13 17 C13 17.55 12.55 18 12 18 C11.45 18 11 17.55 11 17 C11 16.45 11.45 16 12 16 Z" />
      <path d="M8 3 H8 Q9 3 9 4 V5.4 Q9 6.4 8 6.4 H8 Q7 6.4 7 5.4 V4 Q7 3 8 3 Z M16 3 H16 Q17 3 17 4 V5.4 Q17 6.4 16 6.4 H16 Q15 6.4 15 5.4 V4 Q15 3 16 3 Z" />
    </>
  ),
  bolt: <path d="M13 2 L5 13 H11 L10 22 L19 10 H13 Z" />,
  bookmark: <path d="M6 4.2 H18 Q20 4.2 20 6.2 V19.8 L12 15.5 L4 19.8 V6.2 Q4 4.2 6 4.2 Z" />,
  home: <path d="M4 10.5 L12 4 L20 10.5 V18.5 Q20 20 18.5 20 H14.5 V14 H9.5 V20 H5.5 Q4 20 4 18.5 Z" />,
  settings: (
    <>
      <path d="M12 8.2 C9.9 8.2 8.2 9.9 8.2 12 C8.2 14.1 9.9 15.8 12 15.8 C14.1 15.8 15.8 14.1 15.8 12 C15.8 9.9 14.1 8.2 12 8.2 Z" />
      <path
        d="M12 3.8 L13.1 3.8 L13.6 5.4 L15.4 6 L16.8 5.1 L17.8 6.1 L16.9 7.5 L17.5 9.3 L19.1 9.8 V11 L17.5 11.5 L16.9 13.3 L17.8 14.7 L16.8 15.7 L15.4 14.8 L13.6 15.4 L13.1 17 L12 17 L11.5 15.4 L9.7 14.8 L8.3 15.7 L7.3 14.7 L8.2 13.3 L7.6 11.5 L6 11 V9.8 L7.6 9.3 L8.2 7.5 L7.3 6.1 L8.3 5.1 L9.7 6 L11.5 5.4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </>
  ),
  chart: <path d="M5 18 V10 H8 V18 Z M10 18 V6 H13 V18 Z M15 18 V13 H18 V18 Z" />
};

export function MegaTvIsoIcon({ name, className, ...props }: { name: IconName; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}
