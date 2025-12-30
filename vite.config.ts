import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置：
  // - 使用相對路徑 './' 可以適配任何部署路徑（根路徑或子路徑）
  // - 這樣構建後的 HTML 會使用相對路徑引用資源，例如 ./assets/index-xxx.js
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});