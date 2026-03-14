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
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        nexa: {
          pay: { DEFAULT: '#0d9488', light: '#5eead4', dark: '#0f766e' },
          go: { DEFAULT: '#0891b2', light: '#67e8f9', dark: '#0e7490' },
          stays: { DEFAULT: '#4f46e5', light: '#a5b4fc', dark: '#4338ca' },
        },
      },
      borderRadius: {
        'nexa': '0.625rem',
        'nexa-lg': '0.75rem',
      },
      boxShadow: {
        'nexa': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'nexa-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
