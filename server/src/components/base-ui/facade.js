import {ref, computed, onMounted } from 'vue'
import bus from '@app/js/vue-event-bus';
import { mapState } from 'vuex'

const turnReplayDelay = 250;

// by convention, composable function names start with "use"
export function useFacade() {
    const replayTurnFuncSet = ref(false);

    
}