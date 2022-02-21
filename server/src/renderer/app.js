import { createSSRApp, h } from 'vue'

export { createApp }

function createApp({ Page }) {
    const app = createSSRApp({
        render: () => h(Page),
    })
    return { app }
}