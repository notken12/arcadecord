import * as Client from '../client-framework.js';

import * as UI from '../ui.js';

import Common from '../../../games/types/seabattle/common.js';

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
        }
    };

    var vm = Vue.createApp(App);

    var gameView = vm.component('game-view', UI.GameView);

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
                <placed-ship v-for="ship of board.ships" :ship="ship" :board="board" :selected="dragTarget == ship"></placed-ship>
            </div>

            <div class="ship-placer-board" @touchmove="touchmove($event)" @touchend="mouseup($event)" ref="board">
                <div class="ship-placer-row" v-for="y in board.width" :key="y">
                    <div class="ship-placer-cell" v-for="x in board.height" :key="x" :x="x-1" :y="y-1" 
                    @mouseover="mouseover($event, x-1, y-1)" 
                    @mousedown="mousedown($event, x-1, y-1)" 
                    @mouseup="mouseup($event, x-1, y-1)"
                    @touchstart="touchstart($event, x-1, y-1)"></div>
                </div>
            </div>
            
        </div>`,
        computed: {
            gridStyles() {
                return {
                    'grid-template-columns': `repeat(${board.width}, ${100 / board.width}%)`,
                    'grid-template-rows': `repeat(${board.height}, ${100 / board.height}%)`,
                    "background-size": 100 / myHitBoard.width + '% ' + 100 / myHitBoard.height + '%',
                }
            }
        },
        methods: {
            touchmove(e) {
                e.preventDefault();

                var b = this.$refs.board.getBoundingClientRect();

                var x = Math.floor((e.touches[0].clientX - b.left) / b.width * this.board.width);
                var y = Math.floor((e.touches[0].clientY - b.top) / b.height * this.board.height);

                if (this.lastMove.x != x || this.lastMove.y != y) {
                    if (this.dragTarget && mouseIsDown)
                        this.moveShip({ x: x - this.dragOffset.x, y: y - this.dragOffset.y });
                }
                this.lastMove = { x: x, y: y };


            },
            touchstart(e, x, y) {
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

                } else {
                    this.dragTarget = null;
                }
            },
            mouseover(e, x, y) {


                if (this.lastMove.x != x || this.lastMove.y != y) {
                    if (this.dragTarget && mouseIsDown)
                        this.moveShip({ x: x - this.dragOffset.x, y: y - this.dragOffset.y });
                }
                this.lastMove = { x: x, y: y };
            },
            mousedown(e, x, y) {


                var ship = Common.getShipAt(this.board, x, y);

                if (ship) {

                    var offsetX = x - ship.x;
                    var offsetY = y - ship.y;
                    this.dragOffset = { x: offsetX, y: offsetY }; // what part of the ship is being dragged

                    mouseIsDown = true;

                    this.mouseLandingPoint = { x, y };
                    this.dragTarget = ship;
                    this.initialDragTargetPosition = { x: ship.x + 0, y: ship.y + 0 };

                } else {
                    this.dragTarget = null;
                }
            },
            moveShip(pos) {
                var ship = this.dragTarget;
                var board = _.cloneDeep(this.board);
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
                <img draggable="false" :src="imageURL" class="placed-ship-image"/>
            </div>`,
        data() {
            return {
            }
        },
        computed: {
            classes() {
                return this.selected ? 'selected' : '';
            },
            styles() {
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
                    height: 1 / board.height * 100 + '%',
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
                return '/dist/assets/seabattle/ships/' + shipType + '.png';
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

            }
        }
    };
    shipPlacer.component('placed-ship', PlacedShip);

    const HitBoardView = {
        props: ['board', 'target', 'game'],
        template: `
            <div class="hit-board" :style="styles">
                <div class="hit-board-ships">
                    <placed-ship v-for="ship in board.revealedShips" :key="ship.id" :ship="ship" :board="board">
                    </placed-ship>
                </div>

                <div class="hit-board-grid">
                    <div class="hit-board-row" v-for="row in board.cells" :key="board.cells.indexOf(row)">
                        <hit-board-cell v-for="cell in row" :key="cell.id" :cell="cell" :board="board" :game="game"></hit-board-cell>
                    </div>
                </div>


                <div class="target-crosshair" v-if="target" :style="targetStyles">
                    <img src="/dist/assets/seabattle/crosshair.png" />
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
        data() {
            return {
                animation: 'none'
            }
        },
        props: ['cell', 'board', 'game'],
        template: `<div class="hit-board-cell" 
            :style="cellStyles"
            @click="cellClicked"
            >
            </div>`,
        computed: {
            cellStyles() {
                var board = this.board;
                board.ships = board.revealedShips;

                var show = true;
                if (Common.getShipAt(this.board, this.cell.x, this.cell.y)) {
                    show = false;
                }

                return {
                    'background-image': show ? 'url(' + this.imgURL + ')' : 'none',
                    animation: this.animation || 'none'
                }

            },
            imgURL() {
                return '/dist/assets/seabattle/cell-states/' + this.cell.state + '.png';
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
        },
        mounted() {
            this.game.client.on('set_animation', (pos, animation) => {
                if (this.cell.x === pos.x && this.cell.y === pos.y)
                    this.animation = animation;
            });
        }
    };
    hitBoardView.component('hit-board-cell', HitBoardCell);

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
