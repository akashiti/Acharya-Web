/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: '#3A183C',
          dark: '#2A0F2C',
          light: '#4E2450',
        },
        purple: {
          DEFAULT: '#662F68',
          light: '#7D4580',
          dark: '#4E2450',
        },
        sand: {
          DEFAULT: '#E1D6C6',
          light: '#E6DDCF',
          dark: '#D4C7B3',
        },
        earth: {
          DEFAULT: '#603838',
          light: '#7A4F4F',
          dark: '#4A2A2A',
        },
        ivory: {
          DEFAULT: '#FFF8F0',
          dark: '#F5EDDF',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#D4BA85',
          dark: '#B89555',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(58, 24, 60, 0.08), 0 10px 20px -2px rgba(58, 24, 60, 0.04)',
        'card': '0 4px 25px -5px rgba(58, 24, 60, 0.1), 0 10px 30px -5px rgba(58, 24, 60, 0.06)',
        'elevated': '0 10px 40px -10px rgba(58, 24, 60, 0.15), 0 20px 50px -15px rgba(58, 24, 60, 0.08)',
        'glow': '0 0 30px rgba(102, 47, 104, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'logo-breathe': 'logoBreathe 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        logoBreathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
