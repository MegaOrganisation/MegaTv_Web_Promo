import {
  COMPANION_BACKDROP_POSTER_PATHS,
  companionBackdropPosterSrc
} from "@/features/companion/liquid-glass/companionBackdropImages";

const columns: Array<{ direction: "up" | "down"; start: number; count: number; hidden?: "md" | "lg" }> = [
  { direction: "up", start: 0, count: 6 },
  { direction: "down", start: 6, count: 6 },
  { direction: "up", start: 12, count: 6, hidden: "md" },
  { direction: "down", start: 0, count: 6, hidden: "lg" }
];

function columnPosters(start: number, count: number) {
  const items = Array.from(
    { length: count },
    (_, index) => COMPANION_BACKDROP_POSTER_PATHS[(start + index) % COMPANION_BACKDROP_POSTER_PATHS.length]
  );
  return [...items, ...items];
}

export function CompanionPosterBackdrop() {
  return (
    <div className="companion-poster-backdrop" aria-hidden="true">
      <div className="companion-poster-columns">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={[
              "companion-poster-col",
              column.hidden === "md" ? "hidden md:block" : "",
              column.hidden === "lg" ? "hidden lg:block" : ""
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={column.direction === "up" ? "companion-poster-track-up" : "companion-poster-track-down"}>
              {columnPosters(column.start, column.count).map((path, index) => (
                <img
                  key={`${columnIndex}-${index}`}
                  src={companionBackdropPosterSrc(path)}
                  alt=""
                  loading="eager"
                  decoding="async"
                  crossOrigin="anonymous"
                  className="companion-poster-thumb"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="companion-poster-scrim" />
    </div>
  );
}
