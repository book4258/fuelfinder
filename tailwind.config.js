/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        thai: ['Sarabun', 'sans-serif'],
      },
      colors: {
        fuel: {
          diesel:  '#3B82F6',
          g91:     '#F59E0B',
          g95:     '#10B981',
          e20:     '#8B5CF6',
          e85:     '#EC4899',
          lpg:     '#06B6D4',
        },
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      animation: {
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
        'ping-slow':  'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-sm':  'bounceSm 0.6s ease-out',
      },
      keyframes: {
        slideUp:  { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        fadeIn:   { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        bounceSm: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06)',
        'card-lg': '0 4px 6px rgba(0,0,0,.05), 0 20px 40px rgba(0,0,0,.10)',
        'fuel':    '0 0 0 3px rgba(249,115,22,.3)',
      },
    },
  },
  plugins: [],
};
