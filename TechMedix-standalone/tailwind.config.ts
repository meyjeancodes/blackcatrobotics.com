import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0c0d11",
        paper: "#f2f0eb",
        surface: "#17181d",
        ember: "#e8601e",
        moss: "#1db87a",
        gold: "#c3a55b",
        border: "rgba(12,13,17,0.07)"
      },
      boxShadow: {
        panel: "0 2px 4px rgba(12,13,17,0.04), 0 6px 16px rgba(12,13,17,0.07), 0 20px 48px rgba(12,13,17,0.08)",
        "panel-hover": "0 2px 4px rgba(12,13,17,0.05), 0 8px 24px rgba(12,13,17,0.10), 0 24px 56px rgba(12,13,17,0.11)",
        elevated: "0 2px 4px rgba(12,13,17,0.05), 0 8px 20px rgba(12,13,17,0.09), 0 28px 64px rgba(12,13,17,0.10)",
        "elevated-hover": "0 4px 8px rgba(12,13,17,0.07), 0 12px 32px rgba(12,13,17,0.12), 0 32px 72px rgba(12,13,17,0.12)",
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      fontFamily: {
        header: ['Tanker', 'sans-serif'],
        body: ['Satoshi', "'Helvetica Neue'", 'sans-serif'],
        ui: ["'Chakra Petch'", 'monospace'],
        sans: ['Satoshi', "'Helvetica Neue'", 'sans-serif'],
        mono: ["'Chakra Petch'", 'monospace'],
      },
      transitionDuration: {
        '220': '220ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
  },
  plugins: []
};

export default config;
