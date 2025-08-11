import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false, // Disable sourcemaps for production builds
    minify: 'esbuild', // Use esbuild for faster minification
    rollupOptions: {
      external: ['better-sqlite3', 'sqlite3', 'express', 'cors', 'bcryptjs', 'jsonwebtoken'],
      treeshake: 'recommended',
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
          supabase: ['@supabase/supabase-js'],
          animation: ['framer-motion', 'lottie-react'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          ui: ['react-modal', 'react-hot-toast']
        },
        // Improve cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false // Disable gzip reporting for faster builds
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'better-sqlite3', 'sqlite3'],
    include: ['react', 'react-dom', 'react/jsx-runtime']
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false
    }
  },
  // Improve development performance
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
