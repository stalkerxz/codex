import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f0f12",
        accent: "#d2b48c"
      }
    }
  },
  darkMode: "class",
  plugins: []
};

export default config;
