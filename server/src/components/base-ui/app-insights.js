// app-insights.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { onMounted, inject } from 'vue';

/// Automatically load app insights and track page view on each page
export const useAppInsights = () => {
  const appInsights = inject('appInsights');

  onMounted(() => {
    appInsights.loadAppInsights();
    appInsights.trackPageView();
  });
};
