module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.html', './src/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      textColor: ['visited'],
    },
  },
  plugins: [],
};
