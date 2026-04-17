/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        text: '#e2e8f0',
        muted: '#94a3b8',
        accent: '#6366f1',
      },
    },
  },
  plugins: [],
};