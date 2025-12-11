import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'three-addons': ['three/examples/jsm/utils/BufferGeometryUtils'],
          'gsap': ['gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['three', 'gsap'],
  },
  plugins: [
    compression({ algorithm: 'brotliCompress' }),
  ],
  server: {
    port: 3000,
    open: '/camera-demo.html'
  }
});
