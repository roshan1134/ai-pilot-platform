import { useEffect, useRef } from "react";
import type { AlertLevel, ChatMessage } from "../types";

interface DecisionLogProps {
  messages: ChatMessage[];
}

function formatTime(d: Date): string {
  return d.toTimeString().slice(0, 8);
}

const LEVEL_COLORS: Record<AlertLevel, string> = {
  NORMAL: "oklch(83% 0.185 155)",
  CAUTION: "oklch(82% 0.155 78)",
  CRITICAL: "oklch(60% 0.225 25)",
};

export default function DecisionLog({ messages }: DecisionLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgCount = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: bottomRef is stable, effect triggered by count
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  return (
    <div
      className="rounded-xl border flex flex-col flex-1 overflow-hidden"
      style={{
        background: "oklch(12.8% 0.022 225)",
        borderColor: "oklch(22% 0.027 220)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b"
        style={{ borderColor: "oklch(22% 0.027 220)" }}
      >
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "oklch(57% 0.015 215)" }}
        >
          AI Decision Log
        </span>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded"
          style={{
            background: "oklch(18% 0.020 225)",
            color: "oklch(57% 0.015 215)",
            border: "1px solid oklch(22% 0.027 220)",
          }}
        >
          {messages.length} entries
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
        data-ocid="log.list"
      >
        {messages.length === 0 ? (
          <div
            data-ocid="log.empty_state"
            className="flex-1 flex items-center justify-center text-center py-8"
          >
            <p
              className="text-xs font-mono"
              style={{ color: "oklch(57% 0.015 215)" }}
            >
              No decisions logged.
              <br />
              Begin flight sequence.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isAI = msg.role === "ai";
            const accentColor = isAI
              ? msg.alertLevel === "CRITICAL"
                ? LEVEL_COLORS.CRITICAL
                : msg.alertLevel === "CAUTION"
                  ? LEVEL_COLORS.CAUTION
                  : "oklch(82% 0.155 78)"
              : "oklch(72% 0.180 240)";

            return (
              <div
                key={msg.id}
                data-ocid={`log.item.${i + 1}`}
                className={`rounded-lg p-2 border ${msg.alertLevel === "CRITICAL" ? "animate-pulse-critical" : ""}`}
                style={{
                  background: isAI
                    ? "oklch(82% 0.155 78 / 6%)"
                    : "oklch(72% 0.180 240 / 6%)",
                  borderColor: `${accentColor}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: `${accentColor}20`,
                      color: accentColor,
                      border: `1px solid ${accentColor}40`,
                    }}
                  >
                    {isAI ? "AVIA-1" : "PILOT"}
                  </span>
                  <span
                    className="text-[9px] font-mono"
                    style={{ color: "oklch(57% 0.015 215)" }}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.alertLevel && msg.alertLevel !== "NORMAL" && (
                    <span
                      className="text-[9px] font-mono font-bold ml-auto"
                      style={{ color: LEVEL_COLORS[msg.alertLevel] }}
                    >
                      ⚠ {msg.alertLevel}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs font-mono leading-relaxed"
                  style={{ color: "oklch(72% 0.013 215)" }}
                >
                  {msg.message}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
