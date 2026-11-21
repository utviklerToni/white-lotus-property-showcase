import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Fixed port: the API's CORS origin (WEB_ORIGIN) expects 5173.
    strictPort: true,
    // The browser calls same-origin /api/...; Vite forwards it to the API.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
