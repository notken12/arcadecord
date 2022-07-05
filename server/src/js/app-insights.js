// app-insights.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { ApplicationInsights } from '@microsoft/applicationinsights-web';

export const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      'InstrumentationKey=54ef4b41-2e52-4be2-bf3f-02471829b486;IngestionEndpoint=https://eastus-1.in.applicationinsights.azure.com/',
    /* ...Other Configuration Options... */
  },
});
