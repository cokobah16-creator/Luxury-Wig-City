/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // EXACT brand palette from Precious's identity guide
        burgundy: {
          DEFAULT: '#800020',
          50:  '#FCEEF0',
          100: '#F5C9D0',
          200: '#E58A98',
          300: '#C8505F',
          400: '#A2293A',
          500: '#800020',
          600: '#660019',
          700: '#4D0013',
          800: '#33000C',
          900: '#1A0006'
        },
        gold: {
          DEFAULT: '#FFD700',
          50:  '#FFFBE0',
          100: '#FFF4A8',
          200: '#FFE970',
          300: '#FFE03A',
          400: '#FFD700',
          500: '#D6B500',
          600: '#A38A00',
          700: '#705F00',
          800: '#3D3400',
          900: '#1A1700'
        },
        offwhite: '#FDFFFC',
        pearl:    '#F8F5EE',
        ash:      '#E0E0E0',
        smoke:    '#ADADAD',
        ink:      '#000000'
      },
      fontFamily: {
        // Display logo wordmark — fashion serif with character
        wordmark: ['Italiana', 'serif'],
        // Heavy condensed display for "BECAUSE YOUR HAIR IS THE CROWN"
        display:  ['Anton', 'sans-serif'],
        // Editorial serif for elegant copy
        serif:    ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Clean body sans
        sans:     ['"DM Sans"', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        wordmark: '0.02em',
        display: '-0.01em'
      },
      boxShadow: {
        luxe: '0 30px 60px -20px rgba(128,0,32,0.35)'
      }
    }
  },
  plugins: []
}
