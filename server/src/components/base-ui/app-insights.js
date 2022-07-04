import { onMounted, inject } from 'vue';

/// Automatically load app insights and track page view on each page
export const useAppInsights = () => {
  const appInsights = inject('appInsights');

  onMounted(() => {
    appInsights.loadAppInsights();
    appInsights.trackPageView();
  });
};
