import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env': {},
  },
  base: '/glpi_auto/frontend/build/',
  build: {
    outDir: 'build',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
  },
});
