/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#041a10",
        foreground: "#e2f0e9",
        primary: {
          DEFAULT: "#10b981",
          foreground: "#022c22",
        },
        card: "rgba(11, 41, 26, 0.6)",
      },
    },
  },
  plugins: [],
}
