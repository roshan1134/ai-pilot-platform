import { MessageSquare, Plane, Radar, Radio } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: null },
  { id: "comms", label: "Comms", icon: Radio },
  { id: "phase-chat", label: "Phase Chat", icon: MessageSquare },
  { id: "radar", label: "Radar", icon: Radar },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <header
      className="flex items-center justify-between px-5 h-12 shrink-0 border-b"
      style={{
        background: "oklch(9% 0.015 230)",
        borderColor: "oklch(22% 0.027 220)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Plane
          size={20}
          style={{ color: "oklch(82% 0.155 78)" }}
          strokeWidth={1.5}
        />
        <span
          className="font-mono font-bold tracking-[0.2em] text-sm"
          style={{ color: "oklch(82% 0.155 78)" }}
        >
          AVIA AI
        </span>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              data-ocid="nav.tab"
              onClick={() => onTabChange(tab.id as TabId)}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium tracking-wide transition-colors"
              style={{
                color: active ? "oklch(82% 0.155 78)" : "oklch(57% 0.015 215)",
                background: active
                  ? "oklch(82% 0.155 78 / 12%)"
                  : "transparent",
                borderBottom: active
                  ? "2px solid oklch(82% 0.155 78)"
                  : "2px solid transparent",
              }}
            >
              {Icon && <Icon size={11} />}
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs tracking-wide"
          style={{ color: "oklch(57% 0.015 215)" }}
        >
          PILOT
        </span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono"
          style={{
            background: "oklch(82% 0.155 78 / 20%)",
            color: "oklch(82% 0.155 78)",
            border: "1px solid oklch(82% 0.155 78 / 40%)",
          }}
        >
          PL
        </div>
      </div>
    </header>
  );
}
