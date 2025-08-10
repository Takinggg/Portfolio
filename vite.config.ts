import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['better-sqlite3', 'sqlite3', 'express', 'cors', 'bcryptjs', 'jsonwebtoken'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'better-sqlite3', 'sqlite3'],
    include: ['react', 'react-dom']
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false
    }
  }
});
