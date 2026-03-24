import type { AlertLevel } from "../types";

export interface GaugeZone {
  upTo: number;
  level: AlertLevel;
}

interface CircularGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  zones?: GaugeZone[];
  alertLevel?: AlertLevel;
  onValueChange?: (v: number) => void;
  step?: number;
  decimals?: number;
}

const START_ANGLE = 135;
const SWEEP = 270;
const CX = 60;
const CY = 60;
const R_TRACK = 44;
const R_TICK_OUTER = 50;
const R_TICK_INNER = 45;

const TICK_ANGLES = Array.from(
  { length: 11 },
  (_, i) => START_ANGLE + (i / 10) * SWEEP,
);

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  sweepDeg: number,
): string {
  if (sweepDeg <= 0) return "";
  const clamped = Math.min(sweepDeg, 359.99);
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, startAngle + clamped);
  const largeArc = clamped > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const GREEN = "oklch(83% 0.185 155)";
const AMBER = "oklch(82% 0.155 78)";
const RED = "oklch(60% 0.225 25)";
const TRACK = "oklch(18% 0.020 225)";
const MUTED = "oklch(57% 0.015 215)";

function arcColor(level: AlertLevel): string {
  if (level === "CRITICAL") return RED;
  if (level === "CAUTION") return AMBER;
  return GREEN;
}

function computeLevel(value: number, zones?: GaugeZone[]): AlertLevel {
  if (!zones || zones.length === 0) return "NORMAL";
  for (const zone of zones) {
    if (value <= zone.upTo) return zone.level;
  }
  return zones[zones.length - 1].level;
}

export default function CircularGauge({
  value,
  min,
  max,
  unit,
  label,
  zones,
  alertLevel: alertLevelProp,
  onValueChange,
  step = 1,
  decimals = 0,
}: CircularGaugeProps) {
  const clampedVal = Math.max(min, Math.min(max, value));
  const fraction = (clampedVal - min) / (max - min);
  const valueSweep = fraction * SWEEP;
  const level = alertLevelProp ?? computeLevel(clampedVal, zones);
  const color = arcColor(level);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg
          viewBox="0 0 120 120"
          width="110"
          height="110"
          aria-label={`${label} gauge: ${value.toFixed(decimals)} ${unit}`}
        >
          <title>
            {label}: {value.toFixed(decimals)} {unit}
          </title>
          <path
            d={arcPath(CX, CY, R_TRACK, START_ANGLE, SWEEP)}
            fill="none"
            stroke={TRACK}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {valueSweep > 0 && (
            <path
              d={arcPath(CX, CY, R_TRACK, START_ANGLE, valueSweep)}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}
          {TICK_ANGLES.map((angleDeg, i) => {
            const outer = polar(CX, CY, R_TICK_OUTER, angleDeg);
            const inner = polar(CX, CY, R_TICK_INNER, angleDeg);
            const major = i % 5 === 0;
            return (
              <line
                key={angleDeg.toFixed(1)}
                x1={inner.x.toFixed(2)}
                y1={inner.y.toFixed(2)}
                x2={outer.x.toFixed(2)}
                y2={outer.y.toFixed(2)}
                stroke={MUTED}
                strokeWidth={major ? 1.5 : 0.8}
                opacity="0.6"
              />
            );
          })}
          <text
            x={CX}
            y={CY + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="16"
            fontWeight="700"
            fontFamily="'JetBrains Mono', monospace"
          >
            {value.toFixed(decimals)}
          </text>
          <text
            x={CX}
            y={CY + 18}
            textAnchor="middle"
            fill={MUTED}
            fontSize="7"
            fontFamily="'JetBrains Mono', monospace"
          >
            {unit}
          </text>
        </svg>
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: MUTED }}
      >
        {label}
      </span>
      {onValueChange && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="w-24 h-1 cursor-pointer"
          style={{ accentColor: color }}
        />
      )}
    </div>
  );
}
