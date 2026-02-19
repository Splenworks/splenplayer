/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme"
import plugin from "tailwindcss/plugin"
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xxs: "10px",
      },
      animation: {
        shimmer: "shimmer 5s infinite",
        actionPulse: "actionPulse 1s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        actionPulse: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "15%": { opacity: "1", transform: "scale(1)" },
          "70%": { opacity: "1", transform: "scale(1.02)" },
          "100%": { opacity: "0", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("hocus", ["&:hover", "&:focus"])
      addVariant("both", ["&:before", "&:after"])
      addVariant("ff", "@supports (-moz-appearance: none)")
    }),
  ],
  darkMode: "selector",
}
