// game.page.client.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { getPage } from 'vite-plugin-ssr/client';
import { createApp } from '@app/renderer/gameApp.js';

// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue
import { reactive, watchEffect } from 'vue';

hydrate();

async function hydrate() {
  // We do Server Routing, but we can also do Client Routing by using `useClientRouter()`
  // instead of `getPage()`, see https://vite-plugin-ssr.com/useClientRouter
  const pageContext = await getPage();
  // pageContext.INITIAL_STATE = reactive(pageContext.INITIAL_STATE);

  const { app, store } = createApp(pageContext);
  pageContext.INITIAL_STATE.game = await Client.utils.setUpGame(
    pageContext.INITIAL_STATE.game
  );
  pageContext.INITIAL_STATE.realGame = await Client.utils.setUpGame(
    pageContext.INITIAL_STATE.realGame
  );
  store.replaceState(pageContext.INITIAL_STATE);
  store.commit('SETUP');
  // store.commit('REPLAY_TURN');
  app.mount('#app');

  // Get game ID from URL address

  var gameId = Client.utils.getGameId(window.location);

  // Connect the socket to the server

  await Client.useOnClient();

  Client.connect(gameId, connectionCallback);

  async function connectionCallback(response) {
    // Nice UI components for the basic UI
    // No need to setup UI for the client, we are using SSR
    store.commit('SETUP', response);
    // store.commit('REPLAY_TURN');

    // Listen for events from the server
    Client.socket.on('turn', (game, turn) => {
      // Update the game UI
      store.commit('UPDATE_GAME', game);
      // Replay the turn
      store.commit('REPLAY_TURN');

      console.log(
        '[arcadecord.socket] turn received, now the turn is ' + game.turn
      );
    });

    // When other players disconnect, receive contested state updates from the server
    // Server will let client know they get the free spot when multiple players are trying to play the first turn
    Client.socket.on('contested', (contested) => {
      // Update store's contested
      store.commit('UPDATE_CONTESTED', contested);
    });

    window.app = app;
  }
}
