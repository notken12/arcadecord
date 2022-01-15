// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue
import * as Vue from 'vue';

import { GameView } from '@app/js/ui.js'

import Board from '@app/components/games/filler/Board.vue';

import Changer from '@app/components/games/filler/Changer.vue';

import bus from '@app/js/vue-event-bus.js';

import 'scss/games/filler.scss';

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

function connectionCallback(response) {
    if (!response.game) return;

    // Nice UI components for the basic UI


    const App = {
        data() {
            var board = response.game.data.board;

            return {
                game: response.game,
                me: response.discordUser,
                board: board
            }
        },
        components: {
            GameView,
            Board,
            Changer,
        },
        mounted() {
            bus.on('switch colors', (data) => { // data is a local var that has the data that was transmitted
                Client.runAction(this.game, 'switchColors', data); // data contains the targetColor, which is the action data
            });
        }
    }

    const app = Vue.createApp(App).mount('#app');
    window.app = app;

    // Receive turn events whenever another player finishes their turn
    Client.socket.on('turn', (game, turn) => {
        // Update the game UI
        // Later we will replace this with a turn animation
        Client.utils.updateGame(app.game, game);
    });
}