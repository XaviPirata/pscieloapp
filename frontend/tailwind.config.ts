import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neumorphism Soft UI - Pastel Palette for Healthcare/Wellness
        neomorphic: {
          // Light background (base)
          bg: '#f5f7fc', // Very light blue-gray
          'bg-secondary': '#ffffff',

          // Soft colors (embossed)
          light: '#ffffff',
          'light-shade': '#f0f2f9',

          // Shadows and depth
          shadow: 'rgba(163, 174, 208, 0.3)',
          'shadow-dark': 'rgba(163, 174, 208, 0.2)',

          // Primary accent (soft rose/pink)
          primary: '#FFD6E0',
          'primary-light': '#ffe8f0',
          'primary-dark': '#ffb3cc',

          // Secondary accent (soft blue)
          secondary: '#D6EAF8',
          'secondary-light': '#e8f4fc',
          'secondary-dark': '#b3daf0',

          // Tertiary accent (soft lavender)
          tertiary: '#EEF2F7',
          'tertiary-light': '#f5f7fc',
          'tertiary-dark': '#dce2ed',

          // Status colors
          success: '#A8E6CF', // Soft green
          warning: '#FFD93D', // Soft yellow
          danger: '#FFB3BA', // Soft red
          info: '#B3E5FC', // Soft cyan
        },

        // Extended pastel colors for more flexibility
        pastel: {
          rose: '#FFD6E0',
          blue: '#D6EAF8',
          purple: '#E8D5F0',
          green: '#D6F5E8',
          yellow: '#FFF4D6',
          orange: '#FFE4D6',
          gray: '#EEF2F7',
        },
      },
      boxShadow: {
        // Neumorphic shadows - driven by CSS variables for dark mode support
        'neomorphic-sm': 'var(--shadow-neomorphic-sm)',
        'neomorphic': 'var(--shadow-neomorphic)',
        'neomorphic-lg': 'var(--shadow-neomorphic-lg)',
        'neomorphic-inset': 'var(--shadow-neomorphic-inset)',

        // Elevation system for modern depth
        'elevate-1': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'elevate-2': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'elevate-3': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'elevate-4': '0 12px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'neomorphic-sm': '12px',
        'neomorphic': '16px',
        'neomorphic-lg': '20px',
      },
      backdropBlur: {
        xs: '2px',
      },
      opacity: {
        8: '0.08',
        12: '0.12',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}

export default config
