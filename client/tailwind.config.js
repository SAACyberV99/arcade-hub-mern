/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        retro: ['"VT323"', 'monospace'],
      },
      colors: {
        neon: {
          pink: '#ff2bd6',
          cyan: '#00fff7',
          green: '#39ff14',
          yellow: '#fff700',
          purple: '#a955ff',
        },
        dark: {
          bg: '#0a0014',
          panel: '#140026',
        },
      },
      boxShadow: {
        'neon-pink': '0 0 5px #ff2bd6, 0 0 15px #ff2bd6, 0 0 30px rgba(255, 43, 214, 0.4)',
        'neon-cyan': '0 0 5px #00fff7, 0 0 15px #00fff7, 0 0 30px rgba(0, 255, 247, 0.4)',
        'neon-green': '0 0 5px #39ff14, 0 0 15px #39ff14, 0 0 30px rgba(57, 255, 20, 0.4)',
        'neon-yellow': '0 0 5px #fff700, 0 0 15px #fff700, 0 0 30px rgba(255, 247, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
