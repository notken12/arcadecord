<script setup>
// Import Vue components
// game-view, scores-view are automatically imported

// Import scss styles
// import 'scss/games/cuppong.scss'

import { replayAction } from '@app/js/client-framework.js'
import Common from '/gamecommons/cuppong'

import { Box, Camera, LambertMaterial, PointLight, Renderer, Scene } from 'troisjs';
</script>

<template>
  <!-- GameView component, contains all basic game UI 
  like settings button-->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle">
      <!-- Game UI just for filler -->
      <Renderer>
        <Camera :position="{ z: 10 }" />
        <Scene>
          <PointLight :position="{ y: 50, z: 50 }" />
          <Box>
            <LambertMaterial />
          </Box>
        </Scene>
      </Renderer>
    </div>
  </game-view>
</template>