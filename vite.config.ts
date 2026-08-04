import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
    target: 'esnext'
  },
  server: {
    port: 3000,
    open: true
  }
});
