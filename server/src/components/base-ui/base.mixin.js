// base.mixin.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { reactive } from 'vue';
import cloneDeep from 'lodash.clonedeep';

import bus from '@app/js/vue-event-bus';
import { turnReplayDelay } from './replay-constants';
import { mapState } from 'vuex';

let replaySubscribed = false;

export default {
  data() {
    return {
      replayTurnFuncSet: false,
    };
  },
  computed: {
    previousTurn() {
      if (this.game) {
        if (this.game.turns.length > 0) {
          return this.game.turns[this.game.turns.length - 1];
        }
      }
      return null;
    },
    ...mapState(['game', 'me', 'error', 'replaying', 'runningAction']),
  },
  methods: {
    $replayTurnFunc() {},
    $endReplay(delayMS) {
      if (delayMS == undefined) {
        delayMS = 0;
      }
      setTimeout(() => {
        this.$store.commit('END_TURN_REPLAY');
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
        setTimeout(() => {
          window.requestAnimationFrame(this.$replayTurnFunc);
        }, turnReplayDelay);
      }
    },
    $endAnimation(delayMS) {
      this.$store.commit('START_ACTION_ANIMATION');
      if (delayMS == undefined) {
        delayMS = 0;
      }
      setTimeout(() => {
        this.$store.commit('END_ACTION_ANIMATION');
      }, delayMS);
    },
    $runAction(actionType, actionData) {
      this.$store.commit('RUN_ACTION', {
        type: actionType,
        data: actionData,
      });
    },
  },
  mounted() {
    if (!replaySubscribed) bus.on('facade:replay-turn', this.$replayTurn);
    replaySubscribed = true;
  },
  unmounted() {
    bus.off('facade:replay-turn', this.$replayTurn);
  },
};
