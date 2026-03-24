import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isOnline?: boolean;
}

function formatTime(d: Date): string {
  return d.toTimeString().slice(0, 8);
}

export default function ChatPanel({
  messages,
  onSend,
  isOnline = true,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgCount = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: bottomRef is stable, effect triggered by count
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "oklch(82% 0.155 78)";
  }
  function handleBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "oklch(22% 0.027 220)";
  }
  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = "oklch(82% 0.155 78 / 35%)";
  }
  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = "oklch(82% 0.155 78 / 20%)";
  }

  return (
    <div
      className="rounded-xl border flex flex-col h-full overflow-hidden"
      style={{
        background: "oklch(12.8% 0.022 225)",
        borderColor: "oklch(22% 0.027 220)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b"
        style={{ borderColor: "oklch(22% 0.027 220)" }}
      >
        <div>
          <div
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "oklch(57% 0.015 215)" }}
          >
            AI Co-Pilot
          </div>
          <div
            className="text-[10px] font-mono"
            style={{ color: "oklch(72% 0.013 215)" }}
          >
            AVIA-1
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isOnline
                ? "oklch(83% 0.185 155)"
                : "oklch(57% 0.015 215)",
              boxShadow: isOnline ? "0 0 6px oklch(83% 0.185 155)" : "none",
            }}
          />
          <span
            className="text-[10px] font-mono"
            style={{
              color: isOnline ? "oklch(83% 0.185 155)" : "oklch(57% 0.015 215)",
            }}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.map((msg, i) => {
          const isAI = msg.role === "ai";
          const accentColor = isAI
            ? msg.alertLevel === "CRITICAL"
              ? "oklch(60% 0.225 25)"
              : "oklch(82% 0.155 78)"
            : "oklch(72% 0.180 240)";

          return (
            <div
              key={msg.id}
              data-ocid={`chat.item.${i + 1}`}
              className={`rounded-lg p-2.5 border ${msg.alertLevel === "CRITICAL" ? "animate-pulse-critical" : ""}`}
              style={{
                background: isAI
                  ? "oklch(82% 0.155 78 / 7%)"
                  : "oklch(72% 0.180 240 / 7%)",
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
              </div>
              <p
                className="text-xs font-mono leading-relaxed"
                style={{ color: "oklch(72% 0.013 215)" }}
              >
                {msg.message}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* AI Status bar */}
      <div
        className="px-4 py-1.5 shrink-0 flex items-center gap-1.5 border-t"
        style={{
          borderColor: "oklch(22% 0.027 220)",
          background: "oklch(10% 0.015 230)",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "oklch(83% 0.185 155)",
            boxShadow: "0 0 4px oklch(83% 0.185 155)",
          }}
        />
        <span
          className="text-[10px] font-mono"
          style={{ color: "oklch(83% 0.185 155)" }}
        >
          AI STATUS: ONLINE
        </span>
      </div>

      {/* Input */}
      <div
        className="p-3 shrink-0 border-t"
        style={{ borderColor: "oklch(22% 0.027 220)" }}
      >
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            data-ocid="chat.input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Transmit to AVIA-1..."
            rows={2}
            className="flex-1 rounded-lg px-3 py-2 text-xs font-mono resize-none outline-none transition-colors"
            style={{
              background: "oklch(8.2% 0.013 230)",
              border: "1px solid oklch(22% 0.027 220)",
              color: "oklch(92% 0.010 215)",
            }}
          />
          <button
            type="button"
            data-ocid="chat.submit_button"
            onClick={handleSend}
            disabled={!input.trim()}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="p-2.5 rounded-lg transition-all disabled:opacity-40 shrink-0"
            style={{
              background: "oklch(82% 0.155 78 / 20%)",
              border: "1px solid oklch(82% 0.155 78 / 50%)",
              color: "oklch(82% 0.155 78)",
            }}
          >
            <Send size={14} />
          </button>
        </div>
        <p
          className="text-[9px] font-mono mt-1.5"
          style={{ color: "oklch(40% 0.015 215)" }}
        >
          Enter to transmit · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
