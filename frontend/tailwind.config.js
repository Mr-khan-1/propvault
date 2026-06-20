/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Outfit', 'sans-serif'],
      },
      colors: {
        vault: {
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1a1a26',
          700: '#252533',
          gold: '#f5c542',
          amber: '#f59e0b',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(245, 197, 66, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(245, 197, 66, 0.4)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(245,197,66,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,197,66,0.03) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,197,66,0.15), transparent)',
      },
    },
  },
  plugins: [],
};
