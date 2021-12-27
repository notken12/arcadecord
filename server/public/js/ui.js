import 'https://unpkg.com/mitt/dist/mitt.umd.js';

import 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.4.0/dist/confetti.browser.min.js';

import 'https://cdn.jsdelivr.net/npm/remarkable@2.0.1/dist/remarkable.min.js';

var emitter = mitt();

var md = new remarkable.Remarkable({});

var manualMd;

const PlayerView = {
    data() {
        return {

        }
    },
    props: ['player', 'me', 'alwaysshow'],
    template: `
        <div class="player" :class="classes" v-if="!isMe || alwaysshow">
            <img v-bind:src="avatarURL" class="player-image" alt="player" draggable="false">
            <div class="player-name">
                <div v-if="!isMe">
                    <span class="username">{{showedPlayer.discordUser.username}}</span>
                    <span class="discriminator">#{{showedPlayer.discordUser.discriminator}}</span>
                </div>
                <div v-else>
                    <span class="username">You</span>
                </div>
            </div>
        </div>
    `,
    computed: {
        avatarURL() {
            return this.showedPlayer.discordUser.displayAvatarURL || this.showedPlayer.discordUser.defaultAvatarURL;
        },
        isMe() {
            if (!this.player.discordUser) {
                return this.player.id === this.me.id;
            }
            return this.player.discordUser.id === this.me.id;
        },
        classes() {
            return {
                'player-me': this.isMe
            }
        },
        showedPlayer() {
            if (this.isMe) {
                return {
                    discordUser: this.me,
                };
            } else {
                return this.player;
            }
        }
    }
}

const PlayersView = {
    data() {
        return {
        }
    },
    props: ['players', 'me'],
    template: `
    <div class="players-container">
        <player-view :key="me" :player="me" :me="me" :alwaysshow="true"></player-view>
        <player-view v-for="player in players" :key="player.discordUser.id" :player="player" :me="me"></player-view>
    </div>
    `,
    components: {
        'player-view': PlayerView
    }
};

const GameHeader = {
    data() {
        return {

        }
    },
    props: ['game', 'me', 'hint'],
    template: `
    <div class="top">
        <div class="fabs">
            <button class="btn-fab" @click="openManual">
                <i class="material-icons">question_mark</i>
            </button>
            <button class="btn-fab" style="margin-left: auto;">
                <i class="material-icons">settings</i>
            </button>
        </div>
        <div class="hint">{{hint}}</div>
        <div>
            <players-view :players="game.players" :me="me"></players-view>
        </div>
    </div>
    `,
    components: {
        'players-view': PlayersView
    },
    methods: {
        openManual() {
            console.log('open manual');
            emitter.emit('open-manual');
        }
    }
};

const WaitingView = {
    data() {
        return {

        }
    },
    props: [],
    template: `
    <transition name="fade" appear mode="out-in">

    <div class="waiting-view dialog-container">
        <div class="waiting-view-chip dialog-chip">
            <span>Waiting for opponent</span>
            <span class="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span>
        </div>
    </div>

    </transition>
    `,

}

const GameManualView = {
    data() {
        return {
            parsedMarkdown: undefined
        }
    },
    props: ['game'],
    template: `
    <div class="game-manual-bg">
        <div class="game-manual-modal">
            <div class="game-manual-modal-header">
                <div class="game-manual-modal-header-close">
                    <button class="btn-icon" @click="closeManual">
                        <i class="material-icons">close</i>
                    </button>
                </div>
                <div class="game-manual-modal-header-text">
                    <span>Game Manual</span>
                </div>

            </div>
            <div class="game-manual-modal-content">
                <div v-if="parsedMarkdown === undefined">Loading...</div>
                <div v-if="parsedMarkdown === null">Game manual for {{game.name}} coming soon!</div>
                <div v-html="parsedMarkdown" v-if="parsedMarkdown"></div>
            </div>
        </div>
    </div>
    `,
    methods: {
        closeManual() {
            emitter.emit('close-manual');
        }
    },
    mounted() {
        if (manualMd !== undefined) {
            // manual already loaded
            this.parsedMarkdown = manualMd;
        } else {
            // manual not loaded yet
            // fetch and parse manual
            var path = '/public/manuals/' + this.game.typeId + '.md';
            fetch(path).then((response) => {
                if (response.ok) {
                    response.text().then((text) => {
                        this.parsedMarkdown = md.render(text);
                        manualMd = this.parsedMarkdown;
                    });
                } else {
                    this.parsedMarkdown = null;
                    manualMd = null;
                }
            }).catch(() => {
                this.parsedMarkdown = null;
                manualMd = null;
            });
        }

    }
}

const WinScreen = {
    data() {
        return {

        }
    },
    props: ['game', 'me'],
    template: `
    <div class="win-view dialog-container">
        <div class="win-view-chip dialog-chip" ref="chip">
            <span>🎉 You win!!!</span>
        </div>
    </div>
    `,
    mounted() {
        var colors = ['#ff1744', '#f50057', '#d500f9', '#651fff', '#3d5afe', '#2979ff', '#00b0ff', '#00e5ff', '#1de9b6', '#00e676', '#76ff03', '#c6ff00', '#ffea00', '#ffc400', '#ff9100', '#ff3d00'];
        colors = ['#3d5afe', '#651fff', '#2979ff', '#00b0ff', '#00e5ff'];

        function showConfetti() {
            var duration = 10 * 1000;
            var animationEnd = Date.now() + duration;
            var skew = 1;
            // use bright colorful colors


            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            var previousTimestamp;

            (function frame(time) {
                var count = window.innerWidth / 35;
                var averageInterval = 1000;

                var chance = count / averageInterval;

                let timeLeft = animationEnd - Date.now();

                if (previousTimestamp === undefined && time !== undefined)
                    previousTimestamp = time + 0;

                let elapsed = time - previousTimestamp;


                let rng = Math.random();
                if (rng <= chance * elapsed) {
                    var ticks = window.innerHeight * 1.5;
                    //skew = Math.max(0.8, skew - 0.001);

                    confetti({
                        particleCount: 1,
                        startVelocity: 0,
                        origin: {
                            x: Math.random(),
                            // since particles fall down, skew start toward the top
                            y: 0
                        },
                        colors: [colors[Math.floor(Math.random() * colors.length)]],
                        gravity: randomInRange(0.9, 1.1),
                        drift: randomInRange(-0.4, 0.4),
                        shapes: ['square', 'square'],
                        ticks: ticks,
                    });
                }



                previousTimestamp = time + 0;


                if (timeLeft > 0) {
                    requestAnimationFrame(frame);
                }
            }());
        }

        function showConfetti2() {
            var count = 100;
            var defaults = {
                origin: { y: 0.5 }
            };

            function fire(particleRatio, opts) {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                }));
            }

            fire(0.25, {
                spread: 26,
                startVelocity: 55,
                colors: colors,
                shapes: ['square']
            });
            fire(0.2, {
                spread: 60,
                colors: colors,
                shapes: ['square']
            });
            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8,
                colors: colors,
                shapes: ['square']
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2,
                colors: colors,
                shapes: ['square']
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 45,
                colors: colors,
                shapes: ['square']
            });
        }

        showConfetti();
        //showConfetti2();

        this.$refs.chip.addEventListener('click', function (e) {
            showConfetti2();
        });
    }
};

const LoseScreen = {
    data() {
        return {
            
        }
    },
    props: ['game', 'me'],
    template: `
    <div class="lose-view dialog-container">
        <div class="lose-view-chip dialog-chip" ref="chip">
            <span>😭 You lose!</span>
        </div>
    </div>
    `,
    mounted() {

    }
};

const DrawScreen = {
    data() {
        return {

        }
    },
    props: ['game', 'me'],
    template: `
    <div class="draw-view dialog-container">
        <div class="draw-view-chip dialog-chip" ref="chip">
            <span>😐 It's a draw!</span>
        </div>
    </div>
    `,
    mounted() {

    }
};

const ResultView = {
    data() {
        return {

        }
    },
    props: ['game'],
    template: `
    <transition name="fade" appear mode="out-in">
    <win-screen v-if="result === 'win'"></win-screen>
    <lose-screen v-else-if="result === 'lose'"></lose-screen>
    <draw-screen v-else-if="result === 'draw'"></draw-screen>
    <slot v-else></slot>
    </transition>
    `,
    computed: {
        resultText() {
            if (this.game.winner === -1) {
                return 'Draw';
            }
            if (this.game.winner === this.game.myIndex) {
                return 'You win!';
            } else {
                return 'You lose!';
            }
        },
        result() {
            if (this.game.winner === -1) {
                return 'draw';
            } else if (this.game.winner === this.game.myIndex) {
                return 'win';
            } else {
                return 'lose';
            }
        }
    },
    methods: {
        
    },
    mounted() {

    },
    components: {
        'win-screen': WinScreen,
        'lose-screen': LoseScreen,
        'draw-screen': DrawScreen
    }
}

const GameView = {
    data() {
        return {
            manualOpen: false,
            isItMyTurn: false,
        }
    },
    props: ['game', 'me', 'hint'],
    template: `
    <div class="game-container">
        <game-header :game="game" :me="me" :hint="hint"></game-header>
        <slot></slot>
        <waiting-view v-if="!isItMyTurn && !game.hasEnded"></waiting-view>
        <result-view v-if="game.hasEnded" :game="game"></result-view>
        <game-manual-view v-if="manualOpen" :game="game"></game-manual-view>
    </div>
    `,
    components: {
        'game-header': GameHeader,
        'waiting-view': WaitingView,
        'game-manual-view': GameManualView,
        'result-view': ResultView
    },
    mounted() {
        emitter.on('open-manual', () => {
            this.manualOpen = true;
        });
        emitter.on('close-manual', () => {
            this.manualOpen = false;
        });
        this.isItMyTurn = this.game.isItMyTurn();
    },
    watch: {
        'game.turn': function(newTurn) {
            console.log('turn changed');
            this.isItMyTurn = this.game.isItMyTurn();
        }
    }
};

export {
    GameHeader,
    PlayerView,
    PlayersView,
    GameView
}