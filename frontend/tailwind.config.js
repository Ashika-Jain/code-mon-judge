/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'color-empty', 'color-github-1', 'color-github-2', 'color-github-3', 'color-github-4'
  ],
}

