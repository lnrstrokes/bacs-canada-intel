import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bacs: {
          bg: "#020617",       // Slate 950
          surface: "#0f172a",  // Slate 900
          border: "#1e293b",   // Slate 800
          accent: "#10b981",   // Emerald 500
          accentHover: "#059669" // Emerald 600
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      }
    },
  },
  plugins: [],
};
export default config;
