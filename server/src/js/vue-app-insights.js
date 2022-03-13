'use strict'

import { ApplicationInsights } from '@microsoft/applicationinsights-web'

let appInsights

/**
 * Install function passed to Vue.use() show documentation on vue.js website.
 *
 * @param app
 * @param options
 */
export default {
  install: (app, options) => {
    var config = options.appInsightsConfig || {}
    config.instrumentationKey = config.instrumentationKey || options.id

    if (options.appInsights) {
      appInsights = options.appInsights
    } else {
      appInsights = new ApplicationInsights({ config: config })
      appInsights.loadAppInsights()
      if (typeof options.onAfterScriptLoaded === 'function') {
        options.onAfterScriptLoaded(appInsights)
      }
    }

    var router = options.router

    // Watch route event if router option is defined.
    if (router) {
      if (options.trackInitialPageView !== false) {
        setupPageTracking(options, app)
      } else {
        router.onReady(function () {
          return setupPageTracking(options, app)
        })
      }
    }

    app.config.globalProperties.$appInsights = appInsights
  },
}

/**
 * Track route changes as page views with AppInsights
 * @param options
 */
function setupPageTracking(options, app) {
  var router = options.router

  var baseName = options.baseName || '(Vue App)'

  router.beforeEach(function (route, from, next) {
    var name = baseName + ' / ' + route.name
    appInsights.startTrackPage(name)
    next()
  })

  router.afterEach(function (route) {
    var name = baseName + ' / ' + route.name
    var url = location.protocol + '//' + location.host + route.fullPath
    appInsights.stopTrackPage(name, url)
    appInsights.flush()
  })
}
