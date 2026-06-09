import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/content/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep charcoal base — not pure black
        ink: {
          950: "#0A0A0A",
          900: "#111111",
          850: "#161616",
          800: "#171717",
          700: "#1f1f1f",
        },
        // Brand red
        brand: {
          DEFAULT: "#D62828",
          dark: "#C1121F",
          light: "#E5383B",
        },
        cream: {
          100: "#F5F5F5",
          300: "#B0B0B0",
          500: "#7A7A7A",
        },
      },
      fontFamily: {
        // Wired to next/font CSS variables in layout.tsx
        display: ["var(--font-oswald)", "Impact", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightish: "-0.01em",
        wider2: "0.18em",
      },
      maxWidth: {
        container: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.9s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
