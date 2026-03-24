import type { AlertLevel, FlightParams } from "../types";
import AttitudeIndicator from "./AttitudeIndicator";
import CircularGauge, { type GaugeZone } from "./CircularGauge";

interface FlightGaugesProps {
  params: FlightParams;
  onParamChange: (key: keyof FlightParams, value: number) => void;
}

const AMBER = "oklch(82% 0.155 78)";
const RED = "oklch(60% 0.225 25)";
const GREEN = "oklch(83% 0.185 155)";
const MUTED = "oklch(57% 0.015 215)";
const TEXT2 = "oklch(72% 0.013 215)";

function BarIndicator({
  value,
  min,
  max,
  label,
  unit,
  alertLevel,
  dataOcid,
  onValueChange,
}: {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  alertLevel: AlertLevel;
  dataOcid: string;
  onValueChange: (v: number) => void;
}) {
  const fraction = (value - min) / (max - min);
  const pct = (Math.max(0, Math.min(1, fraction)) * 100).toFixed(1);
  const barColor =
    alertLevel === "CRITICAL" ? RED : alertLevel === "CAUTION" ? AMBER : GREEN;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: MUTED }}
        >
          {label}
        </span>
        <span
          className="font-mono text-xs font-bold"
          style={{ color: barColor }}
        >
          {value} {unit}
        </span>
      </div>
      <div
        className="w-full h-3 rounded-full overflow-hidden"
        style={{ background: "oklch(18% 0.020 225)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: barColor,
          }}
        />
      </div>
      <input
        type="range"
        data-ocid={dataOcid}
        min={min}
        max={max}
        step={min < 0 ? 100 : 1}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className="w-full h-1 cursor-pointer"
        style={{ accentColor: barColor }}
      />
    </div>
  );
}

export default function FlightGauges({
  params,
  onParamChange,
}: FlightGaugesProps) {
  const pitch = Math.max(-45, Math.min(45, params.verticalSpeed / 100));

  const airspeedLevel: AlertLevel =
    params.airspeed > 450
      ? "CRITICAL"
      : params.airspeed < 80
        ? "CRITICAL"
        : "NORMAL";

  const rpmLevel: AlertLevel = params.engineRPM > 2800 ? "CAUTION" : "NORMAL";

  const fuelLevel: AlertLevel =
    params.fuelLevel < 10
      ? "CRITICAL"
      : params.fuelLevel < 25
        ? "CAUTION"
        : "NORMAL";

  const egtLevel: AlertLevel =
    params.egt > 850 ? "CRITICAL" : params.egt > 700 ? "CAUTION" : "NORMAL";

  const vsLevel: AlertLevel =
    params.verticalSpeed < -3000
      ? "CRITICAL"
      : params.verticalSpeed > 3000
        ? "CAUTION"
        : "NORMAL";

  const throttleLevel: AlertLevel = params.throttle > 95 ? "CAUTION" : "NORMAL";

  const airspeedZones: GaugeZone[] = [
    { upTo: 80, level: "CRITICAL" },
    { upTo: 350, level: "NORMAL" },
    { upTo: 450, level: "CAUTION" },
    { upTo: 500, level: "CRITICAL" },
  ];
  const rpmZones: GaugeZone[] = [
    { upTo: 2500, level: "NORMAL" },
    { upTo: 2800, level: "CAUTION" },
    { upTo: 3000, level: "CRITICAL" },
  ];
  const fuelZones: GaugeZone[] = [
    { upTo: 10, level: "CRITICAL" },
    { upTo: 25, level: "CAUTION" },
    { upTo: 100, level: "NORMAL" },
  ];
  const egtZones: GaugeZone[] = [
    { upTo: 700, level: "NORMAL" },
    { upTo: 850, level: "CAUTION" },
    { upTo: 1000, level: "CRITICAL" },
  ];

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-4"
      style={{
        background: "oklch(12.8% 0.022 225)",
        borderColor: "oklch(22% 0.027 220)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: AMBER }} />
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: MUTED }}
        >
          Live Instrument Cluster
        </span>
      </div>

      {/* Row 1: Airspeed | Attitude | Heading */}
      <div className="grid grid-cols-3 gap-2">
        <CircularGauge
          value={params.airspeed}
          min={0}
          max={500}
          unit="kts"
          label="Airspeed"
          alertLevel={airspeedLevel}
          zones={airspeedZones}
          onValueChange={(v) => onParamChange("airspeed", v)}
          step={5}
        />
        <AttitudeIndicator pitch={pitch} bank={0} />
        <CircularGauge
          value={params.heading}
          min={0}
          max={360}
          unit="°"
          label="Heading"
          alertLevel="NORMAL"
          onValueChange={(v) => onParamChange("heading", v)}
          step={5}
        />
      </div>

      {/* Row 2: RPM | Fuel | EGT */}
      <div className="grid grid-cols-3 gap-2">
        <CircularGauge
          value={params.engineRPM}
          min={0}
          max={3000}
          unit="RPM"
          label="Engine RPM"
          alertLevel={rpmLevel}
          zones={rpmZones}
          onValueChange={(v) => onParamChange("engineRPM", v)}
          step={50}
        />
        <CircularGauge
          value={params.fuelLevel}
          min={0}
          max={100}
          unit="%"
          label="Fuel Level"
          alertLevel={fuelLevel}
          zones={fuelZones}
          onValueChange={(v) => onParamChange("fuelLevel", v)}
          step={1}
        />
        <CircularGauge
          value={params.egt}
          min={0}
          max={1000}
          unit="°C"
          label="EGT"
          alertLevel={egtLevel}
          zones={egtZones}
          onValueChange={(v) => onParamChange("egt", v)}
          step={10}
        />
      </div>

      {/* Altitude readout */}
      <div
        className="rounded-lg px-3 py-2 flex items-center justify-between"
        style={{
          background: "oklch(18% 0.020 225)",
          border: "1px solid oklch(22% 0.027 220)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: MUTED }}
          >
            Altitude
          </span>
          <span
            className="font-mono text-lg font-bold"
            style={{ color: AMBER }}
          >
            {params.altitude.toLocaleString()} ft
          </span>
          <span className="font-mono text-sm" style={{ color: TEXT2 }}>
            FL
            {Math.round(params.altitude / 100)
              .toString()
              .padStart(3, "0")}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={45000}
          step={100}
          value={params.altitude}
          onChange={(e) => onParamChange("altitude", Number(e.target.value))}
          className="w-32 h-1 cursor-pointer"
          style={{ accentColor: AMBER }}
        />
      </div>

      {/* Throttle + Vertical Speed bars */}
      <div className="grid grid-cols-2 gap-4">
        <BarIndicator
          value={params.throttle}
          min={0}
          max={100}
          label="Throttle"
          unit="%"
          alertLevel={throttleLevel}
          dataOcid="gauge.throttle.toggle"
          onValueChange={(v) => onParamChange("throttle", v)}
        />
        <BarIndicator
          value={params.verticalSpeed}
          min={-6000}
          max={6000}
          label="Vertical Speed"
          unit="ft/min"
          alertLevel={vsLevel}
          dataOcid="gauge.vspeed.toggle"
          onValueChange={(v) => onParamChange("verticalSpeed", v)}
        />
      </div>
    </div>
  );
}
