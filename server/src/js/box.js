import {reactive, ref} from 'vue'

// A facade layered over the store to provide a more convenient API for game Vue components
// Used for playing turn replays

export default {
    debug: true,
    state: reactive({
        game: null,
        me: null,
        error: null,
        replaying: false,
        runningAction: false
    }),
};