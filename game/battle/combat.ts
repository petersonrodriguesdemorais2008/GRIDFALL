import type { BattleState, SideId } from '@/types'
import { BOSSES } from '@/data/battle/bosses'
import { activeOf, getSide, impact, isSideDefeated, log, rand } from './context'
import { runPassives } from './passives'
import { grantRewards } from './rewards'
import { maxHpOf } from './stats'
import { benchCandidates, performSwap } from './swap'

export function rollDamage(state: BattleState, atk: number, power: number, def: number, pierce = 0) {
  const raw = atk * power - def * (1 - pierce) * 0.6
  const variance = 0.9 + rand(state) * 0.2
  return Math.max(1, Math.round(raw * variance))
}

/** Aplica dano à unidade ativa de um lado, tratando queda e passivas reativas. */
export function damageSide(state: BattleState, targetId: SideId, amount: number) {
  const side = getSide(state, targetId)
  const member = activeOf(side)
  const dealt = Math.min(member.hp, amount)
  member.hp -= dealt
  impact(state, targetId, dealt, 'damage')

  if (member.hp <= 0) {
    const [next] = benchCandidates(side)
    if (next !== undefined) performSwap(state, targetId, next, true)
    return dealt
  }
  runPassives(state, targetId, 'afterDamaged')
  return dealt
}

export function healActive(state: BattleState, sideId: SideId, amount: number) {
  const member = activeOf(getSide(state, sideId))
  const healed = Math.min(maxHpOf(member) - member.hp, amount)
  member.hp += healed
  if (healed > 0) impact(state, sideId, healed, 'heal')
  return healed
}

export function damageBoss(state: BattleState, attackerId: SideId, amount: number) {
  const boss = state.boss
  if (!boss) return 0
  const dealt = Math.min(boss.hp, amount)
  boss.hp -= dealt
  boss.contribution[attackerId] += dealt
  boss.lastHitBy = attackerId
  impact(state, 'boss', dealt, 'damage')

  const definition = BOSSES[boss.bossId]
  if (boss.hp <= 0) {
    state.boss = null
    state.bossesDefeated++
    grantRewards(state, boss)
    return dealt
  }
  if (!boss.enraged && boss.hp / boss.maxHp < definition.enrageThreshold) {
    boss.enraged = true
    boss.patternIndex = 0
    boss.telegraph = definition.enragedPattern[0]
    log(state, `${definition.name} entrou em ENRAGED! ATK +${definition.enrageAtkPercent}%.`, 'boss')
  }
  return dealt
}

export function checkWinner(state: BattleState) {
  if (state.winner) return
  const playerOut = isSideDefeated(state.player)
  const enemyOut = isSideDefeated(state.enemy)
  if (playerOut && enemyOut) state.winner = 'draw'
  else if (playerOut) state.winner = 'enemy'
  else if (enemyOut) state.winner = 'player'
  if (state.winner) log(state, state.winner === 'draw' ? 'Empate!' : `${getSide(state, state.winner).name} venceu!`, 'system')
}
