/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  safelist: [
    'bg-teal-50', 'bg-indigo-50', 'bg-rose-50',
    'text-teal-600', 'text-indigo-600', 'text-rose-600',
    'bg-teal-600', 'bg-indigo-600', 'bg-rose-600',
    'hover:bg-teal-700', 'hover:bg-indigo-700', 'hover:bg-rose-700'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

