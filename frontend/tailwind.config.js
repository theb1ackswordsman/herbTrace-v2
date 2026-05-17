/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0c160e',
        'surface-dim': '#0c160e',
        'surface-bright': '#323c32',
        'on-surface': '#dae6d8',
        'surface-variant': '#2d372e',
        'outline': '#849585',
        'primary': '#f1ffef',
        'primary-fixed': '#60ff99',
        'primary-container': '#00ff88',
        'secondary': '#ffb95f',
        'error': '#ffb4ab',
        brand: {
          dark: '#0D1F0F',
          surface: '#1A2E1C',
          green: '#00FF88',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        'glass': '16px',
      }
    },
  },
  plugins: [],
}
