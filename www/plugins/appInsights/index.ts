import { appInsights } from './appInsights';
import vueAppInsights from './vueAppInsights';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(vueAppInsights, { appInsights });
});
