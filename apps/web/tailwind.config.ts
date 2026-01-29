import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F1F2E',
        sand: '#F5F3EE',
        stone: '#C8C1B8',
        amber: '#F4B860',
        teal: '#4FA3A5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(15, 31, 46, 0.08)',
        'medium': '0 4px 16px rgba(15, 31, 46, 0.12)',
      },
    },
  },
  plugins: [],
}
export default config
