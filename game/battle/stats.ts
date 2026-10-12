import type { BossState, CombatantState, SideState, StatKey, StatusEffect } from '@/types'
import { CHARACTERS } from '@/data/battle/characters'
import { BOSSES } from '@/data/battle/bosses'
import { EQUIPMENT } from '@/data/battle/items'
import { BATTLE_RULES } from '@/data/battle/rules'
import { activeOf, clamp } from './context'

export function buffPercent(buffs: StatusEffect[], stat: StatKey): number {
  const total = buffs.reduce((sum, buff) => (buff.stat === stat ? sum + buff.percent : sum), 0)
  return clamp(total, -BATTLE_RULES.buffCapPercent, BATTLE_RULES.buffCapPercent)
}

export function maxHpOf(member: CombatantState) {
  return CHARACTERS[member.characterId].stats.maxHp
}

export function maxMpOf(member: CombatantState) {
  return CHARACTERS[member.characterId].stats.maxMp
}

/** Atributo final da unidade ativa: base + equipamento + buffs. A base nunca é alterada. */
export function sideStat(side: SideState, stat: StatKey): number {
  const member = activeOf(side)
  const base = CHARACTERS[member.characterId].stats[stat]
  const equipment = side.equipment ? (EQUIPMENT[side.equipment].bonus[stat] ?? 0) : 0
  return Math.round((base + equipment) * (1 + buffPercent(member.buffs, stat) / 100))
}

export function bossStat(boss: BossState, stat: StatKey): number {
  const definition = BOSSES[boss.bossId]
  const enrage = stat === 'atk' && boss.enraged ? definition.enrageAtkPercent : 0
  return Math.round(definition.stats[stat] * (1 + (buffPercent(boss.buffs, stat) + enrage) / 100))
}

/** Aplica um buff; o mesmo id substitui o anterior em vez de acumular. */
export function addBuff(buffs: StatusEffect[], buff: StatusEffect) {
  const index = buffs.findIndex((b) => b.id === buff.id)
  if (index >= 0) buffs[index] = buff
  else buffs.push(buff)
}

export function tickBuffs(buffs: StatusEffect[]): StatusEffect[] {
  return buffs.map((b) => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter((b) => b.turnsLeft > 0)
}

export const STAT_LABEL: Record<StatKey, string> = { atk: 'ATK', def: 'DEF' }
