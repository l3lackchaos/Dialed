/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Clean, calm light palette. One olive accent. Token names kept.
        espresso: {
          DEFAULT: "#F5F4EF", // page
          900: "#FFFFFF", // text-on-accent / nav
          800: "#FFFFFF", // cards
          700: "#EFEEE8", // fields / insets / quiet
          600: "#E3E1D9", // hover / track
          500: "#CFCCC2",
        },
        cream: {
          DEFAULT: "#2A2722", // ink (~13:1 on white)
          dim: "#6A665C", // secondary (AA ~5.6:1)
          mute: "#9A9486", // tertiary
        },
        gold: {
          DEFAULT: "#4F6B36", // olive accent
          light: "#5E7E42",
          dark: "#3C5228",
        },
        danger: { DEFAULT: "#C24A3A", soft: "#F7E6E2" },
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
