/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006666',      // Teal - Fresh Tourism
          light: '#e0f2f1',
          dark: '#004d4d'
        },
        secondary: {
          DEFAULT: '#e05624',     // Warm Orange - Culinary
          light: '#fbebe6',
          dark: '#bd2130'
        },
        dark: {
          bg: '#090d10',
          card: '#12181f',
          border: '#1f2a36',
          text: '#e2e8f0',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['monospace']
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.05)',
        premium: '0 15px 40px rgba(0, 96, 96, 0.08)'
      }
    },
  },
  plugins: [],
}
