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
import ssr from 'vite-plugin-ssr/plugin'
import { esbuildCommonjs, viteCommonjs } from "@originjs/vite-plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cjs from "rollup-plugin-cjs-es";

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
  if (dir.endsWith('/games/types')) return results;
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

const nonSharedModules = ['enable3d', 'three', 'three-to-cannon', 'cannon-es', 'troisjs', 'cannon-es-debugger'];

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
  root: path.resolve(__dirname, 'server/src'),
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
      },
    ]
  },
  build: {
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks(id) {
          // add shared modules to the vendor chunk
          console.log(id)
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
        /.test.[jt]sx?$/,
        'encoding',
      ],
    },
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(["node-fetch"])],  // the problematic cjs module
    },
    include: ["node-fetch"],  // also here
  },
  plugins: [
    // nodeResolve(),
    commonjs({
      transformMixedEsModules: true
    }),
    vue(),
    babel({
      babelHelpers: 'bundled',
      // exclude: 'node_modules/**'
    }),
    ssr(),
    // commonjs({
    //   transformMixedEsModules: true,
    // }),
    // cjs({
    //   nested: true
    // }),
    brotli(),
    visualizer({
      template: 'treemap'
    }),
    /*graph({
      prune: true
    })*/
  ],
  // Peeky config
  test: {
    // Use the DOM environment for all tests by default
    runtimeEnv: 'dom',
  },
})
