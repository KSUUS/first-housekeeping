/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dceffd",
          200: "#b1ddfb",
          300: "#6fc3f7",
          400: "#26a4f0",
          500: "#0a8ade",
          600: "#006bb8",
          700: "#015695",
          800: "#06497b",
          900: "#0b3e66",
        },
        accent: {
          500: "#10b981", // fresh green for "clean / safe" CTAs
          600: "#059669",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", lg: "2rem" },
      },
    },
  },
  plugins: [],
};
