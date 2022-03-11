<script setup type="module">
import { useFacade } from 'components/base-ui/facade'
import { computed, ref } from 'vue'

import * as THREE from 'three'

const { game, me, replaying, runningAction, $replayTurn, $endReplay, $runAction, $endAnimation } = useFacade()

let hint = computed(() => {
  return ''
})

const canvas = ref(null);
</script>

<template>
    <!-- GameView component, contains all basic game UI 
    like settings button-->
    <game-view :game="game" :me="me" :hint="hint">
        <!-- Game UI goes in here -->

        <div class="middle" ref="canvasWrapper">
            <!-- Game UI just for cuppong -->
            <canvas
                id="game-canvas"
                ref="canvas"
            ></canvas>
        </div>
    </game-view>
</template>