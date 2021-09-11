const esbuild = require('esbuild');
const postCssPlugin = require('esbuild-postcss');
const fs = require('fs');
const fsExtra = require('fs-extra');

const production = process.env.NODE_ENV === 'production';
const devServerPort = 8081;

const esbuildConfig = {
  logLevel: 'info',
  entryPoints: ['./src/index.tsx'],
  outdir: './dist',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  format: 'esm',
  bundle: true,
  target: 'es2020',
};

if (production) {
  esbuildConfig.minify = true;
  esbuild.build(esbuildConfig).catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  esbuildConfig.sourcemap = 'inline';
  esbuild
    .serve({ servedir: esbuildConfig.outdir, port: devServerPort }, esbuildConfig)
    .then(() => {
      console.log(`Serving at http://localhost:${devServerPort}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

// copy html file
fs.copyFileSync('./src/index.html', './dist/index.html');

// copy shaders
fsExtra.copySync('./src/shaders', './dist/shaders');
