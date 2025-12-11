/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8DD8FF',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#8DD8FF',
          400: '#8DD8FF',
          500: '#8DD8FF',
          600: '#0EA5E9',
          700: '#0284C7',
          800: '#075985',
          900: '#0C4A6E',
        },
      },
    },
  },
  plugins: [],
};
