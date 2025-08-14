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
      colors: {
        spiler: {
          primary: '#6366f1',
          'primary-dark': '#4f46e5',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          dark: '#0f0f23',
          darker: '#0a0a1a',
          light: '#1a1a2e',
          lighter: '#16213e',
          text: '#e2e8f0',
          'text-muted': '#94a3b8',
          border: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'gradient': 'gradient 3s ease infinite',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'slide-in-up': 'slide-in-up 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
        'loading': 'loading 1.5s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(99, 102, 241, 0.3)'
          },
          '50%': {
            'box-shadow': '0 0 40px rgba(99, 102, 241, 0.3)'
          }
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'slide-in-left': {
          'from': {
            'transform': 'translateX(-100%)',
            'opacity': '0'
          },
          'to': {
            'transform': 'translateX(0)',
            'opacity': '1'
          }
        },
        'slide-in-right': {
          'from': {
            'transform': 'translateX(100%)',
            'opacity': '0'
          },
          'to': {
            'transform': 'translateX(0)',
            'opacity': '1'
          }
        },
        'slide-in-up': {
          'from': {
            'transform': 'translateY(100%)',
            'opacity': '0'
          },
          'to': {
            'transform': 'translateY(0)',
            'opacity': '1'
          }
        },
        'fade-in': {
          'from': {
            'opacity': '0',
            'transform': 'translateY(20px)'
          },
          'to': {
            'opacity': '1',
            'transform': 'translateY(0)'
          }
        },
        'loading': {
          '0%': { 'left': '-100%' },
          '100%': { 'left': '100%' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.3)',
        'spiler': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'spiler-lg': '0 12px 40px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}