import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works on GitHub Pages
// whether the repo is yaraio.github.io or a project repo like /portfolio.
export default defineConfig({
  plugins: [react()],
  base: './',
});
