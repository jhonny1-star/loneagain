/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'netflix': {
          'red': '#e50914',
          'black': '#141414',
          'dark-gray': '#181818',
          'light-gray': '#b3b3b3',
          'white': '#ffffff',
        },
      },
    },
  },
  plugins: [],
} 