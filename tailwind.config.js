/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'valencia': '#D43434',
        'carnation': '#F85D5A',
        'gallery': '#ECEBEA',
        'venice-blue': '#085070',
        'fountain-blue': '#64BABE',
      },
    },
  },
  plugins: [],
}
