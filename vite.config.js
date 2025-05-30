import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import fs from 'fs'


// https://vite.dev/config/
export default defineConfig({
  
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    strictPort: true,
    https:{ 
      key: fs.readFileSync(path.resolve(__dirname, 'cert/172.22.67.71+1-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert/172.22.67.71+1.pem')),
    },
    cors: {origin: '*'}
  },
});
