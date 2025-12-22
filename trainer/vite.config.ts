import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/trainer/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/widgets': path.resolve(__dirname, './src/widgets'),
      '@/entities': path.resolve(__dirname, './src/entities'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },

  server: {
    fs: {
      allow: ['..'], // Allow access to /data folder
    },
    open: true,
    port: 5173,
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['zod'],
        },
      },
    },
    
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
    },
  },

  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
