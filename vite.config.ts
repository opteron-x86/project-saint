import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
<<<<<<< HEAD
<<<<<<< HEAD
    react(),
=======
    react({
      fastRefresh: false,
    }),
>>>>>>> a380730 (Initial deployment)
=======
    react(),
>>>>>>> 946a95a (Fixed endpoints)
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        target: 'https://x2uroi2lm5.execute-api.us-gov-east-1.amazonaws.com/v2',
=======
        target: 'http://192.168.10.218:8000',
>>>>>>> a380730 (Initial deployment)
=======
        target: 'http://192.168.10.104:8000', // Real API endpoint http://192.168.10.104:8000 - can use http://localhost:8000 for local dev
>>>>>>> 23a6656 (Feature/issue creator)
=======
        target: 'https://2dqfntrf03.execute-api.us-gov-west-1.amazonaws.com/v2', // Real API endpoint http://192.168.10.104:8000 - can use http://localhost:8000 for local dev
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
=======
        target: 'https://x2uroi2lm5.execute-api.us-gov-east-1.amazonaws.com/v2',
>>>>>>> 37ba2d8 (Initial commit)
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37ba2d8 (Initial commit)
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ['@mui/material', '@mui/icons-material'],
          react: ['react', 'react-dom'],
          charts: ['recharts', '@mui/x-charts'],
        },
      },
    },
    sourcemap: false, // Disable in production
<<<<<<< HEAD
=======
>>>>>>> a380730 (Initial deployment)
=======
>>>>>>> 37ba2d8 (Initial commit)
  },
});