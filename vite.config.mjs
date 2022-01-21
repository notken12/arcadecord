import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import { resolve } from 'path';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import commonjs from '@rollup/plugin-commonjs';

var __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      // Get html files and common.js
      if (file.endsWith('.html') || file.match(/(^.*)common./)) {
        results.push(file);
      }
    }
  });
  return results;
}

const entryPoints = walk(path.resolve(__dirname, 'server/src'));

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
    alias: [
      {
        find: '@app/',
        replacement: `${path.resolve(__dirname, 'server/src')}/`
      },
      {
        find: 'components/',
        replacement: `${path.resolve(__dirname, 'server/src/components')}/`
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm-bundler.js'
      },
      {
        find: 'scss/',
        replacement: `${path.resolve(__dirname, 'server/src/scss')}/`
      },
      { find: /\/gamecommons\/(.*)/, replacement: path.resolve(__dirname, 'server/src/games/types/$1/common.js') },
      {
        find: /^\.\.\/\.\.\/GameFlow/, replacement: path.resolve(__dirname, 'server/src/js/GameFlow')
      }
    ]
  },
  build: {
    rollupOptions: {
      input: entryPoints,
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        format: 'es'
      },
      external: [
        /^server\/src\/games\/types\/(.*)main.(.*)$/
      ],
      plugins: [
        commonjs(),
      ]
    },
    outDir: '../dist',
    emptyOutDir: true,
  }
})
