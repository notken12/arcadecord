/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mode: 'development',
  mount: {
    'server/public': '/dist',
    'server/src': '/dist',
  },
  plugins: [
    '@snowpack/plugin-vue',
    [
      './plugin-sass-fix.cjs',
      {
        // https://www.npmjs.com/package/@snowpack/plugin-sass
      }
    ]
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {

  },
  devOptions: {
    open: 'none',
    output: "stream"
  },
  buildOptions: {
    out: "build",
    cacheDirPath: './node_modules/.cache/snowpack'
  },
};
