import {reactive, ref} from 'vue'
import {utils} from '@app/js/client-framework.js'

export default {
    debug: true,
    state: reactive({
        game: null,
        me: null,
        error: null
    }),
    updateGame(newGame) {
        utils.updateGame(this.state.game, newGame);
    },
    setup(connectionResponse) {
        this.state.game = connectionResponse.game ?? null;
        this.state.me = connectionResponse.discordUser ?? null;
        this.state.error = connectionResponse.error ?? null;
    }
};