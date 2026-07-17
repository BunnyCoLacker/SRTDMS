/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EC",
        ledger: {
          50: "#F2F7F4",
          100: "#DCEBE2",
          200: "#B4D3C0",
          300: "#88B79E",
          400: "#5C9A7C",
          500: "#3B7D5E",
          600: "#265C43",
          700: "#1B4332",
          800: "#153529",
          900: "#0F261D",
        },
        gold: {
          100: "#FBEFCF",
          300: "#F0CE7C",
          400: "#E3B04B",
          500: "#D4A017",
          600: "#AD7F0F",
        },
        ink: "#26241E",
        muted: "#7A7566",
        rust: "#B3401F",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(38,36,30,0.06), 0 6px 16px -8px rgba(38,36,30,0.15)",
      },
      backgroundImage: {
        stitch:
          "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(38,36,30,0.15) 6px, rgba(38,36,30,0.15) 7px)",
      },
    },
  },
  plugins: [],
};
