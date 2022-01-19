// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue
import * as Vue from 'vue';

import { GameView } from '@app/js/ui.js'

import bus from '@app/js/vue-event-bus.js';

import 'scss/games/8ball.scss';

import { createProject } from './Scene.ts';

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

function connectionCallback(response) {
    if (!response.game) return;

    // Nice UI components for the basic UI


    const App = {
        data() {
            return {
                game: response.game,
                me: response.discordUser,
            }
        },
        computed: {
            hint() {
                return 'Tap a color to switch to that color';
            }
        },
        components: {
            GameView,
        },
        async mounted() {
            // Create the scene
            var project = await createProject();
            this.$refs.canvasContainer.appendChild(project.canvas);

            const resize = () => {
                var container = this.$refs.canvasContainer.getBoundingClientRect();
                const newWidth = container.width;
                const newHeight = container.height;

                project.renderer.setSize(newWidth, newHeight)
                project.camera.aspect = newWidth / newHeight
                project.camera.updateProjectionMatrix()
            }

            window.onresize = resize
            resize()
        }
    }

    const app = Vue.createApp(App).mount('#app');
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