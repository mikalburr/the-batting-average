import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#111111",
        raised: "#161616",
        border: "#1f1f1f",
        text: {
          primary: "#e0e0e0",
          muted: "#555555",
        },
        tier: {
          classic: "#FFD700",
          great: "#00E5B0",
          good: "#4CAF50",
          mid: "#A0A0A0",
          skip: "#FF4444",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Bebas Neue", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
