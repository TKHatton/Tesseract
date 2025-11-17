/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        phase1Bg: '#0a0a0f',
        phase2Start: '#1a2f5f',
        phase2End: '#2d5f4f',
        phase3Bg: '#0a0a1a',
        cosmicGold: '#FFD700',
        cosmicAmber: '#FFAA00',
        electricBlue: '#00BFFF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 1 },
        },
        floatSlow: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
        floatSlow: 'floatSlow 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
