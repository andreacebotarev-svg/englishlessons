import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // GitHub Pages base URL
  base: '/englishlessons/trainer/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // NO NEED for fs.allow - data is inside trainer/
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
