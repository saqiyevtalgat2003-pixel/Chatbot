import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F4F6F9",
        ink: "#152238",
        "ink-soft": "#3c4a63",
        muted: "#6b7488",
        gold: "#E8A33D",
        "gold-deep": "#C97F1E",
        azure: "#2E7DA6",
        "azure-deep": "#1F5E80",
        success: "#3E8E5B",
        danger: "#C0483C",
      },
      fontFamily: {
        display: ["var(--font-golos)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "maintenance-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(30px, 20px) scale(1.1)" },
        },
        "maintenance-drift-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-20px, -30px) scale(1.15)" },
        },
        "maintenance-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "maintenance-bounce": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "maintenance-drift": "maintenance-drift 8s ease-in-out infinite",
        "maintenance-drift-slow": "maintenance-drift-slow 11s ease-in-out infinite",
        "maintenance-spin": "maintenance-spin 6s linear infinite",
        "maintenance-bounce": "maintenance-bounce 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
