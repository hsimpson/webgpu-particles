import react from '@vitejs/plugin-react';
import path from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8082,
    host: '0.0.0.0',
  },
  root: 'src',
  publicDir: '../public',
  build: {
    minify: true,
    outDir: '../dist',
  },
  resolve: {
    alias: { '/src': path.resolve(process.cwd(), 'src') },
  },
  base: '',
});
