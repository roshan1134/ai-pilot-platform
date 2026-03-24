import { getAlertLevelForSystem } from "../aiDecisionEngine";
import type { AlertLevel, SystemAlert } from "../types";

const SYSTEMS = [
  "Engines",
  "Weather",
  "Fuel Flow",
  "Autopilot",
  "Navigation",
  "Comms",
];

interface AlertPanelProps {
  alerts: SystemAlert[];
  weather: string;
}

const LEVEL_STYLES: Record<
  AlertLevel,
  { bg: string; color: string; label: string }
> = {
  NORMAL: {
    bg: "oklch(83% 0.185 155 / 15%)",
    color: "oklch(83% 0.185 155)",
    label: "NOMINAL",
  },
  CAUTION: {
    bg: "oklch(82% 0.155 78  / 15%)",
    color: "oklch(82% 0.155 78)",
    label: "ADVISORY",
  },
  CRITICAL: {
    bg: "oklch(60% 0.225 25  / 15%)",
    color: "oklch(60% 0.225 25)",
    label: "CRITICAL",
  },
};

export default function AlertPanel({ alerts, weather }: AlertPanelProps) {
  const weatherAlerts = [
    ...alerts,
    ...(weather === "Thunderstorm" || weather === "Icing"
      ? [
          {
            system: "Weather",
            level: "CRITICAL" as AlertLevel,
            message: weather,
          },
        ]
      : weather === "IMC" || weather === "Turbulence"
        ? [
            {
              system: "Weather",
              level: "CAUTION" as AlertLevel,
              message: weather,
            },
          ]
        : []),
  ];

  const criticalCount = weatherAlerts.filter(
    (a) => a.level === "CRITICAL",
  ).length;
  const cautionCount = weatherAlerts.filter(
    (a) => a.level === "CAUTION",
  ).length;

  return (
    <div
      className="rounded-xl border p-3 flex flex-col gap-2 flex-1 overflow-hidden"
      style={{
        background: "oklch(12.8% 0.022 225)",
        borderColor: "oklch(22% 0.027 220)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "oklch(57% 0.015 215)" }}
        >
          System Alerts
        </span>
        <div className="flex gap-1">
          {criticalCount > 0 && (
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded animate-pulse-critical"
              style={{
                background: "oklch(60% 0.225 25 / 20%)",
                color: "oklch(60% 0.225 25)",
                border: "1px solid oklch(60% 0.225 25 / 40%)",
              }}
            >
              {criticalCount} CRIT
            </span>
          )}
          {cautionCount > 0 && (
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{
                background: "oklch(82% 0.155 78 / 15%)",
                color: "oklch(82% 0.155 78)",
                border: "1px solid oklch(82% 0.155 78 / 30%)",
              }}
            >
              {cautionCount} ADV
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto">
        {SYSTEMS.map((sys, i) => {
          const level = getAlertLevelForSystem(sys, weatherAlerts);
          const s = LEVEL_STYLES[level];
          return (
            <div
              key={sys}
              data-ocid={`alerts.item.${i + 1}`}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg"
              style={{
                background: "oklch(18% 0.020 225)",
                border: "1px solid oklch(22% 0.027 220)",
              }}
            >
              <span
                className="text-xs font-mono"
                style={{ color: "oklch(72% 0.013 215)" }}
              >
                {sys}
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${level === "CRITICAL" ? "animate-pulse-critical" : ""}`}
                style={{
                  background: s.bg,
                  color: s.color,
                  border: `1px solid ${s.color}40`,
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
