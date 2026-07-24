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
        primary: "#3C2A21",
        "primary-dark": "#2B1E16",
        accent: "#C89D7C",
        "accent-light": "#D4B896",
        "bg-primary": "#FFFFFF",
        "bg-warm": "#FDFBF7",
        "bg-card": "#F4EFEA",
        "bg-card-hover": "#EDE5DC",
        border: "#E8E0D8",
        "text-muted": "#8B7D6B",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
