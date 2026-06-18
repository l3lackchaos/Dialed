/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // LIGHT theme — a bright Nordic-minimal coffee bar at 9am. Clean
        // cool-neutral paper (warmth carried by the accent + serif, NOT a beige bg).
        // Token names kept (espresso/cream/gold) so the ramp swap is centralized:
        //   espresso = light surfaces · cream = ink · gold = olive "origin" accent.
        espresso: {
          DEFAULT: "#F2F1EC", // body / page
          900: "#FBFBF8", // near-white (nav, text-on-accent)
          800: "#FFFFFF", // cards / raised surface
          700: "#ECEBE4", // fields, insets, quiet buttons
          600: "#DEDDD3", // slider track, hover
          500: "#CCCABE",
        },
        cream: {
          DEFAULT: "#23241D", // primary ink (~14:1 on white)
          dim: "#55564C", // secondary text (AA ~7:1)
          mute: "#888577", // tertiary (timestamps) ~3.6:1
        },
        gold: {
          DEFAULT: "#47632F", // olive "origin" accent (~5.3:1 on white)
          light: "#5C7C43", // hover
          dark: "#37501F", // press / stronger text
        },
        danger: {
          DEFAULT: "#BC3B2C",
          soft: "#F7E4E1",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        raise: "0 1px 2px rgba(35,36,29,0.05), 0 12px 26px -16px rgba(35,36,29,0.18)",
        gold: "0 8px 20px -8px rgba(71,99,47,0.40)",
        pop: "0 18px 46px -18px rgba(35,36,29,0.28)",
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
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
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
