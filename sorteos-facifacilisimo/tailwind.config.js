/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'gotham': ['Gotham', 'sans-serif'],
        'sans': ['Gotham', 'sans-serif'],
      },
      nimation: {
        marquee: 'marquee 20s linear infinite',
        marquee2: 'marquee2 20s linear infinite',
        'fadeIn': 'fadeIn 2s ease-in',
        'floatConfetti': 'floatConfetti 5s ease-in-out infinite',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        marquee2: { '0%': { transform: 'translateX(50%)' }, '100%': { transform: 'translateX(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        floatConfetti: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' }
        }
      },
      colors: {
        primary: '#0033A0',
        secondary: '#E30613',
        accent: '#FFE000',
        neutral: '#FFFFFF',
      }
    },
  },
  plugins: [],
}