import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          indigo:  "#6366f1",
          violet:  "#8b5cf6",
          cyan:    "#22d3ee",
          emerald: "#10b981",
        },
      },
      backgroundImage: {
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
