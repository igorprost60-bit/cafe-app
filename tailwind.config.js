/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        card: '#ffffff',
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        muted: '#64748b',
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
