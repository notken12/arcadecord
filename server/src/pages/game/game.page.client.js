import { getPage } from 'vite-plugin-ssr/client'
import { createApp } from '../../renderer/app.js'

// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue

hydrate()

async function hydrate() {
    // We do Server Routing, but we can also do Client Routing by using `useClientRouter()`
    // instead of `getPage()`, see https://vite-plugin-ssr.com/useClientRouter
    const pageContext = await getPage()
    const { app } = createApp(pageContext)
    app.mount('#app')

    // Get game ID from URL address

    var gameId = Client.utils.getGameId(window.location);

    // Connect the socket to the server

    await Client.useOnClient();

    Client.connect(gameId, connectionCallback);

    async function connectionCallback(response) {
        // Nice UI components for the basic UI
        // No need to setup UI for the client, we are using SSR
        // app.$store.commit('SETUP', response)

        // Listen for events from the server
        Client.socket.on('turn', (game, turn) => {
            // Update the game UI
            app.$store.commit('UPDATE_GAME', game);
            // Replay the turn
            app.$store.commit('REPLAY_TURN');

            console.log('[arcadecord.socket] turn received, now the turn is ' + game.turn);
        });

        window.app = app;
    }
}
