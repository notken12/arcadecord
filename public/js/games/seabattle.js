import * as Client from '/public/js/client-framework.js';

import '/gamecommons/seabattle';


function getMyHitBoard(game) {
    var index = game.myIndex;
    if (index == -1) {
        if (game.isItUsersTurn(undefined, index)) {
            // game hasn't started yet but i can start the game by placing ships
            index = game.turn;
        }
    }

    var myHitBoard = game.data.hitBoards[index];

    return myHitBoard;
}





function connectionCallback(response) {
    var game = response.game;
    window.game = game;


    var myHitBoard = getMyHitBoard(game);

    var board = new Common.ShipPlacementBoard(myHitBoard.width, myHitBoard.height);
    var t1 = performance.now();

    var availableShips = game.data.availableShips[myHitBoard.playerIndex];

    board = Common.PlaceShips(availableShips, board);
    var t2 = performance.now();
    console.log(board);
    console.log("Placing ships took " + Math.round(t2 - t1) + " milliseconds.");


    var mouseIsDown = false;

    document.addEventListener('mouseup', function () {
        mouseIsDown = false;
    });

    document.addEventListener('mousedown', function () {
        mouseIsDown = true;
    });

    const App = {
        data() {
            return {
                game: game,
                shipPlacementBoard: board,
                isItMyTurn: game.isItMyTurn(),
                targetedCell: null,
            }
        },
        methods: {
            setShips() {
                Client.runAction(this.game, 'set_ships', { shipPlacementBoard: this.shipPlacementBoard }, (response) => {
                    console.log(response);
                    if (response.success) {
                        Client.utils.updateGame(app.game, response.game);
                    }
                });
            },
            shoot() {
                var cell = this.targetedCell;
                if (cell) {
                    Client.runAction(this.game, 'shoot', { x: cell.x, y: cell.y }, (response) => {
                        console.log(response);
                        if (response.success) {
                            Client.utils.updateGame(this.game, response.game);
                            this.targetedCell = null;
                        }
                    });
                }

            }
        },
        computed: {
            myHitBoard() {
                return this.game.data.hitBoards[this.game.myIndex];
            }
        }
    };

    var vm = Vue.createApp(App);

    const PlayersView = {
        data() {
            return {
            }
        },
        props: ['players'],
        template: `<div class="players-container">
        <div v-for="player in players" :key="player.discordUser.id" class="player">
            <div class="player-name">{{player.discordUser.username}}#{{player.discordUser.discriminator}}</div>
        </div>
    </div>`
    };

    var playersView = vm.component('players-view', PlayersView);

    const ShipPlacer = {
        data() {
            return {
                dragTarget: null,
                lastMove: {},
                targetMoved: false
            }
        },
        props: ['board', 'game'],
        template: `     
        <div class="ship-placer-container">
            <div class="ship-placer-grid" :style="gridStyles">
                <placed-ship v-for="ship in board.ships" :key="ship.id" :ship="ship" :board="board" :selected="dragTarget == ship"></placed-ship>
            </div>

            <div class="ship-placer-board">
                <div class="ship-placer-row" v-for="y in board.width" :key="y">
                    <div class="ship-placer-cell" v-for="x in board.height" :key="x" :x="x-1" :y="y-1" @mouseover="mouseover($event, x-1, y-1)" @mousedown="mousedown($event, x-1, y-1)" @mouseup="mouseup($event, x-1, y-1)"></div>
                </div>
            </div>
            
        </div>`,
        computed: {
            gridStyles() {
                return {
                    'grid-template-columns': `repeat(${board.width}, ${100/board.width}%)`,
                    'grid-template-rows': `repeat(${board.height}, ${100/board.height}%)`,
                    "background-size": 100 / myHitBoard.width + '% ' + 100 / myHitBoard.height + '%',
                }
            }
        },
        methods: {
            mouseover(e, x, y) {
                e.preventDefault();

                console.log('mouseover ' + x + ' ' + y);

                if (this.lastMove.x != x || this.lastMove.y != y) {
                    if (this.dragTarget && mouseIsDown)
                        this.moveShip({ x: x - this.dragOffset.x, y: y - this.dragOffset.y });
                }
                this.lastMove = { x: x, y: y };
            },
            mousedown(e, x, y) {
                e.preventDefault();

                var ship = Common.getShipAt(this.board, x, y);

                if (ship) {

                    var offsetX = x - ship.x;
                    var offsetY = y - ship.y;
                    this.dragOffset = { x: offsetX, y: offsetY }; // what part of the ship is being dragged

                    mouseIsDown = true;

                    this.mouseLandingPoint = { x, y };
                    this.dragTarget = ship;
                    this.initialDragTargetPosition = { x: ship.x + 0, y: ship.y + 0 };

                    console.log('drag');
                } else {
                    this.dragTarget = null;
                }
            },
            moveShip(pos) {
                var ship = this.dragTarget;
                var board = _.cloneDeep(this.$root.shipPlacementBoard);
                board.ships.forEach(element => {
                    if (element.id == ship.id) {
                        if (pos.x !== undefined)
                            element.x = pos.x;
                        if (pos.y !== undefined)
                            element.y = pos.y;
                        if (pos.direction !== undefined)
                            element.direction = pos.direction;
                    }
                });

                if (Common.isBoardValid(board, 0)) {
                    if ((ship.x != pos.x && pos.x !== undefined) || (ship.y != pos.y && pos.y !== undefined)) {
                        this.targetMoved = true;
                    }
                    if (pos.x !== undefined)
                        ship.x = pos.x;
                    if (pos.y !== undefined)
                        ship.y = pos.y;
                    if (pos.direction !== undefined)
                        ship.direction = pos.direction;
                }
            },
            mouseup(e, x, y) {
                var dragTarget = this.dragTarget;
                if (!dragTarget)
                    return;
                if (mouseIsDown && dragTarget != null) {
                    if (!this.targetMoved) {
                        // rotate ship, user just simply clicked
                        this.moveShip({ direction: dragTarget.direction == Common.SHIP_DIRECTION_HORIZONTAL ? Common.SHIP_DIRECTION_VERTICAL : Common.SHIP_DIRECTION_HORIZONTAL });
                    }
                }
                mouseIsDown = false;
                this.targetMoved = false;
                this.dragTarget = null;
            }

        }
    }

    var shipPlacer = vm.component('ship-placer', ShipPlacer);

    const PlacedShip = {
        props: ['ship', 'board', 'selected'],
        template: `
            <div class="placed-ship" :style="styles" :x="ship.x" :y="ship.y" :class="classes">
                <div class="placed-ship-bounding-box" :style="boundingBoxStyles"></div>
                <img draggable="false" :src="imageURL" class="placed-ship-image" @mouseup="mouseup($event)"/>
            </div>`,
        data() {
            var ship = this.ship;
            return {
            }
        },
        computed: {
            classes() {
                return this.selected ? 'selected' : '';
            },
            styles () {
                // position based on grid
                var ship = this.ship;

                var transform = '';
                if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
                    transform = 'rotate(90deg)';
                }

                return {
                    top: ship.y / board.height * 100 + '%',
                    left: ship.x / board.width * 100 + '%',
                    width: ship.length / board.width * 100 + '%',
                    height: 1/ board.height * 100 + '%',
                    transform: transform,
                    transformOrigin: (1 / ship.length * 50) + '% 50%'
                }
            },
            boundingBox() {
                var ship = this.ship;
                var x1 = ship.x - 1;
                var y1 = ship.y - 1;
                var x2 = ship.x + ship.length;
                var y2 = ship.y + 1;

                if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
                    x2 = ship.x + 1;
                    y2 = ship.y + ship.length;
                }

                return { x1, y1, x2, y2 };
            },
            imgStyles() {
                var ship = this.ship;



                var x = ship.x * Common.CELL_SIZE;
                var y = ship.y * Common.CELL_SIZE;
                var width = ship.length * Common.CELL_SIZE;
                var height = Common.CELL_SIZE;

                return {

                    left: x + 'px',
                    top: y + 'px',
                    width: width + 'px',
                    height: height + 'px'
                };
            },
            boundingBoxStyles() {
                var boundingBox = this.boundingBox;
                var x = boundingBox.x1 * Common.CELL_SIZE;
                var y = boundingBox.y1 * Common.CELL_SIZE;
                var width = (boundingBox.x2 - boundingBox.x1 + 1) * Common.CELL_SIZE;
                var height = (boundingBox.y2 - boundingBox.y1 + 1) * Common.CELL_SIZE;
                return {
                    left: x + 'px',
                    top: y + 'px',
                    width: width + 'px',
                    height: height + 'px'
                }
            },

            imageURL() {
                var ship = this.ship;
                var shipType = ship.type;
                return '/public/assets/seabattle/ships/' + shipType + '.png';
            }
        },
        methods: {
            mousedown(e) {
                var ship = this.ship;

                mouseIsDown = true;

                var elPos = e.target.getBoundingClientRect();


                var x = elPos.x + Common.CELL_SIZE / 2 + Math.floor((e.clientX - elPos.x) / Common.CELL_SIZE) * Common.CELL_SIZE;
                var y = elPos.y + Common.CELL_SIZE / 2;

                if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
                    y = elPos.y + Common.CELL_SIZE / 2 + Math.floor((e.clientY - elPos.y) / Common.CELL_SIZE) * Common.CELL_SIZE;
                    x = elPos.x + Common.CELL_SIZE / 2;
                }



                var bb = this.$el.getBoundingClientRect();

                // get nearest tile
                var nearestX = Math.floor((e.clientX - bb.left) / Common.CELL_SIZE); // nearest tile's x coordinate
                var nearestY = Math.floor((e.clientY - bb.top) / Common.CELL_SIZE);

                var offsetX = nearestX - this.ship.x;
                var offsetY = nearestY - this.ship.y;
                this.dragOffset = { x: offsetX, y: offsetY }; // what part of the ship is being dragged


                this.mouseLandingPoint = { x, y };
                this.dragTarget = this;
                this.initialDragTargetPosition = { x: this.ship.x + 0, y: this.ship.y + 0 };

                console.log('drag');
            }
        }
    };
    shipPlacer.component('placed-ship', PlacedShip);

    const HitBoardView = {
        props: ['board', 'target'],
        template: `
            <div class="hit-board" :style="styles">

                <div class="hit-board-grid">
                    <div class="hit-board-row" v-for="row in board.cells" :key="board.cells.indexOf(row)">
                        <hit-board-cell v-for="cell in row" :key="cell.id" :cell="cell" :board="board"></hit-board-cell>
                    </div>
                </div>
                <div class="hit-board-ships" :style="gridStyles">
                    <placed-ship v-for="ship in board.revealedShips" :key="ship.id" :ship="ship" :board="board" :selected="dragTarget == ship">
                    </placed-ship>
                </div>

                <div class="target-crosshair" v-if="target" :style="targetStyles">
                    <img src="/public/assets/seabattle/crosshair.png" />
                </div>
            </div>
            `,
        data() {
            return {
            }
        },
        computed: {
            styles() {
                return {
                    "background-size": 1 / this.board.width * 100 + '% ' + 1 / this.board.height * 100 + '%',
                }
            },
            targetStyles() {
                return {
                    left: this.target.x / this.board.width * 100 + '%',
                    top: this.target.y / this.board.height * 100 + '%',
                    width: 1 / this.board.width * 100 + '%',
                    height: 1 / this.board.height * 100 + '%'
                }
            }
        }
    }

    var hitBoardView = vm.component('hit-board-view', HitBoardView);

    const HitBoardCell = {
        props: ['cell', 'board'],
        template: `<div class="hit-board-cell" 
            :style="cellStyles"
            @click="cellClicked"
            >
                <img :src="imgURL" draggable="false" alt="altText"/>
            </div>`,
        computed: {
            cellStyles() {
                return {
                    
                }
            },
            imgURL() {
                return '/public/assets/seabattle/cell-states/' + this.cell.state + '.png';
            }
        },
        methods: {
            cellClicked() {
                if (this.cell.state === Common.BOARD_STATE_EMPTY && this.$root.game.isItMyTurn())
                    this.$root.targetedCell = this.cell;
            },
            altText: function () {
                switch (this.cell.state) {
                    case Common.CELL_STATE_HIT:
                        return 'Hit';
                    case Common.CELL_STATE_MISS:
                        return 'Miss';
                    case Common.CELL_STATE_EMPTY:
                        return 'Unknown';
                    default:
                        return 'Unknown';
                }
            }
        }
    };
    hitBoardView.component('hit-board-cell', HitBoardCell);

    var app = vm.mount('#app');
    window.app = app;




    Client.socket.on('turn', (g, turn) => {
        Client.utils.updateGame(app.game, g);
        app.game.turn = g.turn;
    });

}

var gameId = window.location.pathname.split('/')[2];

Client.connect(gameId, connectionCallback);
