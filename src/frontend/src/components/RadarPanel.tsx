import { useEffect, useRef } from "react";

interface Contact {
  callsign: string;
  bearing: number;
  range: number;
  altitude: number;
  confidence: number;
}

const CONTACTS: Contact[] = [
  {
    callsign: "UAL123",
    bearing: 45,
    range: 38,
    altitude: 37000,
    confidence: 94,
  },
  {
    callsign: "DLH456",
    bearing: 128,
    range: 62,
    altitude: 31000,
    confidence: 88,
  },
  {
    callsign: "BAW789",
    bearing: 220,
    range: 19,
    altitude: 39000,
    confidence: 97,
  },
  {
    callsign: "AAL302",
    bearing: 310,
    range: 80,
    altitude: 28000,
    confidence: 76,
  },
  {
    callsign: "SWA551",
    bearing: 355,
    range: 54,
    altitude: 35000,
    confidence: 91,
  },
  {
    callsign: "AFR177",
    bearing: 175,
    range: 44,
    altitude: 33000,
    confidence: 83,
  },
];

const RINGS = [25, 50, 75, 100];
const MAX_RANGE = 100;
const PHOSPHOR = "oklch(75% 0.18 145)";
const PHOSPHOR_DIM = "oklch(55% 0.12 145)";
const PHOSPHOR_FAINT = "oklch(35% 0.07 145)";
const SWEEP_MS = 4000;

function bearingToXY(
  bearing: number,
  range: number,
  cx: number,
  cy: number,
  maxPx: number,
): { x: number; y: number } {
  const rad = ((bearing - 90) * Math.PI) / 180;
  const r = (range / MAX_RANGE) * maxPx;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function RadarPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw(ts: number) {
      if (!canvas) return;
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const sweepAngle = ((elapsed % SWEEP_MS) / SWEEP_MS) * 360;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const maxPx = Math.min(cx, cy) - 30;

      // Clear
      ctx.fillStyle = "#050a08";
      ctx.fillRect(0, 0, W, H);

      // Range rings
      for (const nm of RINGS) {
        const r = (nm / MAX_RANGE) * maxPx;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = PHOSPHOR_FAINT;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.fillStyle = PHOSPHOR_FAINT;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${nm}nm`, cx + r + 3, cy - 3);
      }

      // Cardinal lines
      const cardinals = [
        { label: "N", angle: 0 },
        { label: "E", angle: 90 },
        { label: "S", angle: 180 },
        { label: "W", angle: 270 },
      ];
      for (const { label, angle } of cardinals) {
        const rad = ((angle - 90) * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxPx * Math.cos(rad), cy + maxPx * Math.sin(rad));
        ctx.strokeStyle = PHOSPHOR_FAINT;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        const lx = cx + (maxPx + 16) * Math.cos(rad);
        const ly = cy + (maxPx + 16) * Math.sin(rad);
        ctx.fillStyle = PHOSPHOR_DIM;
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, lx, ly);
      }

      // Degree marks every 30°
      for (let deg = 0; deg < 360; deg += 30) {
        if (deg % 90 === 0) continue;
        const rad = ((deg - 90) * Math.PI) / 180;
        const inner = maxPx - 6;
        const outer = maxPx + 2;
        ctx.beginPath();
        ctx.moveTo(cx + inner * Math.cos(rad), cy + inner * Math.sin(rad));
        ctx.lineTo(cx + outer * Math.cos(rad), cy + outer * Math.sin(rad));
        ctx.strokeStyle = PHOSPHOR_FAINT;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = PHOSPHOR_FAINT;
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lx = cx + (maxPx + 12) * Math.cos(rad);
        const ly = cy + (maxPx + 12) * Math.sin(rad);
        ctx.fillText(`${deg}`, lx, ly);
      }

      // Sweep
      const sweepRad = ((sweepAngle - 90) * Math.PI) / 180;

      // Sweep trail
      const trailDeg = 60;
      const trailStart = sweepAngle - trailDeg;
      const startRad = ((trailStart - 90) * Math.PI) / 180;
      const endRad = sweepRad;
      const grad = ctx.createConicGradient
        ? ctx.createConicGradient(startRad - Math.PI / 2, cx, cy)
        : null;

      if (grad) {
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "oklch(75% 0.18 145 / 15%)");
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxPx, startRad, endRad);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxPx, startRad, endRad);
        ctx.closePath();
        ctx.fillStyle = "rgba(50, 180, 80, 0.04)";
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + maxPx * Math.cos(sweepRad),
        cy + maxPx * Math.sin(sweepRad),
      );
      ctx.strokeStyle = PHOSPHOR;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Own ship marker
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx + 4, cy + 4);
      ctx.lineTo(cx - 4, cy + 4);
      ctx.closePath();
      ctx.fillStyle = PHOSPHOR;
      ctx.fill();

      // Contact blips
      for (const c of CONTACTS) {
        const { x, y } = bearingToXY(c.bearing, c.range, cx, cy, maxPx);
        ctx.fillStyle = PHOSPHOR;
        ctx.fillRect(x - 3, y - 3, 6, 6);
        ctx.fillStyle = PHOSPHOR_DIM;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(c.callsign, x + 6, y - 6);
        ctx.fillStyle = PHOSPHOR_FAINT;
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.fillText(`CNN:${c.confidence}%`, x + 6, y + 3);
      }

      // FADEC-CNN label
      ctx.fillStyle = PHOSPHOR_DIM;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("FADEC-CNN FEED", 8, 8);

      // Sweep angle readout
      ctx.fillStyle = PHOSPHOR_FAINT;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(`HDG ${sweepAngle.toFixed(0).padStart(3, "0")}°`, W - 8, 8);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ro = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="flex h-full font-mono"
      style={{ background: "oklch(5% 0.010 230)" }}
    >
      {/* Radar canvas */}
      <div ref={containerRef} className="flex-1 relative">
        <canvas
          ref={canvasRef}
          data-ocid="radar.canvas_target"
          className="w-full h-full block"
        />
      </div>

      {/* Contact list sidebar */}
      <div
        className="w-64 shrink-0 border-l flex flex-col"
        style={{
          background: "oklch(8.2% 0.013 230)",
          borderColor: "oklch(22% 0.027 220)",
        }}
      >
        <div
          className="px-3 py-2 border-b"
          style={{ borderColor: "oklch(22% 0.027 220)" }}
        >
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: PHOSPHOR_DIM }}
          >
            Contact List
          </span>
          <div
            className="text-[9px] mt-0.5"
            style={{ color: "oklch(40% 0.010 215)" }}
          >
            FADEC → CNN inference
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table
            className="w-full text-[10px]"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(22% 0.027 220)" }}>
                {["Callsign", "BRG", "RNG", "ALT", "CNN"].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1.5 text-left font-normal"
                    style={{ color: "oklch(40% 0.015 215)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTACTS.map((c, i) => (
                <tr
                  key={c.callsign}
                  data-ocid={`radar.item.${i + 1}`}
                  style={{ borderBottom: "1px solid oklch(18% 0.020 225)" }}
                >
                  <td
                    className="px-2 py-1.5 font-bold"
                    style={{ color: PHOSPHOR_DIM }}
                  >
                    {c.callsign}
                  </td>
                  <td
                    className="px-2 py-1.5"
                    style={{ color: "oklch(70% 0.012 215)" }}
                  >
                    {c.bearing.toString().padStart(3, "0")}°
                  </td>
                  <td
                    className="px-2 py-1.5"
                    style={{ color: "oklch(70% 0.012 215)" }}
                  >
                    {c.range}nm
                  </td>
                  <td
                    className="px-2 py-1.5"
                    style={{ color: "oklch(70% 0.012 215)" }}
                  >
                    {(c.altitude / 1000).toFixed(0)}k
                  </td>
                  <td
                    className="px-2 py-1.5 font-bold"
                    style={{
                      color:
                        c.confidence >= 90
                          ? PHOSPHOR
                          : c.confidence >= 80
                            ? PHOSPHOR_DIM
                            : PHOSPHOR_FAINT,
                    }}
                  >
                    {c.confidence}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="px-3 py-2 border-t text-[9px] leading-relaxed"
          style={{
            borderColor: "oklch(22% 0.027 220)",
            color: "oklch(35% 0.010 215)",
          }}
        >
          Data sourced from FADEC telemetry processed via convolutional neural
          network classification. Range: 100nm.
        </div>
      </div>
    </div>
  );
}
