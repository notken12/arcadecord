import 'https://unpkg.com/mitt/dist/mitt.umd.js';

import 'https://cdn.jsdelivr.net/npm/remarkable@2.0.1/dist/remarkable.min.js';

var emitter = mitt();

var md = new remarkable.Remarkable({});

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

    <div class="waiting-view">
        <div class="waiting-view-text">
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
            parsedMarkdown: ''
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
            <div class="game-manual-modal-content" v-html="parsedMarkdown">
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
        var path = '/public/manuals/' + this.game.typeId + '.md';
        fetch(path).then((response) => {
            response.text().then((text) => {
                this.parsedMarkdown = md.render(text);
            });
        });
    }
}

const GameView = {
    data() {
        return {
            manualOpen: false,
        }
    },
    props: ['game', 'me', 'hint'],
    template: `
    <div class="game-container">
        <game-header :game="game" :me="me" :hint="hint"></game-header>
        <slot></slot>
        <waiting-view v-if="!game.isItMyTurn() && !game.hasEnded"></waiting-view>
        <game-manual-view v-if="manualOpen" :game="game"></game-manual-view>
    </div>
    `,
    components: {
        'game-header': GameHeader,
        'waiting-view': WaitingView,
        'game-manual-view': GameManualView
    },
    mounted() {
        emitter.on('open-manual', () => {
            this.manualOpen = true;
        });
        emitter.on('close-manual', () => {
            this.manualOpen = false;
        });
    }
};

export {
    GameHeader,
    PlayerView,
    PlayersView,
    GameView
}