import { createSSRApp, h } from 'vue'
import { createStore } from '../js/box.js'

export { createApp }

function createApp({ Page }) {
    const app = createSSRApp({
        render: () => h(Page),
    })
    const store = createStore()
    app.use(store)
    return { app, store }
}