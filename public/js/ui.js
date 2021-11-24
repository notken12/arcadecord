const PlayerView = {
    data() {
        return {

        }
    },
    props: ['player'],
    template: `
        <div class="player">
            <img v-bind:src="avatarURL" class="player-image" alt="player">
            <div class="player-name">
                <span class="username">{{player.discordUser.username}}</span>
                <span class="discriminator">#{{player.discordUser.discriminator}}</span>
            </div>
        </div>
    `,
    computed: {
        avatarURL() {
            // retrieve avatar with size 128x128
            return 'https://cdn.discordapp.com/avatars/' + this.player.discordUser.id + '/' + this.player.discordUser.avatar + '?size=128'; 
        }
    }
}

const PlayersView = {
    data() {
        return {
        }
    },
    props: ['players'],
    template: `
    <div class="players-container">
        <player-view v-for="player in players" :key="player.discordUser.id" :player="player"></player-view>
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
    props: ['game'],
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
            <players-view :players="game.players"></players-view>
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