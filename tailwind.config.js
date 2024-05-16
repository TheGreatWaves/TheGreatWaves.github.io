/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "content/**/*.md", 
    "themes/portfolio/layouts/**/*.html",
    "themes/portfolio/assets/**/*.js"
  ],
  darkMode: "class",
  theme: {

    extend: {
      fontFamily: {
        fira: ["Fira Code"],
      },
      boxShadow: {
        'top-highlight': 'inset 0 1px 0 rgba(256, 256, 256, 0.1)'
      },
      spacing: {
        'nav-bar-icon-padding': '0.3rem'

      },
      typography: {
        DEFAULT: {
          css: {
            color: '#cdd6f4',
            a: {
              color: '#3182ce',
              '&:hover': {
                color: '#2c5282',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
}