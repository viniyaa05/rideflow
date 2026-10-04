/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tamil Nadu Authentic Transit Signature Palette
        rickshaw: {
          DEFAULT: '#C9501F',
          hover: '#B24217',
          light: '#E56635',
          50: '#FDF4EF',
          100: '#FBE4D8',
        },
        marina: {
          DEFAULT: '#0B5D52',
          hover: '#08483F',
          light: '#13796B',
          50: '#EDF7F5',
          100: '#D5ECE8',
        },
        asphalt: {
          DEFAULT: '#1E1B16',
          dark: '#13110E',
          card: '#27231D',
          border: '#3D372F',
          muted: '#6B6355',
          subtle: '#8C8373',
        },
        sand: {
          DEFAULT: '#F6EFE2',
          light: '#FAF6EE',
          card: '#FDFCFA',
          border: '#E8DCB2',
          dark: '#EADFCF',
        },
        temple: {
          DEFAULT: '#D9A441',
          hover: '#C29033',
          light: '#E9BA5D',
          50: '#FDF9F0',
        },
        kolam: {
          DEFAULT: '#B23A2E',
          hover: '#982F24',
          light: '#D34D3F',
          50: '#FDF3F2',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        slate: {
          850: '#151f33',
          900: '#0f172a',
          950: '#080d1a'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'Playfair Display', 'Georgia', 'serif'],
        tamil: ['Noto Sans Tamil', 'Mukta Malar', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
