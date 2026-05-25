/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cabinet Grotesk'", "sans-serif"],
        body: ["'Satoshi'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          black: "#0A0A0A",
          white: "#FAFAFA",
          red: "#E61919",
          green: "#4AF626",
          gray: "#EAEAEA",
        },
      },
    },
  },
  plugins: [],
};
