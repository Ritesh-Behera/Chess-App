/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      colors: {
        board: {
          light: "var(--board-light)",
          dark: "var(--board-dark)",
          "light-hover": "var(--board-light-hover)",
          "dark-hover": "var(--board-dark-hover)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        brass: {
          DEFAULT: "var(--brass)",
          soft: "var(--brass-soft)",
        },
        felt: "var(--felt)",
        garnet: "var(--garnet)",
      },
      boxShadow: {
        piece: "0 2px 3px rgba(0,0,0,0.35)",
        panel: "var(--panel-shadow)",
      },
      borderRadius: {
        panel: "0.75rem",
      },
    },
  },
  plugins: [],
};
