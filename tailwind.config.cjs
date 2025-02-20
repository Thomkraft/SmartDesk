/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-purple-500',
    'bg-purple-600',
    'bg-green-500',
    'bg-green-600'
  ],
};
