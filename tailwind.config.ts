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
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
