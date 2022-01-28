import { reactive } from 'vue';
import cloneDeep from 'lodash.clonedeep';
import store from '@app/js/store';
import facade from '@app/js/box';
import bus from '@app/js/vue-event-bus';

const turnReplayDelay = 250;

export default {
    data() {
        return {
            replayTurnFuncSet: false
        }
    },
    computed: {
        previousTurn() {
            if (this.game) {
                if (this.game.turns.length > 0) {
                    return this.game.turns[this.game.turns.length - 1];
                }
            }
            return null
        },
        game() {
            return facade.state.game;
        },
        replaying() {
            return facade.state.replaying;
        },
        me() {
            return facade.state.me;
        }
    },
    methods: {
        $replayTurnFunc() {

        },
        $endReplay(delayMS) {
            if (delayMS == undefined) {
                delayMS = 0;
            }
            setTimeout(() => {
                facade.state.game = store.state.game;
                facade.state.replaying = false;
                console.log('[arcadecord.facade] finished replaying turn');
            }, delayMS);
        },
        $replayTurn(func) {
            if (typeof func === 'function') {
                this.$replayTurnFunc = func;
                this.replayTurnFuncSet = true;
            }
            if (this.replaying && this.replayTurnFuncSet) {
                console.log('[arcadecord.facade] replaying turn');
                setTimeout(this.$replayTurnFunc, turnReplayDelay);
            }
        }
    },
    mounted() {
        bus.on('facade:replay-turn', this.$replayTurn);
    }
}