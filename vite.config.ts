// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
