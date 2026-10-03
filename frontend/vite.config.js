import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'favicon-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/favicon.ico' || req.url === '/favicon.png' || req.url === '/apple-touch-icon.png') {
            const fileName = req.url === '/favicon.ico' ? 'favicon.ico' : 'favicon-32x32.png';
            const filePath = path.resolve(__dirname, 'public', fileName);
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', fileName.endsWith('.ico') ? 'image/x-icon' : 'image/png');
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      }
    }
  ],
  base: process.env.VITE_BASE_PATH || './',
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
    }
  },
  build: {
    outDir: 'static',
    emptyOutDir: true,
  }
});

