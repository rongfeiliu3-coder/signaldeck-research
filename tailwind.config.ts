import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0F14",
        panel: "#111820",
        line: "#21303B",
        mint: "#42E6A4",
        amber: "#F7C948",
        rose: "#FF6B7A",
        cyan: "#5EDFFF"
      },
      boxShadow: {
        glow: "0 0 48px rgba(66, 230, 164, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
