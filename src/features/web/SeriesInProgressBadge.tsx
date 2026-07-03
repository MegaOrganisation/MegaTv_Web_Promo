/** White progress ring + play icon — parity with Android `SeriesInProgressBadge`. */
export function SeriesInProgressBadge({
  progressPercent,
  size = 38,
  className
}: {
  progressPercent: number;
  size?: number;
  className?: string;
}) {
  const progress = Math.min(100, Math.max(0, Math.round(progressPercent)));
  const stroke = size * 0.075 + 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);
  const inner = Math.max(size * 0.35, size - stroke * 2);

  return (
    <div className={`relative ${className ?? ""}`} style={{ width: size, height: size }} aria-hidden>
      <div
        className="absolute left-1/2 top-1/2 rounded-full bg-black/60 backdrop-blur-sm"
        style={{ width: inner, height: inner, transform: "translate(-50%, -50%)" }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-[1]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.58)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {progress > 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
        <polygon
          points={`${size * 0.38},${size * 0.28} ${size * 0.38},${size * 0.72} ${size * 0.68},${size * 0.5}`}
          fill="white"
        />
      </svg>
    </div>
  );
}
