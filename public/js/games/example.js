import * as Client from '/public/js/client-framework.js';
import * as UI from '/public/js/ui.js';

var gameId = Client.utils.getGameId(window.location);

Client.connect(gameId, connectionCallback);

function connectionCallback(response) {
    if (!response.game) return;

    const App = {
        data() {
            return {
                game: response.game,
                me: response.discordUser
            }
        }
    }
}