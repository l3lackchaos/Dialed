/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm espresso surfaces — a dim café at night. Identity preserved
        // from the original brief, refined into a layered ramp.
        espresso: {
          DEFAULT: "#140C05", // body
          900: "#0F0703",
          800: "#1C130A", // raised surface / cards
          700: "#241809", // second panel layer (toolbars, insets)
          600: "#33240F",
          500: "#46330F",
        },
        gold: {
          DEFAULT: "#C8963A",
          light: "#E6C173", // hover / glow
          dark: "#A2762A", // press
        },
        cream: {
          DEFAULT: "#F4E9D4", // primary ink — ~10:1 on espresso
          dim: "#D6C8AC", // secondary text — AA (~6.5:1)
          mute: "#A99B7F", // tertiary only (timestamps), ~3.5:1 — never body
        },
        danger: {
          DEFAULT: "#E0654F",
          soft: "#3A1810",
        },
      },
      fontFamily: {
        // One workhorse (Inter) for all UI; serif reserved for wordmark + titles.
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // Fixed product scale (~1.2 ratio), not fluid.
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        raise: "0 1px 0 0 rgba(244,233,212,0.04) inset, 0 10px 30px -16px rgba(0,0,0,0.8)",
        gold: "0 6px 22px -10px rgba(200,150,58,0.45)",
        pop: "0 16px 40px -16px rgba(0,0,0,0.85)",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      zIndex: {
        nav: "30",
        sticky: "40",
        backdrop: "50",
        sheet: "60",
        toast: "70",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "sheet-up": "sheet-up 0.28s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
