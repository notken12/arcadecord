/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
      'server/public': '/server/public',
      'server/src': '/server/dist',
    },
    plugins: [
      '@snowpack/plugin-vue',
      [
        '@snowpack/plugin-sass',
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
      /* ... */
    },
    buildOptions: {
      out: "build"
    },
  };
  