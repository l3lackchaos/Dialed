/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Token names kept; values come from CSS vars so light/dark swap cleanly.
        // Channels (R G B) let Tailwind's /opacity modifiers keep working.
        espresso: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          900: "rgb(var(--on-accent) / <alpha-value>)",
          800: "rgb(var(--surface) / <alpha-value>)",
          700: "rgb(var(--inset) / <alpha-value>)",
          600: "rgb(var(--hover) / <alpha-value>)",
          500: "rgb(var(--line-strong) / <alpha-value>)",
        },
        cream: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          dim: "rgb(var(--ink-dim) / <alpha-value>)",
          mute: "rgb(var(--ink-mute) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          light: "rgb(var(--accent-light) / <alpha-value>)",
          dark: "rgb(var(--accent-dark) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          soft: "rgb(var(--danger-soft) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
      boxShadow: {
        card: "0 1px 2px rgba(42,39,34,0.04), 0 6px 16px -10px rgba(42,39,34,0.12)",
        pop: "0 18px 44px -18px rgba(42,39,34,0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-up": {
          "0%": { opacity: "0", transform: "translateY(8%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.3s ease-out both",
        "sheet-up": "sheet-up 0.28s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
