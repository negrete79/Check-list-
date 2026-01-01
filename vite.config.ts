
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Se o seu repositório for "nome-do-usuario.github.io", mude o base para '/'
  // Se for "nome-do-usuario.github.io/meu-app", mude para '/meu-app/'
  base: './', 
  plugins: [react()],
  build: {
    outDir: 'dist',
  }
});
