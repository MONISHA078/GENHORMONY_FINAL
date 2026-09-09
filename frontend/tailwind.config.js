/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        // High-end tailored gradient color palettes
        spotify: {
          green: '#1DB954',
          black: '#191414',
        },
        harmony: {
          bg: '#0B0A0F',
          card: '#13111C',
          primary: '#6D28D9', // Violet-700
          secondary: '#EC4899', // Pink-500
          accent: '#10B981', // Emerald-500
          text: '#F3F4F6',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
