/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // EXACT brand palette from Luxury Wig City identity guide.
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
        ink:      '#000000',
        'ink-soft': '#1A0006'
      },
      fontFamily: {
        // Decorative fashion serif for the "luxury wig city" wordmark.
        wordmark: ['Italiana', 'serif'],
        // Heavy condensed display for "BECAUSE YOUR HAIR IS THE CROWN".
        display:  ['Anton', 'sans-serif'],
        // Editorial italic serif for ledes / pull-quotes.
        serif:    ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // UI + body sans.
        sans:     ['"DM Sans"', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        wordmark:  '0.02em',
        display:   '-0.01em',
        button:    '0.12em',
        uppercase: '0.18em',
        eyebrow:   '0.30em'
      },
      boxShadow: {
        soft:  '0 4px 12px -4px rgba(26,0,6,0.08)',
        card:  '0 12px 28px -16px rgba(26,0,6,0.18)',
        lift:  '0 22px 44px -22px rgba(26,0,6,0.28)',
        luxe:  '0 30px 60px -20px rgba(128,0,32,0.35)',
        gold:  '0 18px 40px -16px rgba(255,215,0,0.45)'
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.20, 0.70, 0.20, 1.00)',
        out:  'cubic-bezier(0.16, 1, 0.30, 1)'
      },
      maxWidth: {
        container: '1400px'
      }
    }
  },
  plugins: []
}
