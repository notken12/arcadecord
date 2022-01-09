// Import client-framework.js, which you need to connect to the server
import * as Client from '../client-framework.js';

// Nice UI components for the basic UI
import * as UI from '../ui.js';

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

function connectionCallback(response) {
    if (!response.game) return;
    
    const App = {
        data() {
            return {
                game: response.game,
                me: response.discordUser
            }
        },
        components: {
            'game-view': UI.GameView
        },
        computed: {
            hint() {
                return '';
            }
        }
    };

    const app = Vue.createApp(App).mount('#app');
    window.app = app;

    // Receive turn events whenever another player finishes their turn
    Client.socket.on('turn', (game, turn) => {
        // Update the game object
        Client.utils.updateGame(app.game, game);
    });
}