/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'primary' : ['var(--font-primary)',...fontFamily.sans]
      },
      colors: {
        'primary' : 'var(--primary)',
        'primaryHover' : 'var(--primary-hover)',
        'primaryHighlight' : 'var(--primary-highlight)',
        'secondary' : 'var(--secondary)',
        'secondaryHover' : 'var(--secondary-hover)',
        'secondaryHighlight' : 'var(--secondary-highlight)',
        'drafter1' : 'var(--drafter1)',
        'drafter2' : 'var(--drafter2)',
        'drafter3' : 'var(--drafter3)',
        'drafter4' : 'var(--drafter4)',
        'drafter5' : 'var(--drafter5)',
        'drafter6' : 'var(--drafter6)',
        'drafter7' : 'var(--drafter7)',
        'drafter8' : 'var(--drafter8)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
