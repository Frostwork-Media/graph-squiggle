/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // for squiggle-components
    "./node_modules/@quri/squiggle-components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Readex Pro", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
