// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue
import { createApp, replayTurn, setupUI } from '@app/js/ui.js'
import {createApp as createVueApp} from 'vue';

import Loading from '@app/components/base-ui/Loading.vue';

import 'scss/games/filler.scss';
import store from '@app/js/store.js';
import box from '@app/js/box.js';

// Display a loading screen while we wait for the game to load
const loadingView = createVueApp(Loading).mount('#loading');

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

async function connectionCallback(response) {
    // Nice UI components for the basic UI

    store.setup(response);
    const gameType = response.game.typeId;
    document.title = `${response.game.name}`
    let {default: App} = await import(`../components/games/${gameType}/App.vue`);

    const app = createApp(App).mount('#app');
    loadingView.loading = false;

    // Listen for events from the server
    Client.listen();

    window.app = app;
}