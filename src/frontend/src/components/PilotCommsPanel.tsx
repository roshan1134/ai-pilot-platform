import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, RadioTower, Send, Signal, UserCheck, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { backendInterface as BaseBackend } from "../backend";

export interface PilotMessage {
  id: bigint;
  timestamp: bigint;
  fromCallsign: string;
  toCallsign: string;
  content: string;
}

interface CommsActor extends BaseBackend {
  registerCallsign(callsign: string): Promise<void>;
  getCallsign(): Promise<string | null>;
  getOnlinePilots(): Promise<Array<string>>;
  sendBroadcast(content: string): Promise<bigint>;
  sendDirectMessage(toCallsign: string, content: string): Promise<bigint>;
  getMessages(): Promise<Array<PilotMessage>>;
}

interface PilotCommsPanelProps {
  actor: CommsActor | null;
}

export default function PilotCommsPanel({ actor }: PilotCommsPanelProps) {
  const [callsign, setCallsign] = useState<string | null>(null);
  const [callsignInput, setCallsignInput] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const [onlinePilots, setOnlinePilots] = useState<string[]>([]);
  const [messages, setMessages] = useState<PilotMessage[]>([]);
  const [selectedPilot, setSelectedPilot] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connecting, setConnecting] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Init: check callsign
  useEffect(() => {
    if (!actor) return;
    setConnecting(true);
    actor
      .getCallsign()
      .then((cs) => {
        setCallsign(cs);
        setConnecting(false);
      })
      .catch(() => setConnecting(false));
  }, [actor]);

  // Poll messages every 5s
  useEffect(() => {
    if (!actor || !callsign) return;

    const fetchAll = () => {
      Promise.all([actor.getMessages(), actor.getOnlinePilots()])
        .then(([msgs, pilots]) => {
          setMessages(msgs);
          setOnlinePilots(pilots.filter((p) => p !== callsign));
        })
        .catch(() => {});
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [actor, callsign]);

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Poll online pilots every 10s independently
  useEffect(() => {
    if (!actor || !callsign) return;
    const interval = setInterval(() => {
      actor
        .getOnlinePilots()
        .then((pilots) => {
          setOnlinePilots(pilots.filter((p) => p !== callsign));
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [actor, callsign]);

  const handleRegister = async () => {
    if (!actor || !callsignInput.trim()) return;
    const cs = callsignInput.trim().toUpperCase();
    if (!/^[A-Z0-9-]{2,10}$/.test(cs)) {
      setRegisterError(
        "Callsign must be 2-10 alphanumeric characters (e.g. ALPHA-1)",
      );
      return;
    }
    setRegistering(true);
    setRegisterError("");
    try {
      await actor.registerCallsign(cs);
      setCallsign(cs);
    } catch {
      setRegisterError("Registration failed. Try a different callsign.");
    } finally {
      setRegistering(false);
    }
  };

  const handleBroadcast = async () => {
    if (!actor || !messageInput.trim() || sending) return;
    setSending(true);
    try {
      await actor.sendBroadcast(messageInput.trim());
      setMessageInput("");
      const msgs = await actor.getMessages();
      setMessages(msgs);
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleDM = async () => {
    if (!actor || !messageInput.trim() || !selectedPilot || sending) return;
    setSending(true);
    try {
      await actor.sendDirectMessage(selectedPilot, messageInput.trim());
      setMessageInput("");
      const msgs = await actor.getMessages();
      setMessages(msgs);
    } catch {
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toUTCString().slice(17, 25);
  };

  const isBroadcast = (msg: PilotMessage) => msg.toCallsign === "BROADCAST";

  if (!actor || connecting) {
    return (
      <div
        className="flex-1 flex items-center justify-center font-mono"
        data-ocid="comms.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Wifi
            size={28}
            className="animate-pulse"
            style={{ color: "oklch(82% 0.155 78)" }}
          />
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "oklch(57% 0.015 215)" }}
          >
            Connecting to comms network...
          </span>
        </div>
      </div>
    );
  }

  if (!callsign) {
    return (
      <div
        className="flex-1 flex items-center justify-center p-6"
        data-ocid="comms.panel"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-6 rounded-lg border font-mono"
          style={{
            background: "oklch(12.8% 0.022 225)",
            borderColor: "oklch(22% 0.027 220)",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Radio size={18} style={{ color: "oklch(82% 0.155 78)" }} />
            <span
              className="text-xs tracking-widest uppercase font-bold"
              style={{ color: "oklch(82% 0.155 78)" }}
            >
              Pilot Registration
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "oklch(57% 0.015 215)" }}>
            Register your callsign to join the P2P comms network.
          </p>
          <div className="space-y-3">
            <Input
              data-ocid="comms.input"
              placeholder="E.G. ALPHA-1"
              value={callsignInput}
              onChange={(e) => setCallsignInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              maxLength={10}
              className="font-mono text-sm uppercase tracking-widest"
              style={{
                background: "oklch(8.2% 0.013 230)",
                borderColor: "oklch(22% 0.027 220)",
                color: "oklch(82% 0.155 78)",
              }}
            />
            {registerError && (
              <p
                className="text-xs"
                data-ocid="comms.error_state"
                style={{ color: "oklch(65% 0.22 25)" }}
              >
                {registerError}
              </p>
            )}
            <Button
              data-ocid="comms.submit_button"
              onClick={handleRegister}
              disabled={registering || !callsignInput.trim()}
              className="w-full text-xs tracking-widest uppercase font-mono font-bold"
              style={{
                background: "oklch(82% 0.155 78)",
                color: "oklch(10% 0.015 230)",
              }}
            >
              {registering ? "Registering..." : "Register Callsign"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 gap-3 p-3 overflow-hidden"
      data-ocid="comms.panel"
    >
      {/* Left: Online Pilots + Header */}
      <div className="w-52 shrink-0 flex flex-col gap-3">
        {/* Callsign badge */}
        <div
          className="rounded-lg border p-3 font-mono"
          style={{
            background: "oklch(12.8% 0.022 225)",
            borderColor: "oklch(22% 0.027 220)",
          }}
        >
          <div
            className="text-[9px] tracking-widest uppercase mb-1"
            style={{ color: "oklch(57% 0.015 215)" }}
          >
            Your Callsign
          </div>
          <div
            className="flex items-center gap-1.5 text-sm font-bold tracking-widest"
            style={{ color: "oklch(82% 0.155 78)" }}
          >
            <UserCheck size={13} />
            {callsign}
          </div>
        </div>

        {/* Online Pilots */}
        <div
          className="flex-1 rounded-lg border flex flex-col overflow-hidden font-mono"
          style={{
            background: "oklch(12.8% 0.022 225)",
            borderColor: "oklch(22% 0.027 220)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 border-b"
            style={{ borderColor: "oklch(22% 0.027 220)" }}
          >
            <Signal size={11} style={{ color: "oklch(83% 0.185 155)" }} />
            <span
              className="text-[9px] tracking-widest uppercase font-bold"
              style={{ color: "oklch(57% 0.015 215)" }}
            >
              Online Pilots
            </span>
            <span
              className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
              style={{
                background: "oklch(83% 0.185 155 / 20%)",
                color: "oklch(83% 0.185 155)",
              }}
            >
              {onlinePilots.length}
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {onlinePilots.length === 0 ? (
                <div
                  data-ocid="comms.empty_state"
                  className="text-[10px] text-center py-4"
                  style={{ color: "oklch(35% 0.012 215)" }}
                >
                  No pilots online
                </div>
              ) : (
                onlinePilots.map((pilot, i) => (
                  <button
                    key={pilot}
                    type="button"
                    data-ocid={`comms.item.${i + 1}`}
                    onClick={() =>
                      setSelectedPilot(selectedPilot === pilot ? null : pilot)
                    }
                    className="w-full text-left px-2 py-1.5 rounded text-xs tracking-wide transition-colors"
                    style={{
                      background:
                        selectedPilot === pilot
                          ? "oklch(72% 0.180 240 / 15%)"
                          : "transparent",
                      color:
                        selectedPilot === pilot
                          ? "oklch(72% 0.180 240)"
                          : "oklch(72% 0.015 215)",
                      border:
                        selectedPilot === pilot
                          ? "1px solid oklch(72% 0.180 240 / 40%)"
                          : "1px solid transparent",
                    }}
                  >
                    ▶ {pilot}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
          {selectedPilot && (
            <div
              className="px-3 py-2 border-t text-[9px] tracking-wide"
              style={{
                borderColor: "oklch(22% 0.027 220)",
                color: "oklch(72% 0.180 240)",
              }}
            >
              DM target: <span className="font-bold">{selectedPilot}</span>
              <button
                type="button"
                className="ml-2 opacity-60 hover:opacity-100"
                onClick={() => setSelectedPilot(null)}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Message feed + input */}
      <div
        className="flex-1 flex flex-col rounded-lg border overflow-hidden font-mono"
        style={{
          background: "oklch(12.8% 0.022 225)",
          borderColor: "oklch(22% 0.027 220)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
          style={{ borderColor: "oklch(22% 0.027 220)" }}
        >
          <Radio size={14} style={{ color: "oklch(82% 0.155 78)" }} />
          <span
            className="text-[10px] tracking-widest uppercase font-bold"
            style={{ color: "oklch(82% 0.155 78)" }}
          >
            P2P Radio Comms
          </span>
          <span
            className="ml-auto flex items-center gap-1.5 text-[9px]"
            style={{ color: "oklch(83% 0.185 155)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
              style={{ background: "oklch(83% 0.185 155)" }}
            />
            LIVE
          </span>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {messages.length === 0 ? (
              <div
                data-ocid="comms.list"
                className="flex flex-col items-center justify-center py-12 gap-2"
              >
                <Radio size={24} style={{ color: "oklch(30% 0.015 215)" }} />
                <span
                  className="text-xs tracking-widest"
                  style={{ color: "oklch(35% 0.012 215)" }}
                >
                  No transmissions yet
                </span>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={String(msg.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    data-ocid={`comms.item.${i + 1}`}
                    className="rounded border px-3 py-2 text-xs"
                    style={{
                      background: isBroadcast(msg)
                        ? "oklch(82% 0.155 78 / 5%)"
                        : msg.fromCallsign === callsign
                          ? "oklch(72% 0.180 240 / 8%)"
                          : "oklch(10% 0.018 225)",
                      borderColor: isBroadcast(msg)
                        ? "oklch(82% 0.155 78 / 25%)"
                        : "oklch(72% 0.180 240 / 20%)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-bold tracking-wide"
                        style={{
                          color:
                            msg.fromCallsign === callsign
                              ? "oklch(72% 0.180 240)"
                              : "oklch(82% 0.155 78)",
                        }}
                      >
                        {msg.fromCallsign}
                      </span>
                      <span style={{ color: "oklch(40% 0.015 215)" }}>→</span>
                      <span
                        className="tracking-wide"
                        style={{
                          color: isBroadcast(msg)
                            ? "oklch(82% 0.155 78)"
                            : "oklch(72% 0.180 240)",
                        }}
                      >
                        {isBroadcast(msg) ? "[BROADCAST]" : msg.toCallsign}
                      </span>
                      <span
                        className="ml-auto text-[9px]"
                        style={{ color: "oklch(35% 0.012 215)" }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div style={{ color: "oklch(75% 0.015 215)" }}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div
          className="px-4 py-3 border-t shrink-0"
          style={{ borderColor: "oklch(22% 0.027 220)" }}
        >
          {selectedPilot && (
            <div
              className="text-[9px] tracking-wide mb-2"
              style={{ color: "oklch(72% 0.180 240)" }}
            >
              DM mode: transmitting to{" "}
              <span className="font-bold">{selectedPilot}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              data-ocid="comms.input"
              placeholder="Transmit message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleBroadcast();
                }
              }}
              className="flex-1 text-xs font-mono"
              style={{
                background: "oklch(8.2% 0.013 230)",
                borderColor: "oklch(22% 0.027 220)",
                color: "oklch(82% 0.015 215)",
              }}
            />
            <Button
              data-ocid="comms.primary_button"
              onClick={handleBroadcast}
              disabled={sending || !messageInput.trim()}
              size="sm"
              className="text-[10px] tracking-widest uppercase font-mono px-3"
              style={{
                background: "oklch(82% 0.155 78)",
                color: "oklch(10% 0.015 230)",
              }}
            >
              <RadioTower size={11} className="mr-1" />
              BCAST
            </Button>
            <Button
              data-ocid="comms.secondary_button"
              onClick={handleDM}
              disabled={sending || !messageInput.trim() || !selectedPilot}
              size="sm"
              variant="outline"
              className="text-[10px] tracking-widest uppercase font-mono px-3"
              style={{
                borderColor: selectedPilot
                  ? "oklch(72% 0.180 240 / 50%)"
                  : "oklch(22% 0.027 220)",
                color: selectedPilot
                  ? "oklch(72% 0.180 240)"
                  : "oklch(35% 0.012 215)",
                background: "transparent",
              }}
            >
              <Send size={11} className="mr-1" />
              DM
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
