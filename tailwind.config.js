/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // фиолетовый (современно)
        primaryDark: '#4f46e5',
        accent: '#22c55e', // зелёный (действия)
        background: '#f8fafc',
        card: '#ffffff',
        muted: '#64748b',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.06)',
        card: '0 4px 20px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
