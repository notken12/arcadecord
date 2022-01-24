import {reactive, ref} from 'vue'
import {utils} from '@app/js/client-framework.js'

export default {
    debug: true,
    state: reactive({
        game: ref(null),
        me: ref(null),
    }),
    updateGame(newGame) {
        utils.updateGame(this.state.game, newGame);
    },
};