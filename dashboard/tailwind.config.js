/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {        
        'score-excellent': '#10b981',
        'score-good': '#3b82f6',
        'score-fair': '#f59e0b',
        'score-poor': '#ef4444',
      },
    },
  },
  plugins: [],
}