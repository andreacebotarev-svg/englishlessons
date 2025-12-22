import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    // Base path for GitHub Pages
    base: isProduction ? '/englishlessons/' : '/trainer/',
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      target: 'es2020',
      
      // Optimize chunks
      rollupOptions: {
        output: {
          manualChunks: {
            'ui': [
              './src/shared/ui/Button/Button.ts',
              './src/shared/ui/Card/Card.ts',
              './src/shared/ui/Badge/Badge.ts',
              './src/shared/ui/Progress/Progress.ts',
              './src/shared/ui/Modal/Modal.ts',
            ],
            'entities': [
              './src/entities/dictionary/LessonLoader.ts',
              './src/entities/session/SessionStore.ts',
            ],
          },
        },
      },
    },
    
    // Dev server configuration
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      open: '/trainer/',
      
      // Allow access to data folder
      fs: {
        allow: ['..'],
      },
    },
    
    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    // CSS configuration
    css: {
      devSourcemap: true,
    },
    
    // Optimizations
    optimizeDeps: {
      include: ['zod'],
    },
  };
});
