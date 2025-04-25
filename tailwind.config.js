/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // SuccessMessage component
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'checkmark': 'checkmark 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        checkmark: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      colors: {
        'gold': {
          DEFAULT: '#8A7D55',
          'light': '#F2E6D5',
          'dark': '#7D7049',
        },
      },
    },
  },
  plugins: [],
}