import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        slatepanel: "#101826",
        mist: "#e2e8f0",
        accent: "#6ee7b7",
        cobalt: "#4f7cff"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(15, 23, 42, 0.16)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "page-glow":
          "radial-gradient(circle at top left, rgba(79, 124, 255, 0.12), transparent 25%), radial-gradient(circle at top right, rgba(110, 231, 183, 0.08), transparent 20%)"
      }
    }
  },
  plugins: []
};

export default config;
