// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    src: { url: '/' },
    // public: { url: '/', static: true, resolve: false },
  },
  // plugins: ['@snowpack/plugin-typescript'],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    open: 'none',
  },
  buildOptions: {
    out: 'dist',
    sourcemap: true,
    clean: true,
    baseUrl: './',
  },
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2020',
    sourcemap: false,
  },
};
