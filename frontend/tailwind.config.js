/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        infosys: {
          blue: '#0070C0',
          dark: '#005a9e',
        }
      }
    },
  },
  plugins: [],
}
