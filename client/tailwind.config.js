/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-blue': '#0B1426',
        'nebula-purple': '#6B46C1',
        'star-gold': '#F59E0B',
        'planet-green': '#10B981',
        'asteroid-gray': '#6B7280',
        'cosmic-indigo': '#4F46E5',
      },
      fontFamily: {
        'space': ['Orbitron', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #6B46C1, 0 0 10px #6B46C1, 0 0 15px #6B46C1' },
          '100%': { boxShadow: '0 0 10px #6B46C1, 0 0 20px #6B46C1, 0 0 30px #6B46C1' },
        }
      }
    },
  },
  plugins: [],
}
