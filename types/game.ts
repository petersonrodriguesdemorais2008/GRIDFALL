import type { SceneId } from './scene'
import type { ConnectionStatus } from './network'
import type { BattleLoadout } from './battle'

export type GamePhase = 'boot' | 'title' | 'menu' | 'modeSelect' | 'teamSelect' | 'loading' | 'world' | 'paused'

export type MenuScreen = 'main' | 'collection' | 'shop' | 'howToPlay' | 'settings'

export type GameMode = 'vsBot' | 'pvp' | 'bossRush' | 'challenges' | 'training'

export type GameModeStatus = 'available' | 'inDevelopment'

/** Modos que já possuem um fluxo jogável. */
export type PlayableGameMode = Extract<GameMode, 'vsBot' | 'training'>

export interface GameSettings {
  sound: boolean
  haptics: boolean
  showDebug: boolean
}

export interface GameSession {
  playerId: string
  mode: PlayableGameMode
  startedAt: number
  loadout: BattleLoadout | null
}

export interface GameState {
  phase: GamePhase
  menuScreen: MenuScreen
  scene: SceneId
  session: GameSession | null
  settings: GameSettings
  connection: ConnectionStatus
  fps: number
}

export type GameAction =
  | { type: 'BOOT_COMPLETE' }
  | { type: 'OPEN_MENU' }
  | { type: 'SET_MENU_SCREEN'; screen: MenuScreen }
  | { type: 'OPEN_MODE_SELECT' }
  | { type: 'OPEN_TEAM_SELECT' }
  | { type: 'START_GAME'; playerId: string; mode: PlayableGameMode; loadout?: BattleLoadout }
  | { type: 'LOADING_COMPLETE'; scene: SceneId }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RETURN_TO_TITLE' }
  | { type: 'SET_FPS'; fps: number }
  | { type: 'SET_CONNECTION'; status: ConnectionStatus }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
