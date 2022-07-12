import { defineNuxtConfig } from 'nuxt';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    botClientId: '',
    webServerUrl: '',
  },
  modules: [
    // Simple usage
    [
      '@nuxtjs/google-adsense',
      {
        id: 'ca-pub-9949308515923091',
      },
    ],
  ],
});
