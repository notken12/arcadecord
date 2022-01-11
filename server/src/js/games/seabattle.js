import * as Client from '../client-framework.js';

// base ui vue components
import {GameView} from '../ui.js';

import Common from '/gamecommons/seabattle';

import * as Vue from 'vue/dist/vue.cjs.prod.js';

import bus from '../vue-event-bus.js';

// import vue components
import ShipPlacer from '@app/components/games/seabattle/ShipPlacer.vue';
import HitBoardView from '@app/components/games/seabattle/HitBoardView.vue';

function getMyHitBoard(game) {
    var index = game.myIndex;
    if (index == -1) {
        if (game.isItUsersTurn(undefined, index)) {
            // game hasn't started yet but i can start the game by placing ships
            index = game.turn; //dog
        }
    }

    var myHitBoard = game.data.hitBoards[index];

    return myHitBoard;
}


function connectionCallback(response) {
    var game = response.game;
    window.game = game;

    var discordUser = response.discordUser;
    window.discordUser = discordUser;


    var myHitBoard = getMyHitBoard(game);

    var board = new Common.ShipPlacementBoard(myHitBoard.width, myHitBoard.height);

    var availableShips = game.data.availableShips[myHitBoard.playerIndex];
    window.availableShips = availableShips;


    document.addEventListener('mouseup', function () {
        bus.mouseIsDown = false;
    });

    document.addEventListener('mousedown', function () {
        bus.mouseIsDown = true;
    });

    const App = {
        data() {
            return {
                game: game,
                shipPlacementBoard: new Common.ShipPlacementBoard(myHitBoard.width, myHitBoard.height),
                isItMyTurn: game.isItMyTurn(),
                targetedCell: null,
                me: discordUser
            }
        },
        methods: {
            placeShips() {
                var t1 = performance.now();
                this.shipPlacementBoard = Common.PlaceShips(_.cloneDeep(availableShips), new Common.ShipPlacementBoard(myHitBoard.width, myHitBoard.height));
                var t2 = performance.now();
                console.log(this.shipPlacementBoard);
                console.log("Placing ships took " + Math.round(t2 - t1) + " milliseconds.");
            },
            setShips() {
                Client.runAction(this.game, 'set_ships', { shipPlacementBoard: this.shipPlacementBoard }, (response) => {
                    console.log(response);
                    if (response.success) {
                        Client.utils.updateGame(this.game, response.game);
                    }
                });
            },
            shoot() {
                var cell = this.targetedCell;

                var y = cell.y;
                var x = cell.x;
                if (cell) {
                    Client.runAction(this.game, 'shoot', { y, x }, (response) => {
                        console.log(response);
                        if (response.success) {
                            // play shooting animation
                            var responseCell = response.game.data.hitBoards[response.game.myIndex].cells[y][x];

                            this.game.data.hitBoards[this.game.myIndex].cells[y][x] = responseCell;
                            this.targetedCell = null;

                            if (responseCell.state === Common.BOARD_STATE_MISS) {
                                this.game.client.emit('set_animation', { y, x }, 'miss 1s');

                                setTimeout(() => {
                                    Client.utils.updateGame(this.game, response.game);
                                }, 1000);
                            } else if (responseCell.state === Common.BOARD_STATE_HIT) {
                                this.game.client.emit('set_animation', { y, x }, 'hit 0.5s');

                                setTimeout(() => {
                                    Client.utils.updateGame(this.game, response.game);
                                }, 500);
                            }
                        }
                    }, true);
                }

            }
        },
        computed: {
            myHitBoard() {
                return this.game.data.hitBoards[this.game.myIndex];
            },
            hint() {
                if (this.game.isItMyTurn()) {
                    if (!this.game.data.placed[this.game.myIndex]) {
                        return "Drag ships around or tap to rotate them";
                    } else {
                        return "Tap on a tile";
                    }
                }
                return '';
            }
        },
        mounted() {
            if (!this.game.data.placed[myHitBoard.playerIndex] && this.game.isItMyTurn()) {
                this.placeShips();
            }
        },
        components: {
            GameView,
            ShipPlacer,
            HitBoardView
        }
    };

    var vm = Vue.createApp(App);

    var app = vm.mount('#app');
    window.app = app;




    Client.socket.on('turn', (g, turn) => {
        Client.utils.updateGame(app.game, g);

        if (!app.game.data.placed[app.game.myIndex] && app.game.isItMyTurn()) {
            app.placeShips();
        }




    });

}

var gameId = window.location.pathname.split('/')[2];

Client.connect(gameId, connectionCallback);
