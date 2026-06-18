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
          DEFAULT: "#F1EFE7", // warm editorial paper (kept low chroma, not beige-AI)
          900: "#FBFAF6", // near-white (nav, text-on-accent)
          800: "#FCFBF7", // "card" paper — barely raised, defined by rules not boxes
          700: "#EAE7DC", // fields, insets, quiet buttons
          600: "#DCD8CB", // slider track, hover, rules-strong
          500: "#C7C2B2",
        },
        cream: {
          DEFAULT: "#211F18", // ink (~15:1 on paper)
          dim: "#535046", // secondary text (AA ~7:1)
          mute: "#888473", // tertiary (timestamps) ~3.6:1
        },
        gold: {
          DEFAULT: "#47632F", // olive — structure, primary action, selection
          light: "#5C7C43",
          dark: "#37501F",
        },
        // Rust "data ink" — for the hero numbers (ratio, scores). A second editorial voice.
        rust: {
          DEFAULT: "#A8472A",
          dark: "#83351E",
        },
        danger: {
          DEFAULT: "#BC3B2C",
          soft: "#F7E4E1",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        // Editorial = sharper. Knock the soft-app roundness back.
        lg: "0.375rem",
        xl: "0.4375rem",
        "2xl": "0.5rem",
      },
      boxShadow: {
        // Flat by default — depth comes from hairline rules, not drop shadows.
        raise: "0 1px 0 0 rgba(33,31,24,0.03)",
        gold: "0 4px 14px -6px rgba(71,99,47,0.4)",
        pop: "0 20px 48px -20px rgba(33,31,24,0.35)",
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
