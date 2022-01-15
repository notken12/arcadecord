<template>
    <transition name="fade" appear mode="out-in">
    <win-screen v-if="result === 'win'"></win-screen>
    <lose-screen v-else-if="result === 'lose'"></lose-screen>
    <draw-screen v-else-if="result === 'draw'"></draw-screen>
    <slot v-else></slot>
    </transition>
</template>

<script>
import WinScreen from './WinScreen.vue';
import LoseScreen from './LoseScreen.vue';
import DrawScreen from './DrawScreen.vue';

export default {
    data() {
        return {

        }
    },
    props: ['game'],
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
        WinScreen,
        LoseScreen,
        DrawScreen
    }
}
</script>