import type {
  AlertLevel,
  FlightParams,
  FlightPhase,
  SystemAlert,
} from "./types";

export interface DecisionResult {
  alerts: SystemAlert[];
  criticalMessage: string | null;
}

export function analyzeFlightParams(
  params: FlightParams,
  phase: FlightPhase,
): DecisionResult {
  const alerts: SystemAlert[] = [];
  let criticalMessage: string | null = null;

  // ── Altitude ──────────────────────────────────────────
  if (params.altitude > 41000) {
    alerts.push({
      system: "Altitude",
      level: "CRITICAL",
      message: "Above service ceiling",
    });
    criticalMessage = "ALTITUDE CRITICAL — Descend immediately to FL350";
  } else if (
    params.altitude < 1000 &&
    (phase === "CRUISE" || phase === "DESCENT")
  ) {
    alerts.push({
      system: "Altitude",
      level: "CAUTION",
      message: "Low altitude in cruise/descent",
    });
  }

  // ── Airspeed ──────────────────────────────────────────
  if (params.airspeed > 450) {
    alerts.push({
      system: "Airspeed",
      level: "CRITICAL",
      message: "Overspeed condition",
    });
    if (!criticalMessage)
      criticalMessage = "OVERSPEED — Reduce throttle immediately";
  } else if (
    params.airspeed < 80 &&
    (phase === "CRUISE" || phase === "CLIMB")
  ) {
    alerts.push({
      system: "Airspeed",
      level: "CRITICAL",
      message: "Approaching stall speed",
    });
    if (!criticalMessage)
      criticalMessage = "STALL WARNING — Increase airspeed immediately";
  }

  // ── EGT ───────────────────────────────────────────────
  if (params.egt > 850) {
    alerts.push({
      system: "Engines",
      level: "CRITICAL",
      message: "Engine overheat",
    });
    if (!criticalMessage)
      criticalMessage = "ENGINE OVERHEAT — Reduce throttle, monitor EGT";
  } else if (params.egt > 700) {
    alerts.push({
      system: "Engines",
      level: "CAUTION",
      message: "EGT elevated",
    });
  }

  // ── Fuel ──────────────────────────────────────────────
  if (params.fuelLevel < 10) {
    alerts.push({
      system: "Fuel Flow",
      level: "CRITICAL",
      message: "Fuel critically low",
    });
    if (!criticalMessage)
      criticalMessage = "FUEL CRITICAL — Divert to nearest airport immediately";
  } else if (params.fuelLevel < 25) {
    alerts.push({
      system: "Fuel Flow",
      level: "CAUTION",
      message: "Fuel level low",
    });
  }

  // ── RPM ───────────────────────────────────────────────
  if (params.engineRPM > 2800) {
    alerts.push({
      system: "Engines",
      level: "CAUTION",
      message: "RPM high",
    });
  }

  // ── Vertical Speed ────────────────────────────────────
  if (params.verticalSpeed < -3000) {
    alerts.push({
      system: "Navigation",
      level: "CRITICAL",
      message: "Excessive sink rate",
    });
    if (!criticalMessage) criticalMessage = "SINK RATE — Pull up immediately";
  } else if (params.verticalSpeed > 3000) {
    alerts.push({
      system: "Navigation",
      level: "CAUTION",
      message: "High climb rate",
    });
  }

  // ── Throttle in cruise ────────────────────────────────
  if (params.throttle > 95 && phase === "CRUISE") {
    alerts.push({
      system: "Autopilot",
      level: "CAUTION",
      message: "Throttle at maximum in cruise",
    });
  }

  return { alerts, criticalMessage };
}

export function getAlertLevelForSystem(
  system: string,
  alerts: SystemAlert[],
): AlertLevel {
  const match = alerts.find(
    (a) =>
      a.system.toLowerCase() === system.toLowerCase() ||
      system.toLowerCase().includes(a.system.toLowerCase()) ||
      a.system.toLowerCase().includes(system.toLowerCase()),
  );
  return match?.level ?? "NORMAL";
}
