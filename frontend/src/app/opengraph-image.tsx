import { ImageResponse } from "next/og";

export const alt = "Amir Ahmedin — AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link-preview card for LinkedIn / Slack / X, matching the hero styling.
export default function OpengraphImage() {
  const stats = [
    { value: "9", label: "Agent systems shipped" },
    { value: "35.2%", label: "DataAgentBench pass@1" },
    { value: "250", label: "Benchmark tasks" },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #080c14 65%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#94a3b8", textTransform: "uppercase" }}>
          AI Engineer · Kigali, Rwanda
        </div>
        <div style={{ fontSize: 110, fontWeight: 800, marginTop: 20, lineHeight: 1 }}>Amir Ahmedin</div>
        <div style={{ fontSize: 34, color: "#a5b4fc", marginTop: 24 }}>
          Multi-Agent Systems · Evaluation · Automation
        </div>
        <div style={{ display: "flex", gap: 72, marginTop: 64 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 56, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 22, color: "#64748b", textTransform: "uppercase", letterSpacing: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
