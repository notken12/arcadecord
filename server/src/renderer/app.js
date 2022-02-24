import { createSSRApp, h } from 'vue'

export { createApp }

function createApp(pageContext) {
    const app = createSSRApp({
        render: () => h(pageContext.Page),
    })
    app.provide('pageContext', pageContext)
    return { app }
}