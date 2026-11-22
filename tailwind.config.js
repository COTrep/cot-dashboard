/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#e3eeff",
          100: "#c7dcff",
          200: "#94baff",
          300: "#5e96ff",
          400: "#2962ff",
          500: "#2962ff",
          600: "#1e4fd9",
          700: "#1540b3",
          800: "#0e3090",
          900: "#092070",
        },
        surface: {
          50:  "#f8fafc",
          100: "#d1d4dc",
          200: "#787b86",
          700: "#2a2e39",
          800: "#1e222d",
          900: "#1a1d26",
          950: "#131722",
        },
      },
      fontFamily: {
        mono:    ["'JetBrains Mono'", "monospace"],
        sans:    ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
