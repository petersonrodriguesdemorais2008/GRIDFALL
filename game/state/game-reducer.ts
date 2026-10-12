import type { GameAction, GameState } from '@/types'

export const INITIAL_GAME_STATE: GameState = {
  phase: 'title',
  menuScreen: 'main',
  scene: 'title',
  session: null,
  settings: {
    sound: true,
    haptics: true,
    showDebug: true,
  },
  connection: 'offline',
  fps: 0,
}

/**
 * Máquina de estados do jogo. Pura e determinística — sem efeitos colaterais.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BOOT_COMPLETE':
      return { ...state, phase: 'title', scene: 'title' }

    case 'OPEN_MENU':
      return { ...state, phase: 'menu', menuScreen: 'main', scene: 'title' }

    case 'SET_MENU_SCREEN':
      return state.menuScreen === action.screen ? state : { ...state, menuScreen: action.screen }

    case 'OPEN_MODE_SELECT':
      return state.phase === 'menu' || state.phase === 'teamSelect'
        ? { ...state, phase: 'modeSelect', menuScreen: 'main' }
        : state

    case 'OPEN_TEAM_SELECT':
      return state.phase === 'modeSelect' ? { ...state, phase: 'teamSelect' } : state

    case 'START_GAME':
      return {
        ...state,
        phase: 'loading',
        menuScreen: 'main',
        session: {
          playerId: action.playerId,
          mode: action.mode,
          startedAt: Date.now(),
          loadout: action.loadout ?? null,
        },
      }

    case 'LOADING_COMPLETE':
      return { ...state, phase: 'world', scene: action.scene }

    case 'PAUSE':
      return state.phase === 'world' ? { ...state, phase: 'paused' } : state

    case 'RESUME':
      return state.phase === 'paused' ? { ...state, phase: 'world' } : state

    case 'RETURN_TO_TITLE':
      return { ...state, phase: 'menu', menuScreen: 'main', scene: 'title', session: null }

    case 'SET_FPS':
      return state.fps === action.fps ? state : { ...state, fps: action.fps }

    case 'SET_CONNECTION':
      return { ...state, connection: action.status }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }

    default:
      return state
  }
}
