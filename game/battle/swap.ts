import type { BattleState, SideId, SideState } from '@/types'
import { CHARACTERS } from '@/data/battle/characters'
import { SWAP_RULES } from '@/data/battle/rules'
import { activeOf, getSide, log } from './context'

export type SwapBlockReason = 'cooldown' | 'limit' | 'noBench' | null

/** Índices de personagens no banco que podem entrar (vivos e não ativos). */
export function benchCandidates(side: SideState): number[] {
  return side.party.flatMap((member, index) =>
    index !== side.activeIndex && member.hp > 0 ? [index] : [],
  )
}

export function swapBlockReason(side: SideState): SwapBlockReason {
  if (side.swap.used >= SWAP_RULES.maxSwapsPerMatch) return 'limit'
  if (side.swap.cooldown > 0) return 'cooldown'
  if (benchCandidates(side).length === 0) return 'noBench'
  return null
}

export function swapsLeft(side: SideState) {
  return SWAP_RULES.maxSwapsPerMatch - side.swap.used
}

/**
 * Troca a unidade ativa. HP/MP ficam guardados em cada personagem.
 * `forced` é usado quando a unidade ativa cai: não consome recarga nem limite.
 */
export function performSwap(state: BattleState, sideId: SideId, toIndex: number, forced = false): boolean {
  const side = getSide(state, sideId)
  if (!forced && swapBlockReason(side) !== null) return false
  if (!benchCandidates(side).includes(toIndex)) return false

  const outgoing = activeOf(side)
  if (SWAP_RULES.clearBuffsOnExit) outgoing.buffs = []

  side.activeIndex = toIndex
  const incoming = activeOf(side)
  const outName = CHARACTERS[outgoing.characterId].name
  const inName = CHARACTERS[incoming.characterId].name

  if (forced) {
    log(state, `${outName} caiu! ${inName} entra em campo.`, 'system')
  } else {
    side.swap.used++
    side.swap.cooldown = SWAP_RULES.cooldownTurns
    log(state, `${side.name} trocou: ${outName} sai, ${inName} entra.`, sideId)
  }
  return true
}
