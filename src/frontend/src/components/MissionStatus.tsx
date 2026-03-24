import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlightPhase } from "../types";

const PHASES: FlightPhase[] = [
  "PREFLIGHT",
  "TAKEOFF",
  "CLIMB",
  "CRUISE",
  "DESCENT",
  "APPROACH",
  "LANDING",
];

const WEATHER_OPTIONS = [
  "Clear",
  "VMC",
  "IMC",
  "Thunderstorm",
  "Icing",
  "Turbulence",
];

interface MissionStatusProps {
  phase: FlightPhase;
  destination: string;
  weather: string;
  altitude: number;
  onPhaseChange: (p: FlightPhase) => void;
  onDestinationChange: (d: string) => void;
  onWeatherChange: (w: string) => void;
}

export default function MissionStatus({
  phase,
  destination,
  weather,
  altitude,
  onPhaseChange,
  onDestinationChange,
  onWeatherChange,
}: MissionStatusProps) {
  const flightLevel = `FL${Math.round(altitude / 100)
    .toString()
    .padStart(3, "0")}`;

  function handleDestFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "oklch(82% 0.155 78)";
  }
  function handleDestBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "oklch(22% 0.027 220)";
  }

  return (
    <div
      className="rounded-xl border p-3 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: "oklch(12.8% 0.022 225)",
        borderColor: "oklch(22% 0.027 220)",
      }}
    >
      {/* Decorative world map */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        viewBox="0 0 260 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Decorative world map</title>
        <ellipse cx="70" cy="80" rx="35" ry="28" fill="oklch(92% 0.010 215)" />
        <ellipse cx="130" cy="75" rx="45" ry="32" fill="oklch(92% 0.010 215)" />
        <ellipse cx="195" cy="85" rx="30" ry="20" fill="oklch(92% 0.010 215)" />
        <ellipse cx="80" cy="130" rx="20" ry="25" fill="oklch(92% 0.010 215)" />
        <ellipse
          cx="210"
          cy="110"
          rx="18"
          ry="22"
          fill="oklch(92% 0.010 215)"
        />
        <path
          d="M 50,90 Q 130,50 210,95"
          stroke="oklch(82% 0.155 78)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 3"
          opacity="0.8"
        />
        <circle cx="50" cy="90" r="3" fill="oklch(83% 0.185 155)" />
        <circle cx="210" cy="95" r="3" fill="oklch(82% 0.155 78)" />
      </svg>

      {/* Header */}
      <div className="flex items-center gap-2 relative z-10">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: "oklch(83% 0.185 155)",
            boxShadow: "0 0 6px oklch(83% 0.185 155)",
          }}
        />
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "oklch(57% 0.015 215)" }}
        >
          Mission Status
        </span>
      </div>

      {/* Flight level + ETA */}
      <div className="flex justify-between relative z-10">
        <div>
          <div
            className="font-mono font-bold text-xl"
            style={{ color: "oklch(82% 0.155 78)" }}
          >
            {flightLevel}
          </div>
          <div
            className="text-[10px] uppercase tracking-wide"
            style={{ color: "oklch(57% 0.015 215)" }}
          >
            Flight Level
          </div>
        </div>
        <div className="text-right">
          <div
            className="font-mono font-bold text-xl"
            style={{ color: "oklch(92% 0.010 215)" }}
          >
            2H 14M
          </div>
          <div
            className="text-[10px] uppercase tracking-wide"
            style={{ color: "oklch(57% 0.015 215)" }}
          >
            ETA
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className="relative z-10">
        <label
          htmlFor="destination-input"
          className="block text-[10px] uppercase tracking-widest mb-1"
          style={{ color: "oklch(57% 0.015 215)" }}
        >
          Destination
        </label>
        <input
          id="destination-input"
          data-ocid="mission.input"
          type="text"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value.toUpperCase())}
          placeholder="ICAO (e.g. KJFK)"
          maxLength={4}
          onFocus={handleDestFocus}
          onBlur={handleDestBlur}
          className="w-full rounded-lg px-3 py-1.5 text-sm font-mono outline-none transition-colors"
          style={{
            background: "oklch(8.2% 0.013 230)",
            border: "1px solid oklch(22% 0.027 220)",
            color: "oklch(92% 0.010 215)",
          }}
        />
      </div>

      {/* Weather */}
      <div className="relative z-10">
        <label
          htmlFor="weather-select"
          className="block text-[10px] uppercase tracking-widest mb-1"
          style={{ color: "oklch(57% 0.015 215)" }}
        >
          Weather
        </label>
        <Select value={weather} onValueChange={onWeatherChange}>
          <SelectTrigger
            id="weather-select"
            data-ocid="mission.select"
            className="w-full text-xs font-mono h-8"
            style={{
              background: "oklch(8.2% 0.013 230)",
              border: "1px solid oklch(22% 0.027 220)",
              color: "oklch(92% 0.010 215)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              background: "oklch(12.8% 0.022 225)",
              border: "1px solid oklch(22% 0.027 220)",
            }}
          >
            {WEATHER_OPTIONS.map((w) => (
              <SelectItem key={w} value={w} className="text-xs font-mono">
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Flight Phase */}
      <div className="relative z-10">
        <p
          className="text-[10px] uppercase tracking-widest mb-1.5"
          style={{ color: "oklch(57% 0.015 215)" }}
        >
          Flight Phase
        </p>
        <div className="flex flex-wrap gap-1">
          {PHASES.map((p) => {
            const active = phase === p;
            return (
              <button
                key={p}
                type="button"
                data-ocid="mission.tab"
                onClick={() => onPhaseChange(p)}
                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wide transition-all"
                style={{
                  background: active
                    ? "oklch(82% 0.155 78 / 25%)"
                    : "oklch(18% 0.020 225)",
                  color: active
                    ? "oklch(82% 0.155 78)"
                    : "oklch(57% 0.015 215)",
                  border: active
                    ? "1px solid oklch(82% 0.155 78 / 60%)"
                    : "1px solid oklch(22% 0.027 220)",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
