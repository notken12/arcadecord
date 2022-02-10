<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <!-- Using the scores-view component, create the score badges -->
    <scores-view>
      <!-- Display a score badge for each player -->
      <template v-slot="scoreView">
        <score-badge :scoreview="scoreView"></score-badge>
      </template>
    </scores-view>

    <div class="middle">
      <!-- Game UI just for filler -->
      <board></board>
      <changer></changer>
    </div>
  </game-view>
</template>
<script>
import 'scss/all-games.scss'
import 'scss/games/4inarow.scss';
</script>