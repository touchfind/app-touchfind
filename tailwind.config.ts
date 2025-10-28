import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Keyframes/animations úteis para componentes UI
      keyframes: {
        'accordion-down': { 
          from: { height: '0' }, 
          to: { height: 'var(--radix-accordion-content-height)' } 
        },
        'accordion-up': { 
          from: { height: 'var(--radix-accordion-content-height)' }, 
          to: { height: '0' } 
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
}

export default config