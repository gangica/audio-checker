// /tailwind.config.js
module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}