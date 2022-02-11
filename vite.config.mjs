import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import { resolve } from 'path';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { visualizer } from 'rollup-plugin-visualizer';
import graph from 'rollup-plugin-graph';
import brotli from "rollup-plugin-brotli";
import handlebars from 'vite-plugin-handlebars';

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
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else {
      /* Is a file */
      // Get html files and common.js
      if (file.endsWith('.html')/*  || file.match(/(^.*)common./) */) {
        results.push(file);
      }
    }
  });
  return results;
}

const entryPoints = walk(path.resolve(__dirname, 'server/src'));

const nonSharedModules = ['enable3d', 'three'];

const { dependencies } = JSON.parse(fs.readFileSync('./package.json'));
const nodeDependencies = Object.keys(dependencies);
const sharedModules = [];

for (let key of nodeDependencies) {
  if (nonSharedModules.includes(key)) {
    continue;
  }
  sharedModules.push(key);
}

// https://vitejs.dev/config/
export default defineConfig({
  root: './server/src',
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
        find: 'scss/',
        replacement: `${path.resolve(__dirname, 'server/src/scss')}/`
      },
      {
        find: /\/gamecommons\/(.*)/,
        replacement: path.resolve(__dirname, 'server/src/games/types/$1/common.js')
      },
      {
        find: /^\.\.\/\.\.\/GameFlow/, replacement: path.resolve(__dirname, 'server/src/js/GameFlow')
      }
    ]
  },
  build: {
    rollupOptions: {
      input: 'server/src/game-index.html',
      output: {
        format: 'es',
        manualChunks(id) {
          // add shared modules to the vendor chunk
          if (id.includes('node_modules')) {
            for (let i = 0; i < sharedModules.length; i++) {
              if (id.includes(sharedModules[i])) {
                return 'vendor';
              }
            }
            for (let i = 0; i < nonSharedModules.length; i++) {
              if (id.includes(nonSharedModules[i])) {
                return nonSharedModules[i];
              }
            }
          }
        }
        //sourcemap: true,
      },
      external: [
        /server\/src\/games\/types\/(.*)main.(.*)$/,
        /server\/src\/games\/([^\/]*)$/,
      ],
    },
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [
    vue(),
    commonjs({
      transformMixedEsModules: true,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    handlebars({
      context(pagePath) {
        let data = pageData[pagePath];
        if (data) {
          let aliases;
          if (typeof data.aliases === 'object') {
            aliases = (data.aliases.join(' ') + ' ' + data.name).toLowerCase();
          } else {
            aliases = data.name.toLowerCase();
          }
          return {
            metaTemplate:
              `
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link rel="preconnect" href="https://cdn.discordapp.com">
              <meta name="theme-color" content="${data.color || '#0063ff'}">
              <meta name="description" content="${data.description || ''}">
              <meta name="keywords" content="${aliases}">
            `
          }
        }
      }
    }),
    brotli(),
    visualizer({
      template: 'treemap'
    }),
    /*graph({
      prune: true
    })*/
  ]
})
