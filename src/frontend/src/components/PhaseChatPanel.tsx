import { useRef, useState } from "react";

type FlightPhase =
  | "PREFLIGHT"
  | "TAKEOFF"
  | "CLIMB"
  | "CRUISE"
  | "DESCENT"
  | "APPROACH"
  | "LANDING";

interface ChatEntry {
  type: "message";
  id: string;
  sender: "pilot1" | "pilot2";
  callsign: string;
  text: string;
  timestamp: Date;
  phase: FlightPhase;
}

interface PhaseEntry {
  type: "phase";
  id: string;
  phase: FlightPhase;
}

type Entry = ChatEntry | PhaseEntry;

const PHASES: FlightPhase[] = [
  "PREFLIGHT",
  "TAKEOFF",
  "CLIMB",
  "CRUISE",
  "DESCENT",
  "APPROACH",
  "LANDING",
];

const BG = "oklch(8.2% 0.013 230)";
const SURFACE = "oklch(12.8% 0.022 225)";
const SURFACE2 = "oklch(16% 0.020 225)";
const BORDER = "oklch(22% 0.027 220)";
const MUTED = "oklch(57% 0.015 215)";
const AMBER = "oklch(82% 0.155 78)";
const GREEN = "oklch(83% 0.185 155)";
const TEXT = "oklch(88% 0.010 215)";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function fmtTime(d: Date) {
  return `${d.toUTCString().slice(17, 22)}Z`;
}

export default function PhaseChatPanel() {
  const [callsign1, setCallsign1] = useState("ALPHA-1");
  const [callsign2, setCallsign2] = useState("BRAVO-2");
  const [phase, setPhase] = useState<FlightPhase>("CRUISE");
  const [entries, setEntries] = useState<Entry[]>([
    { type: "phase", id: makeId(), phase: "CRUISE" },
    {
      type: "message",
      id: makeId(),
      sender: "pilot1",
      callsign: "ALPHA-1",
      text: "ALPHA-1 checking in. All systems nominal at FL350.",
      timestamp: new Date(),
      phase: "CRUISE",
    },
    {
      type: "message",
      id: makeId(),
      sender: "pilot2",
      callsign: "BRAVO-2",
      text: "BRAVO-2 copies. Light turbulence reported ahead, 50nm at 12 o'clock.",
      timestamp: new Date(),
      phase: "CRUISE",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  function changePhase(newPhase: FlightPhase) {
    if (newPhase === phase) return;
    setPhase(newPhase);
    setEntries((prev) => [
      ...prev,
      { type: "phase", id: makeId(), phase: newPhase },
    ]);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function sendMessage(sender: "pilot1" | "pilot2") {
    const text = inputText.trim();
    if (!text) return;
    const callsign = sender === "pilot1" ? callsign1 : callsign2;
    setEntries((prev) => [
      ...prev,
      {
        type: "message",
        id: makeId(),
        sender,
        callsign,
        text,
        timestamp: new Date(),
        phase,
      },
    ]);
    setInputText("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage("pilot1");
    }
  }

  return (
    <div className="flex flex-col h-full font-mono" style={{ background: BG }}>
      {/* Header */}
      <div
        className="shrink-0 border-b px-4 py-3 flex items-center justify-between"
        style={{ background: SURFACE, borderColor: BORDER }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: MUTED }}
          >
            Phase Chat
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: SURFACE2,
              color: AMBER,
              border: `1px solid ${BORDER}`,
            }}
          >
            {phase}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase" style={{ color: GREEN }}>
              P1
            </span>
            <input
              data-ocid="phase-chat.input"
              value={callsign1}
              onChange={(e) => setCallsign1(e.target.value.toUpperCase())}
              maxLength={10}
              className="w-24 px-2 py-0.5 text-xs rounded font-mono"
              style={{
                background: SURFACE2,
                border: `1px solid ${BORDER}`,
                color: GREEN,
                outline: "none",
              }}
            />
          </div>
          <span style={{ color: BORDER }}>|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase" style={{ color: AMBER }}>
              P2
            </span>
            <input
              data-ocid="phase-chat.input"
              value={callsign2}
              onChange={(e) => setCallsign2(e.target.value.toUpperCase())}
              maxLength={10}
              className="w-24 px-2 py-0.5 text-xs rounded font-mono"
              style={{
                background: SURFACE2,
                border: `1px solid ${BORDER}`,
                color: AMBER,
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Phase selector */}
      <div
        className="shrink-0 border-b px-4 py-2 flex items-center gap-1 overflow-x-auto"
        style={{ background: SURFACE, borderColor: BORDER }}
      >
        <span
          className="text-[10px] uppercase tracking-widest mr-2 shrink-0"
          style={{ color: MUTED }}
        >
          Phase:
        </span>
        {PHASES.map((p) => (
          <button
            key={p}
            type="button"
            data-ocid="phase-chat.tab"
            onClick={() => changePhase(p)}
            className="px-2.5 py-0.5 text-[10px] tracking-wider rounded shrink-0 transition-colors"
            style={{
              background:
                phase === p ? "oklch(82% 0.155 78 / 15%)" : "transparent",
              color: phase === p ? AMBER : MUTED,
              border: `1px solid ${phase === p ? AMBER : BORDER}`,
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message history */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
        style={{ background: BG }}
      >
        {entries.map((entry) => {
          if (entry.type === "phase") {
            return (
              <div key={entry.id} className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px" style={{ background: BORDER }} />
                <span
                  className="text-[10px] tracking-widest uppercase px-2"
                  style={{ color: MUTED }}
                >
                  {entry.phase}
                </span>
                <div className="flex-1 h-px" style={{ background: BORDER }} />
              </div>
            );
          }
          const isP1 = entry.sender === "pilot1";
          return (
            <div
              key={entry.id}
              className={`flex flex-col max-w-[65%] gap-0.5 ${isP1 ? "self-start" : "self-end items-end"}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isP1 ? GREEN : AMBER }}
                >
                  {entry.callsign}
                </span>
                <span className="text-[10px]" style={{ color: MUTED }}>
                  {fmtTime(entry.timestamp)}
                </span>
              </div>
              <div
                className="px-3 py-1.5 rounded text-xs leading-relaxed"
                style={{
                  background: isP1
                    ? "oklch(83% 0.185 155 / 8%)"
                    : "oklch(82% 0.155 78 / 8%)",
                  border: `1px solid ${isP1 ? "oklch(83% 0.185 155 / 20%)" : "oklch(82% 0.155 78 / 20%)"}`,
                  color: TEXT,
                }}
              >
                {entry.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div
        className="shrink-0 border-t px-4 py-3 flex items-center gap-2"
        style={{ background: SURFACE, borderColor: BORDER }}
      >
        <input
          data-ocid="phase-chat.input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type message..."
          className="flex-1 px-3 py-1.5 text-xs rounded font-mono"
          style={{
            background: SURFACE2,
            border: `1px solid ${BORDER}`,
            color: TEXT,
            outline: "none",
          }}
        />
        <button
          type="button"
          data-ocid="phase-chat.primary_button"
          onClick={() => sendMessage("pilot1")}
          className="px-3 py-1.5 text-xs rounded"
          style={{
            background: "oklch(83% 0.185 155 / 15%)",
            border: "1px solid oklch(83% 0.185 155 / 40%)",
            color: GREEN,
          }}
        >
          Send as {callsign1}
        </button>
        <button
          type="button"
          data-ocid="phase-chat.secondary_button"
          onClick={() => sendMessage("pilot2")}
          className="px-3 py-1.5 text-xs rounded"
          style={{
            background: "oklch(82% 0.155 78 / 15%)",
            border: "1px solid oklch(82% 0.155 78 / 40%)",
            color: AMBER,
          }}
        >
          Send as {callsign2}
        </button>
      </div>
    </div>
  );
}
