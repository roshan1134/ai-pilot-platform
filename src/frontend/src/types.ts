export type FlightPhase =
  | "PREFLIGHT"
  | "TAKEOFF"
  | "CLIMB"
  | "CRUISE"
  | "DESCENT"
  | "APPROACH"
  | "LANDING";

export type AlertLevel = "NORMAL" | "CAUTION" | "CRITICAL";

export interface FlightParams {
  altitude: number; // ft, 0–45000
  airspeed: number; // knots, 0–500
  heading: number; // degrees, 0–360
  engineRPM: number; // RPM, 0–3000
  fuelLevel: number; // %, 0–100
  egt: number; // °C, 0–1000
  throttle: number; // %, 0–100
  verticalSpeed: number; // ft/min, -6000–6000
}

export interface ChatMessage {
  id: string;
  timestamp: Date;
  role: "pilot" | "ai";
  message: string;
  alertLevel?: AlertLevel;
}

export interface SystemAlert {
  system: string;
  level: AlertLevel;
  message: string;
}
