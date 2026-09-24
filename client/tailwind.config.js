/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14161A',
          light: '#43464D',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          surface: '#F6F6F4',
          dark: '#0B0C0E',
          'dark-surface': '#16181C',
        },
        emerald: {
          DEFAULT: '#0E6B4C',
          soft: '#12805B',
          deep: '#0A4F39',
        },
        gold: {
          DEFAULT: '#B98D34',
          soft: '#D4AD5C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1240px',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
