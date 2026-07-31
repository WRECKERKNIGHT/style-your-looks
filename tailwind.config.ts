import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          50: "#F0E8FF",
          100: "#D4BFFF",
          200: "#B08CFF",
          300: "#8C59FF",
          400: "#6C2BD9",
          500: "#4A1A96",
          600: "#2E0F66",
          700: "#1C0840",
          800: "#0F0A2E",
          900: "#0A0618",
        },
        aurum: {
          50: "#FFF8E0",
          100: "#FFEDB0",
          200: "#FFE180",
          300: "#FFD650",
          400: "#FFCB20",
          500: "#E8B620",
          600: "#C4941A",
          700: "#A07214",
          800: "#7C500E",
          900: "#583608",
        },
        cosmic: {
          base: "#0A0618",
          surface: "#0F0A2E",
          elevated: "#1C0840",
          border: "#2E0F66",
          muted: "#6C2BD9",
        },
        light: {
          base: "#F8F6FF",
          surface: "#FFFFFF",
          elevated: "#F0E8FF",
          border: "#D4BFFF",
          muted: "#8C59FF",
        },
        success: "#00E676",
        warning: "#FFD650",
        error: "#FF1744",
        info: "#448AFF",
      },
      fontFamily: {
        display: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "pulse-nexus": "pulseNexus 2.5s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite alternate",
        "scan": "scan 4s linear infinite",
        "drift": "drift 20s linear infinite",
        "pulse-ring": "pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseNexus: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(108, 43, 217, 0.4)" },
          "50%": { boxShadow: "0 0 30px 6px rgba(108, 43, 217, 0.15)" },
        },
        glow: {
          "0%": { opacity: "0.4", filter: "brightness(0.8)" },
          "100%": { opacity: "0.8", filter: "brightness(1.2)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        drift: {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(5%, -5%)" },
          "50%": { transform: "translate(-5%, 10%)" },
          "75%": { transform: "translate(10%, -5%)" },
          "100%": { transform: "translate(0, 0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
      boxShadow: {
        "nexus": "0 4px 24px -4px rgba(108, 43, 217, 0.15)",
        "nexus-lg": "0 8px 40px -8px rgba(108, 43, 217, 0.25)",
        "nexus-xl": "0 20px 60px -12px rgba(108, 43, 217, 0.3)",
        "aurum": "0 0 20px rgba(232, 182, 32, 0.15)",
        "aurum-lg": "0 0 40px rgba(232, 182, 32, 0.2)",
        "inner-glow": "inset 0 1px 2px rgba(108, 43, 217, 0.1)",
        "cosmic": "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
        "cosmic-lg": "0 8px 40px -8px rgba(0, 0, 0, 0.6)",
      },
      backgroundImage: {
        "gradient-nexus": "linear-gradient(135deg, #6C2BD9 0%, #4A1A96 50%, #2E0F66 100%)",
        "gradient-aurum": "linear-gradient(135deg, #FFCB20 0%, #E8B620 50%, #C4941A 100%)",
        "gradient-cosmic": "linear-gradient(180deg, #0A0618 0%, #0F0A2E 50%, #1C0840 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
