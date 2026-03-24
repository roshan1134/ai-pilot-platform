import type { FlightParams, FlightPhase, SystemAlert } from "./types";

function flightLevel(altitude: number): string {
  return `FL${Math.round(altitude / 100)
    .toString()
    .padStart(3, "0")}`;
}

export function generateChatResponse(
  pilotMessage: string,
  params: FlightParams,
  alerts: SystemAlert[],
  weather: string,
  phase: FlightPhase,
): string {
  const msg = pilotMessage.toLowerCase().trim();
  const criticals = alerts.filter((a) => a.level === "CRITICAL");
  const cautions = alerts.filter((a) => a.level === "CAUTION");

  if (msg.includes("mayday") || msg.includes("emergency")) {
    const critMsg =
      criticals.length > 0
        ? ` ${criticals[0].message.toUpperCase()}.`
        : " No additional critical conditions detected.";
    return `EMERGENCY PROTOCOL ENGAGED. Squawk 7700. Contact ATC on 121.5 MHz immediately.${critMsg} I am monitoring all systems. Fly the aircraft \u2014 aviate, navigate, communicate. Standing by.`;
  }

  if (msg.includes("divert") || msg.includes("alternate")) {
    const fuelSuffix =
      params.fuelLevel > 25
        ? "sufficient for diversion"
        : "MARGINAL \u2014 divert immediately";
    return `Diversion acknowledged. Current ${flightLevel(params.altitude)}, airspeed ${params.airspeed} kts. Fuel at ${params.fuelLevel.toFixed(0)}% \u2014 ${fuelSuffix}. Recommend declaring intentions to ATC and requesting vectors to nearest suitable alternate. Confirm diversion destination.`;
  }

  if (
    msg.includes("weather") ||
    msg.includes("wx") ||
    msg.includes("turbulence") ||
    msg.includes("storm")
  ) {
    const wxAdvisory: Record<string, string> = {
      Clear:
        "VFR conditions. No adverse weather in vicinity. Proceed as planned.",
      VMC: "Visual conditions maintained. Monitor ATIS for updates.",
      IMC: "IMC conditions \u2014 confirm IFR clearance is active. Maintain instrument scan. Request pireps from ATC.",
      Thunderstorm:
        "THUNDERSTORM ADVISORY \u2014 Recommend deviation 20nm minimum around cells. Contact ATC for weather avoidance vectors immediately.",
      Icing:
        "ICING CONDITIONS \u2014 Activate anti-ice systems now. Avoid prolonged exposure. Request altitude change if possible.",
      Turbulence:
        "TURBULENCE REPORTED \u2014 Reduce to turbulence penetration speed. Fasten seatbelts, secure cabin. Consider altitude change.",
    };
    const advisory =
      wxAdvisory[weather] ??
      "No specific weather advisory available. Monitor current conditions and ATIS.";
    return `Weather assessment for ${weather} conditions: ${advisory}`;
  }

  if (msg.includes("fuel")) {
    const fuelStatus =
      params.fuelLevel < 10
        ? "CRITICAL \u2014 divert immediately"
        : params.fuelLevel < 25
          ? "LOW \u2014 plan for alternate"
          : params.fuelLevel < 50
            ? "adequate, monitor consumption"
            : "nominal";
    return `Fuel status: ${params.fuelLevel.toFixed(0)}% \u2014 ${fuelStatus}. Current burn rate within normal parameters for ${phase} phase. Estimated fuel at destination depends on routing and winds aloft.`;
  }

  if (
    msg.includes("altitude") ||
    msg.includes("climb") ||
    msg.includes("descend")
  ) {
    const altStatus =
      params.altitude > 41000
        ? "CRITICAL \u2014 above service ceiling"
        : params.altitude > 35000
          ? "in upper flight levels, monitor pressurization"
          : "within normal operating range";
    const vsSign = params.verticalSpeed > 0 ? "+" : "";
    return `Current altitude ${flightLevel(params.altitude)} (${params.altitude.toLocaleString()} ft) \u2014 ${altStatus}. Vertical speed ${vsSign}${params.verticalSpeed} ft/min. All navigation systems tracking nominal.`;
  }

  if (
    msg.includes("speed") ||
    msg.includes("airspeed") ||
    msg.includes("throttle")
  ) {
    const speedNote =
      params.airspeed > 450
        ? "OVERSPEED \u2014 reduce throttle now"
        : params.airspeed < 120
          ? "Low speed advisory \u2014 monitor stall margins"
          : `Speed within normal envelope for ${phase} phase.`;
    const egtNote =
      params.egt > 850 ? "CRITICAL" : params.egt > 700 ? "ELEVATED" : "nominal";
    return `Current airspeed ${params.airspeed} kts, throttle at ${params.throttle}%. ${speedNote} EGT reading ${params.egt}\u00b0C \u2014 ${egtNote}.`;
  }

  if (
    msg.includes("status") ||
    msg.includes("systems") ||
    msg.includes("report")
  ) {
    const systemSummary =
      criticals.length > 0
        ? `${criticals.length} CRITICAL issue(s) require immediate attention: ${criticals.map((a) => a.message).join("; ")}.`
        : cautions.length > 0
          ? `${cautions.length} advisory item(s) noted: ${cautions.map((a) => a.message).join("; ")}.`
          : "All systems nominal.";
    return `Systems status report \u2014 Phase: ${phase}. ${flightLevel(params.altitude)}, ${params.airspeed} kts, HDG ${params.heading}\u00b0. Fuel: ${params.fuelLevel.toFixed(0)}%. EGT: ${params.egt}\u00b0C. ${systemSummary}`;
  }

  if (msg.includes("engine") || msg.includes("rpm") || msg.includes("egt")) {
    const engineNote =
      params.egt > 850
        ? "ENGINE OVERHEAT \u2014 reduce throttle immediately, consider engine failure checklist."
        : params.egt > 700
          ? "EGT elevated \u2014 reduce throttle 10% and monitor trend."
          : params.engineRPM > 2800
            ? "RPM high \u2014 reduce throttle for cruise efficiency."
            : "Powerplant operating within normal limits.";
    return `Engine status: RPM ${params.engineRPM}, EGT ${params.egt}\u00b0C, throttle ${params.throttle}%. ${engineNote}`;
  }

  if (
    msg.includes("heading") ||
    msg.includes("nav") ||
    msg.includes("navigation") ||
    msg.includes("course")
  ) {
    return `Navigation status \u2014 current heading ${params.heading}\u00b0, flight phase ${phase}. Autopilot tracking active. GPS signal nominal. Recommend cross-check with primary nav instruments at each waypoint.`;
  }

  if (
    msg.includes("ready") ||
    msg.includes("roger") ||
    msg.includes("copy") ||
    msg.includes("acknowledged")
  ) {
    const critNote =
      criticals.length > 0
        ? `Note: ${criticals.length} critical alert(s) active \u2014 review immediately.`
        : "No critical conditions. Proceeding as planned.";
    return `Acknowledged. Monitoring all systems. Current phase: ${phase}, ${flightLevel(params.altitude)}, ${params.airspeed} kts. ${critNote}`;
  }

  if (
    msg.includes("takeoff") ||
    msg.includes("departure") ||
    msg.includes("rotate")
  ) {
    const rpmNote =
      params.engineRPM < 1800
        ? "RPM below takeoff power \u2014 advance throttle."
        : "Engine power set for takeoff.";
    return `Takeoff checklist \u2014 Throttle: ${params.throttle}%, RPM: ${params.engineRPM}. ${rpmNote} Wind check: ${weather} conditions. Rotate at Vr, maintain Vy for best climb. Contact departure control passing 1,000 ft AGL.`;
  }

  if (
    msg.includes("landing") ||
    msg.includes("approach") ||
    msg.includes("final")
  ) {
    return `Approach advisory \u2014 descend to pattern altitude, reduce airspeed below Vfe before flap extension. Configure for landing: gear down, flaps set, checklist complete. Verify ATIS, altimeter set. Fuel ${params.fuelLevel.toFixed(0)}% \u2014 sufficient for missed approach if required.`;
  }

  const alertSummary =
    criticals.length > 0
      ? ` ATTENTION: ${criticals.map((a) => a.message.toUpperCase()).join("; ")}.`
      : cautions.length > 0
        ? ` Advisory: ${cautions[0].message}.`
        : " All systems nominal.";
  return `Message received.${alertSummary} Current state: ${phase} phase, ${flightLevel(params.altitude)}, ${params.airspeed} kts, HDG ${params.heading}\u00b0. Standing by for further instructions.`;
}
