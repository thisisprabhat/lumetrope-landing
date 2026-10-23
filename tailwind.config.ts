import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: { 0: "#0b0c0e", 1: "#111316", 2: "#16191d", 3: "#1d2126" },
        lume: "#ffb340", cyan: "#6fd3ff", ok: "#7ee2a8", violet: "#b69cff",
        text: { 0: "#eceae4", 1: "#b5b3ac", 2: "#7c7b76" },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
        display: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"Martian Mono"', "ui-monospace", "monospace"],
      },
    },
  },
} satisfies Config;
