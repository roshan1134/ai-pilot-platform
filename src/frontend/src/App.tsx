import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeFlightParams } from "./aiDecisionEngine";
import { generateChatResponse } from "./chatResponseGenerator";
import AlertPanel from "./components/AlertPanel";
import ChatPanel from "./components/ChatPanel";
import DecisionLog from "./components/DecisionLog";
import FlightGauges from "./components/FlightGauges";
import MissionStatus from "./components/MissionStatus";
import PhaseChatPanel from "./components/PhaseChatPanel";
import PilotCommsPanel from "./components/PilotCommsPanel";
import RadarPanel from "./components/RadarPanel";
import TopNav from "./components/TopNav";
import { useActor } from "./hooks/useActor";
import type {
  ChatMessage,
  FlightParams,
  FlightPhase,
  SystemAlert,
} from "./types";

const DEFAULT_PARAMS: FlightParams = {
  altitude: 35000,
  airspeed: 420,
  heading: 270,
  engineRPM: 2200,
  fuelLevel: 68,
  egt: 650,
  throttle: 78,
  verticalSpeed: 200,
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const { actor } = useActor();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [flightParams, setFlightParams] =
    useState<FlightParams>(DEFAULT_PARAMS);
  const [flightPhase, setFlightPhase] = useState<FlightPhase>("CRUISE");
  const [destination, setDestination] = useState("KJFK");
  const [weather, setWeather] = useState("Clear");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [sessionId, setSessionId] = useState<bigint | null>(null);

  const actorRef = useRef(actor);
  const sessionIdRef = useRef(sessionId);
  const prevCriticalCount = useRef(0);
  const sessionStarted = useRef(false);
  const initDestRef = useRef(destination);
  const initPhaseRef = useRef<FlightPhase>("CRUISE");

  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    setChatMessages([
      {
        id: makeId(),
        timestamp: new Date(),
        role: "ai",
        message:
          "AVIA-1 online. All systems nominal. Current state: FL350, airspeed 420 kts, heading 270\u00b0, fuel 68%. Ready to assist with your flight. State your current situation or request.",
      },
    ]);
  }, []);

  useEffect(() => {
    if (!actor || sessionStarted.current) return;
    sessionStarted.current = true;
    const dest = initDestRef.current;
    const phase = initPhaseRef.current;

    (async () => {
      try {
        const existing = await actor.getCurrentSession();
        if (existing) {
          setSessionId(existing.id);
          if (existing.destination) setDestination(existing.destination);
          setFlightPhase(existing.phase as FlightPhase);
        } else {
          const id = await actor.startFlightSession(dest, phase);
          setSessionId(id);
        }
      } catch {
        // Silently continue without backend session
      }
    })();
  }, [actor]);

  useEffect(() => {
    const { alerts, criticalMessage } = analyzeFlightParams(
      flightParams,
      flightPhase,
    );
    setSystemAlerts(alerts);

    const critCount = alerts.filter((a) => a.level === "CRITICAL").length;
    if (critCount > 0 && critCount > prevCriticalCount.current) {
      const aiMsg: ChatMessage = {
        id: makeId(),
        timestamp: new Date(),
        role: "ai",
        message:
          criticalMessage ??
          alerts
            .filter((a) => a.level === "CRITICAL")
            .map((a) => a.message.toUpperCase())
            .join(" | "),
        alertLevel: "CRITICAL",
      };
      setChatMessages((prev) => [...prev, aiMsg]);

      const sid = sessionIdRef.current;
      const act = actorRef.current;
      if (sid && act) {
        act.addLogEntry(sid, "ai", aiMsg.message, flightPhase).catch(() => {});
      }
    }
    prevCriticalCount.current = critCount;
  }, [flightParams, flightPhase]);

  const handleParamChange = useCallback(
    (key: keyof FlightParams, value: number) => {
      setFlightParams((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handlePhaseChange = useCallback((phase: FlightPhase) => {
    setFlightPhase(phase);
    const sid = sessionIdRef.current;
    const act = actorRef.current;
    if (sid && act) act.updateFlightPhase(sid, phase).catch(() => {});
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      const pilotMsg: ChatMessage = {
        id: makeId(),
        timestamp: new Date(),
        role: "pilot",
        message: text,
      };

      const responseText = generateChatResponse(
        text,
        flightParams,
        systemAlerts,
        weather,
        flightPhase,
      );
      const critCount = systemAlerts.filter(
        (a) => a.level === "CRITICAL",
      ).length;
      const cautCount = systemAlerts.filter(
        (a) => a.level === "CAUTION",
      ).length;

      const aiMsg: ChatMessage = {
        id: makeId(),
        timestamp: new Date(),
        role: "ai",
        message: responseText,
        alertLevel:
          critCount > 0 ? "CRITICAL" : cautCount > 0 ? "CAUTION" : undefined,
      };

      setChatMessages((prev) => [...prev, pilotMsg, aiMsg]);

      const sid = sessionIdRef.current;
      const act = actorRef.current;
      if (sid && act) {
        Promise.all([
          act.addLogEntry(sid, "pilot", text, flightPhase),
          act.addLogEntry(sid, "ai", responseText, flightPhase),
        ]).catch(() => {});
      }
    },
    [flightParams, systemAlerts, weather, flightPhase],
  );

  const year = new Date().getFullYear();
  const hostname = window.location.hostname;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "oklch(8.2% 0.013 230)" }}
    >
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "comms" ? (
        <main className="flex-1 overflow-hidden flex">
          <PilotCommsPanel actor={actor as any} />
        </main>
      ) : activeTab === "phase-chat" ? (
        <main className="flex-1 overflow-hidden flex">
          <PhaseChatPanel />
        </main>
      ) : activeTab === "radar" ? (
        <main className="flex-1 overflow-hidden flex">
          <RadarPanel />
        </main>
      ) : (
        <main
          className="flex-1 overflow-hidden grid gap-3 p-3"
          style={{ gridTemplateColumns: "260px 1fr 300px" }}
        >
          <aside className="flex flex-col gap-3 overflow-hidden min-w-0">
            <MissionStatus
              phase={flightPhase}
              destination={destination}
              weather={weather}
              altitude={flightParams.altitude}
              onPhaseChange={handlePhaseChange}
              onDestinationChange={setDestination}
              onWeatherChange={setWeather}
            />
            <AlertPanel alerts={systemAlerts} weather={weather} />
          </aside>

          <section className="flex flex-col gap-3 overflow-hidden min-w-0">
            <FlightGauges
              params={flightParams}
              onParamChange={handleParamChange}
            />
            <DecisionLog messages={chatMessages} />
          </section>

          <aside className="flex flex-col overflow-hidden min-w-0">
            <ChatPanel messages={chatMessages} onSend={handleSend} isOnline />
          </aside>
        </main>
      )}

      <footer
        className="flex items-center justify-between px-5 py-2 shrink-0 border-t text-[10px] font-mono"
        style={{
          background: "oklch(9% 0.015 230)",
          borderColor: "oklch(22% 0.027 220)",
          color: "oklch(40% 0.015 215)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "oklch(83% 0.185 155)" }}
            />
            SYSTEM NOMINAL
          </span>
          <span style={{ color: "oklch(30% 0.015 215)" }}>|</span>
          <span>{new Date().toUTCString().slice(0, 25)} UTC</span>
        </div>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          style={{ color: "oklch(40% 0.015 215)" }}
        >
          © {year}. Built with ♥ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
