import type {
  BattleState,
  CombatantState,
  ImpactEvent,
  LogTone,
  SideId,
  SideState,
  TurnOwner,
} from '@/types'
import { BATTLE_RULES } from '@/data/battle/rules'

/**
 * Helpers que operam sobre um rascunho (cópia) do estado da batalha.
 * O reducer clona o estado antes de usá-los, mantendo a API pura.
 */

/** PRNG mulberry32 com semente guardada no estado — partidas reproduzíveis. */
export function rand(state: BattleState): number {
  state.seed = (state.seed + 0x6d2b79f5) | 0
  let t = state.seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function pick<T>(state: BattleState, items: readonly T[]): T {
  return items[Math.floor(rand(state) * items.length)]
}

export function log(state: BattleState, text: string, tone: LogTone = 'neutral') {
  state.log.push({ id: state.nextEventId++, text, tone })
  if (state.log.length > BATTLE_RULES.maxLogEntries) state.log.shift()
}

export function impact(state: BattleState, target: TurnOwner, amount: number, kind: ImpactEvent['kind']) {
  state.impacts.push({ id: state.nextEventId++, target, amount, kind })
  if (state.impacts.length > 8) state.impacts.shift()
}

export function getSide(state: BattleState, id: SideId): SideState {
  return id === 'player' ? state.player : state.enemy
}

export function opponentOf(id: SideId): SideId {
  return id === 'player' ? 'enemy' : 'player'
}

export function activeOf(side: SideState): CombatantState {
  return side.party[side.activeIndex]
}

export function isSideDefeated(side: SideState): boolean {
  return side.party.every((member) => member.hp <= 0)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
