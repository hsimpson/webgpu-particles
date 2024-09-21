// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8082,
    host: '0.0.0.0',
  },
  build: {
    minify: true,
  },
  base: '',
});
