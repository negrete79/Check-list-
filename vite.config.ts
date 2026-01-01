
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Isso garante que o app funcione tanto em domínios próprios quanto em subpastas do github (ex: usuario.github.io/projeto/)
  base: './', 
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});
