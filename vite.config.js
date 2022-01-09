import vue from "@vitejs/plugin-vue";
import { join, parse, resolve } from "path";
import path from 'path';
import { defineConfig } from 'vite'
import fs from 'fs';

// get __dirname
import { fileURLToPath } from 'url';

var filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
var dirname = path.dirname(filename);

function fromDir(startPath, filter, callback) {

  //console.log('Starting from dir '+startPath+'/');

  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter, callback); //recurse
    }
    else if (filter.test(filename)) callback(filename);
  };
}

function entryPoints(...paths) {
  const entries = paths.map(parse).map(entry => {
    const { dir, base, name, ext } = entry;
    const key = join(dir, name);
    const path = resolve(dirname, dir, base);
    return [key, path];
  });

  const config = Object.fromEntries(entries);
  return config;
}

var htmlFiles = [];

fromDir('server', /\.html$/, function (filename) {
  console.log('-- found: ', filename);
  htmlFiles.push(filename);
});

// https://vitejs.dev/config/
export default defineConfig({
  // generate manifest.json in outDir
  manifest: true,
  rollupOptions: {
    // overwrite default .html entry
    input: entryPoints(...htmlFiles)
  },
  plugins: [
    vue(),
    /*mix({
      handler: '/server/index.js',
    }),*/
  ]
})

