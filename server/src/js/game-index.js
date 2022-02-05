// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue
import { createApp, replayTurn, setupUI } from '@app/js/ui.js'
import {createApp as createVueApp} from 'vue';

import store from '@app/js/store.js';
import box from '@app/js/box.js';

import ErrorScreen from 'components/base-ui/ErrorScreen.vue';

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

async function connectionCallback(response) {
    // Nice UI components for the basic UI

    setupUI(response);

    if (response.status !== 'success') {
        console.log(`[arcadecord] error: ${response.error}`);

        const errorScreen = createVueApp(ErrorScreen, {error: response.error}).mount('#error');
        return;
    }

    const gameType = response.game.typeId;
    document.title = `${response.game.name}`
    let {default: App} = await import(`../components/games/${gameType}/App.vue`);

    const app = createApp(App).mount('#app');

    // Listen for events from the server
    Client.listen();

    window.app = app;
}