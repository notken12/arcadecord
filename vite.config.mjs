import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import { resolve } from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

async function* getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      // get .html files only
      if (res.endsWith('.html')) {
        yield res;
      }
    }
  }
}

var walk = function (dir) {
  // Get all .html files
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = dir + '\\' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else {
      /* Is a file */
      // get .html files only
      if (file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}

const entryPoints = walk(path.resolve(__dirname, 'server'));
console.log(entryPoints)

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
  },
  build: {
    rollupOptions: {
      input: entryPoints
    }
  }
})
