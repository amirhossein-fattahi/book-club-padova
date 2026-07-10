import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Warm, library-inspired palette
        ink: '#2b2320',
        parchment: '#f7f3ec',
        clay: {
          50: '#faf6f1',
          100: '#f2e8dd',
          200: '#e4d0bb',
          300: '#d3b191',
          400: '#c08f66',
          500: '#a9714a',
          600: '#8f5a39',
          700: '#73472f',
          800: '#5c3a29',
          900: '#4b3123'
        },
        forest: {
          500: '#3f6b57',
          600: '#325745',
          700: '#284636'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(43,35,32,0.06), 0 8px 24px rgba(43,35,32,0.08)'
      }
    }
  },
  plugins: []
};

export default config;
