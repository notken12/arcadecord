import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { fileURLToPath } from 'url';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  root: './server/src',
  plugins: [vue()],
  base: '/dist/',
  publicDir: 'public',
  server: {
    port: 5000
  },
  resolve: {
    alias: {
      '@app/': `${path.resolve(__dirname, 'server/src')}/`,
      'components/': `${path.resolve(__dirname, 'server/src/components')}/`,
      'vue': 'vue/dist/vue.esm-bundler.js',
      'scss/': `${path.resolve(__dirname, 'server/src/scss')}/`,
    },
  }
})
