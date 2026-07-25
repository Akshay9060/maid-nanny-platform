/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1E2B27',
        forest: {
          DEFAULT: '#1B4B43',
          light: '#2C6A5F',
          dark: '#0F332D',
        },
        marigold: {
          DEFAULT: '#C98A2B',
          light: '#E3A94F',
          dark: '#9C6A1D',
        },
        sand: '#FAF8F4',
        clay: '#F1EAE0',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
