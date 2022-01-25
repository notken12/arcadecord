import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import { resolve } from 'path';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { visualizer } from 'rollup-plugin-visualizer';
import graph from 'rollup-plugin-graph';
import brotli from "rollup-plugin-brotli";

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
  optimizeDeps: {
    exclude: [
      '@enable3d/ammo-physics',
    ]
  },
  build: {
    rollupOptions: {
      input: entryPoints,
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        format: 'es',
        manualChunks: {
          enable3d: ['enable3d'],
          three: ['three'],
        }
      },
      external: [
        /^server\/src\/games\/types\/(.*)main.(.*)$/
      ],
    },
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [
    vue(),
    commonjs({
      dynamicRequireTargets: [
      ],
      transformMixedEsModules: true,
    }),
    babel({ babelHelpers: 'bundled' }),
    brotli(/*{
      asset: '[path].br[query]',
			test: /\.(js|css|html|svg)$/,
			threshold: 10240,
			minRatio: 0.8
    }*/),
    visualizer({
      template: 'network'
    }),
    /*graph({
      prune: true
    })*/
  ]
})
