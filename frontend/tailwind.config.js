// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // colors: {
      //   'zoo-green': {
      //     50: '#f0fdf4',
      //     100: '#dcfce7',
      //     200: '#bbf7d0',
      //     300: '#86efac',
      //     400: '#4ade80',
      //     500: '#22c55e',
      //     600: '#16a34a',
      //     700: '#15803d',
      //     800: '#166534',
      //     900: '#14532d',
      //   },
      // },
      fontFamily: {
        'roboto-flex': ['"Roboto Flex"', 'sans-serif'],
        'mukta': ['"Mukta Mahee"', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      },
      backgroundImage: {
        'jungle-pattern': "url('https://placehold.co/1920x1080/005500/FFFFFF?text=Jungle+Background')",
      },
      height: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}