/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          greenHover: "#1ed760",
          black: "#121212",
          darkGray: "#181818",
          lightGray: "#282828",
          hover: "#333333",
          textMuted: "#b3b3b3"
        }
      }
    },
  },
  plugins: [],
}
