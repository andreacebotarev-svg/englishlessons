import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Базовый URL для eng-tutor.ru/trainer/
  base: '/trainer/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    fs: {
      // Разрешаем доступ к папке data на 2 уровня выше
      allow: ['..'],
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
