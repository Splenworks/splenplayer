/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin"
import defaultTheme from "tailwindcss/defaultTheme"
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("hocus", ["&:hover", "&:focus"]),
        addVariant("both", ["&:before", "&:after"])
    }),
  ],
  darkMode: "selector",
}
