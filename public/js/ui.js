const PlayerView = {
    data() {
        return {

        }
    },
    props: ['player', 'me'],
    template: `
        <div class="player" :class="classes">
            <img v-bind:src="avatarURL" class="player-image" alt="player" draggable="false">
            <div class="player-name">
                <div v-if="!isMe">
                    <span class="username">{{player.discordUser.username}}</span>
                    <span class="discriminator">#{{player.discordUser.discriminator}}</span>
                </div>
                <div v-else>
                    <span class="username">You</span>
                </div>
            </div>
        </div>
    `,
    computed: {
        avatarURL() {
            return this.player.discordUser.displayAvatarURL || this.player.discordUser.defaultAvatarURL;
        },
        isMe() {
            return this.player.discordUser.id === this.me.id;
        },
        classes() {
            return {
                'player-me': this.isMe
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
    props: ['game', 'me'],
    template: `
    <div class="top">
        <div class="fabs">
            <button class="btn-fab">
                <i class="material-icons">question_mark</i>
            </button>
            <button class="btn-fab" style="margin-left: auto;">
                <i class="material-icons">settings</i>
            </button>
        </div>
        <div>
            <players-view :players="game.players" :me="me"></players-view>
        </div>
    </div>
    `,
    components: {
        'players-view': PlayersView
    }
};

export {
    GameHeader,
    PlayerView,
    PlayersView
}