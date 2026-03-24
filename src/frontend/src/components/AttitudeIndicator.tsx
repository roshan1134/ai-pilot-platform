interface AttitudeIndicatorProps {
  pitch: number;
  bank: number;
}

export default function AttitudeIndicator({
  pitch,
  bank,
}: AttitudeIndicatorProps) {
  const displayPitch = Math.max(-45, Math.min(45, pitch));
  const horizonOffset = (displayPitch / 45) * 30;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative"
        style={{ filter: "drop-shadow(0 0 4px oklch(81% 0.130 182))" }}
      >
        <svg
          viewBox="0 0 120 120"
          width="110"
          height="110"
          aria-label="Attitude indicator instrument"
        >
          <title>Attitude Indicator</title>
          <defs>
            <clipPath id="adi-clip">
              <circle cx="60" cy="60" r="50" />
            </clipPath>
          </defs>

          <g clipPath="url(#adi-clip)" transform={`rotate(${bank}, 60, 60)`}>
            <rect
              x="0"
              y={0}
              width="120"
              height={60 + horizonOffset}
              fill="#1a3a5c"
            />
            <rect
              x="0"
              y={60 + horizonOffset}
              width="120"
              height={120 - (60 + horizonOffset)}
              fill="#5c3a1c"
            />
            <line
              x1="0"
              y1={60 + horizonOffset}
              x2="120"
              y2={60 + horizonOffset}
              stroke="white"
              strokeWidth="1.5"
              opacity="0.9"
            />
            {[-20, -10, 10, 20].map((deg) => {
              const y = 60 + horizonOffset - (deg / 45) * 30;
              const w = Math.abs(deg) === 20 ? 24 : 16;
              return (
                <g key={deg}>
                  <line
                    x1={60 - w}
                    y1={y}
                    x2={60 + w}
                    y2={y}
                    stroke="white"
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                  <text
                    x={60 + w + 3}
                    y={y + 2}
                    fill="white"
                    fontSize="5"
                    opacity="0.5"
                    fontFamily="monospace"
                  >
                    {Math.abs(deg)}
                  </text>
                </g>
              );
            })}
          </g>

          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="oklch(22% 0.027 220)"
            strokeWidth="2"
          />

          <g
            stroke="oklch(82% 0.155 78)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          >
            <line x1="30" y1="60" x2="50" y2="60" />
            <line x1="70" y1="60" x2="90" y2="60" />
            <circle
              cx="60"
              cy="60"
              r="3"
              fill="oklch(82% 0.155 78)"
              stroke="none"
            />
            <line x1="60" y1="55" x2="60" y2="50" />
          </g>

          <path
            d="M 20,60 A 40,40 0 0,1 100,60"
            fill="none"
            stroke="oklch(57% 0.015 215)"
            strokeWidth="1"
            opacity="0.5"
          />
          <polygon
            points="60,18 57,25 63,25"
            fill="oklch(82% 0.155 78)"
            transform={`rotate(${bank}, 60, 60)`}
          />
        </svg>
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "oklch(57% 0.015 215)" }}
      >
        Attitude
      </span>
      <div
        className="flex gap-2 text-[9px] font-mono"
        style={{ color: "oklch(57% 0.015 215)" }}
      >
        <span>
          P:{pitch > 0 ? "+" : ""}
          {pitch.toFixed(0)}\u00b0
        </span>
        <span>
          B:{bank > 0 ? "+" : ""}
          {bank.toFixed(0)}\u00b0
        </span>
      </div>
    </div>
  );
}
