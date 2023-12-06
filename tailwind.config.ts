import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary' : `rgba(${process.env.NEXT_PUBLIC_BRANDING_PRIMARY}, <alpha-value>)`,
        'primaryHover' : `color-mix(in srgb, white 20%, rgb(${process.env.NEXT_PUBLIC_BRANDING_PRIMARY}))`,
        'primaryHighlight' : `color-mix(in srgb, white 10%, rgb(${process.env.NEXT_PUBLIC_BRANDING_PRIMARY}))`,
        'secondary' : `rgba(${process.env.NEXT_PUBLIC_BRANDING_SECONDARY}, <alpha-value>)`,
        'secondaryHover' : `color-mix(in srgb, white 20%, rgb(${process.env.NEXT_PUBLIC_BRANDING_SECONDARY}))`,
        'secondaryHighlight' : `color-mix(in srgb, white 10%, rgb(${process.env.NEXT_PUBLIC_BRANDING_SECONDARY}))`,
        'drafter1' : 'var(--drafter1)',
        'drafter2' : 'var(--drafter2)',
        'drafter3' : 'var(--drafter3)',
        'drafter4' : 'var(--drafter4)',
        'drafter5' : 'var(--drafter5)',
        'drafter6' : 'var(--drafter6)',
        'drafter7' : 'var(--drafter7)',
        'drafter8' : 'var(--drafter8)',
      },
      fontFamily: {
        source: ['var(--source)', ...fontFamily.sans]
      },
    },
  },
  plugins: [],
}
export default config
