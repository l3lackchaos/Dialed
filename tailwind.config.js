/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core specialty-coffee palette
        espresso: {
          DEFAULT: "#140C05", // near-black espresso — app background
          900: "#0E0703",
          800: "#1A1107",
          700: "#22160A",
          600: "#2C1D0E",
          500: "#3A2814",
        },
        gold: {
          DEFAULT: "#C8963A", // accent
          light: "#E0B968",
          dark: "#A2762A",
          glow: "#F0C977",
        },
        cream: {
          DEFAULT: "#F0E4CC", // primary text
          dim: "#C8BBA0",
          mute: "#8C8068",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(240,228,204,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.7)",
        gold: "0 0 0 1px rgba(200,150,58,0.35), 0 8px 28px -10px rgba(200,150,58,0.35)",
      },
      backgroundImage: {
        "gold-sheen":
          "linear-gradient(135deg, #E0B968 0%, #C8963A 45%, #A2762A 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
