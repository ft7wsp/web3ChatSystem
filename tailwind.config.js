/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        typing: {
          '0%': { width: '0ch', opacity: "0", display:"none" },
          '25%': { opacity: "0.2", display:"none" },

          '50%': { opacity: "0.3", display: "none" },
          '100%': { width: '25ch', opacity: "1" },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
      },
      animation: {
        'typing': 'typing 2s steps(25)',
        'blink': 'blink 0.5s step-end infinite',
      },
    },
  },
  plugins: [],
}

