/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#14141f',
        border: '#2a2a3a',
        text: '#e8e8e8',
        muted: '#6a7a6a',
        accent: '#39ff14',
        'accent-cyan': '#00f0ff',
        'accent-magenta': '#ff2e63',
        danger: '#ff2e63',
      },
      fontFamily: {
        display: ['"Press Start 2P"', 'monospace'],
        body: ['VT323', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};