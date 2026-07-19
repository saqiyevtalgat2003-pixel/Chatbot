import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D0F",
        surface: "#14171A",
        surface2: "#1B1F23",
        border: "#262B30",
        text: "#E8EAED",
        muted: "#8B9299",
        amber: "#E8A33D",
        coral: "#F0665B",
        wire: "#2E7D6B",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        sm: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
