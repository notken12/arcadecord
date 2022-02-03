import { reactive, ref } from 'vue'
import { utils } from '@app/js/client-framework.js'
import { createStore } from 'vuex'

const store = createStore({
    state() {
        return {
            game: null,
            me: null,
            error: null
        }
    },
    mutations: {
        UPDATE_GAME(state, game) {
            utils.updateGame(state.game, game);
        },
        SETUP(state, connectionResponse) {
            state.game = connectionResponse.game ?? null;
            state.me = connectionResponse.discordUser ?? null;
            state.error = connectionResponse.error ?? null;
        }
    }
});

// export default {
//     debug: true,
//     state: reactive({
//         game: null,
//         me: null,
//         error: null
//     }),
//     updateGame(newGame) {
//         utils.updateGame(this.state.game, newGame);
//     },
//     setup(connectionResponse) {
//         this.state.game = connectionResponse.game ?? null;
//         this.state.me = connectionResponse.discordUser ?? null;
//         this.state.error = connectionResponse.error ?? null;
//     }
// };

export default store;