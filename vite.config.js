import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        demo: 'camera-demo.html'
      }
    }
  },
  server: {
    port: 3000,
    open: '/camera-demo.html'
  }
});
