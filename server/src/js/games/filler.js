// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue
import { createApp } from '@app/js/ui.js'

import App from '@app/components/games/filler/App.vue';
import Loading from '@app/components/base-ui/Loading.vue';

import 'scss/games/filler.scss';
import store from '@app/js/store.js';

// Display a loading screen while we wait for the game to load
const loading = createApp(Loading).mount('#loading');

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

function connectionCallback(response) {
    if (!response.game) return;

    // Nice UI components for the basic UI

    store.state.game = response.game;
    store.state.me = response.discordUser;

    const app = createApp(App).mount('#app');

    // Remove loading screen
    loading.loading = false;
    window.app = app;

    // Receive turn events whenever another player finishes their turn
    Client.socket.on('turn', (game, turn) => {
        // Update the game UI
        // Later we will replace this with a turn animation
        Client.utils.updateGame(app.game, game);

        console.log('Turn received, now the turn is ' + game.turn);
    });

    window.Client = Client;
}