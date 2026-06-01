import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// ย้ายโฟลเดอร์ build ไปที่ root ตรงๆ เพื่อไม่ให้ Vercel หาไฟล์สไตล์พรีเมียมไม่เจอ
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});
