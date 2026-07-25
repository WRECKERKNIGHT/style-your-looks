import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#F5F0E8",
        cream: "#FFF8F0",
        espresso: "#2C1810",
        coffee: "#5C3D2E",
        tan: "#C4A882",
        "tan-light": "#D4C4A8",
        amber: "#B8860B",
        "amber-light": "#D4A017",
        burgundy: "#722F37",
        "burgundy-light": "#8B3A42",
        olive: "#556B2F",
        slate: "#4A4A4A",
        charcoal: "#1A1A1A",
        ivory: "#FFFFF0",
        linen: "#FAF0E6",
        "dark-base": "#1A1410",
        "dark-surface": "#231C14",
        "dark-elevated": "#2C2318",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "ui-serif", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        body: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slideDown 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-left": "slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "rotate-in": "rotateIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "draw-line": "drawLine 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "pulse-gold": "pulseGold 2.5s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
        "grain": "grain 8s steps(10) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-60px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(60px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        rotateIn: {
          "0%": { transform: "rotate(-8deg) scale(0.9)", opacity: "0" },
          "100%": { transform: "rotate(0deg) scale(1)", opacity: "1" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184, 134, 11, 0.4)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(184, 134, 11, 0.15)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "20%": { transform: "translate(-15%, 5%)" },
          "30%": { transform: "translate(7%, -25%)" },
          "40%": { transform: "translate(-5%, 25%)" },
          "50%": { transform: "translate(-15%, 10%)" },
          "60%": { transform: "translate(15%, 0%)" },
          "70%": { transform: "translate(0%, 15%)" },
          "80%": { transform: "translate(3%, 35%)" },
          "90%": { transform: "translate(-10%, 10%)" },
        },
      },
      boxShadow: {
        "elegant": "0 4px 24px -4px rgba(44, 24, 16, 0.12)",
        "elegant-lg": "0 8px 40px -8px rgba(44, 24, 16, 0.18)",
        "elegant-xl": "0 20px 60px -12px rgba(44, 24, 16, 0.25)",
        "gold": "0 0 20px rgba(184, 134, 11, 0.15)",
        "gold-lg": "0 0 40px rgba(184, 134, 11, 0.2)",
        "gold-xl": "0 0 80px rgba(184, 134, 11, 0.15), 0 0 120px rgba(184, 134, 11, 0.05)",
        "warm": "0 2px 12px -2px rgba(92, 61, 46, 0.1)",
        "dark": "0 4px 24px -4px rgba(0, 0, 0, 0.3)",
        "dark-lg": "0 8px 40px -8px rgba(0, 0, 0, 0.4)",
        "inner-glow": "inset 0 1px 2px rgba(184, 134, 11, 0.1)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
