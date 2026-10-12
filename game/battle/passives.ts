import type {
  BattleState,
  PassiveCondition,
  PassiveDefinition,
  PassiveTrigger,
  SideId,
  SideState,
} from '@/types'
import { SUPPORT_UNITS } from '@/data/battle/support-units'
import { activeOf, getSide, impact, log } from './context'
import { addBuff, maxHpOf, maxMpOf, STAT_LABEL } from './stats'

function conditionMet(state: BattleState, side: SideState, condition: PassiveCondition): boolean {
  const member = activeOf(side)
  switch (condition.type) {
    case 'always':
      return true
    case 'hpBelow':
      return member.hp > 0 && member.hp / maxHpOf(member) < condition.ratio
    case 'mpBelow':
      return member.mp / maxMpOf(member) < condition.ratio
    case 'bossPresent':
      return state.boss !== null
  }
}

function applyPassive(state: BattleState, sideId: SideId, passive: PassiveDefinition) {
  const side = getSide(state, sideId)
  const member = activeOf(side)
  const unitName = SUPPORT_UNITS[side.supportUnitId].name
  const effect = passive.effect

  switch (effect.type) {
    case 'buff': {
      addBuff(member.buffs, {
        id: passive.id,
        label: `${passive.name} +${effect.percent}% ${STAT_LABEL[effect.stat]}`,
        stat: effect.stat,
        percent: effect.percent,
        turnsLeft: effect.turns,
      })
      log(state, `${unitName} ativou ${passive.name}: +${effect.percent}% ${STAT_LABEL[effect.stat]}.`, sideId)
      break
    }
    case 'healPercent': {
      const amount = Math.max(1, Math.round((maxHpOf(member) * effect.percent) / 100))
      member.hp = Math.min(maxHpOf(member), member.hp + amount)
      impact(state, sideId, amount, 'heal')
      log(state, `${unitName} ativou ${passive.name}: +${amount} HP.`, sideId)
      break
    }
    case 'restoreMp': {
      member.mp = Math.min(maxMpOf(member), member.mp + effect.amount)
      log(state, `${unitName} ativou ${passive.name}: +${effect.amount} MP.`, sideId)
      break
    }
  }
}

/** Avalia todas as passivas da Support Unit do lado para um gatilho. */
export function runPassives(state: BattleState, sideId: SideId, trigger: PassiveTrigger) {
  const side = getSide(state, sideId)
  if (activeOf(side).hp <= 0) return

  for (const passive of SUPPORT_UNITS[side.supportUnitId].passives) {
    if (passive.trigger !== trigger) continue
    if ((side.passiveCooldowns[passive.id] ?? 0) > 0) continue
    if (!passive.conditions.every((c) => conditionMet(state, side, c))) continue
    applyPassive(state, sideId, passive)
    if (passive.cooldownTurns > 0) side.passiveCooldowns[passive.id] = passive.cooldownTurns
  }
}

export function tickPassiveCooldowns(side: SideState) {
  for (const id of Object.keys(side.passiveCooldowns)) {
    side.passiveCooldowns[id] = Math.max(0, side.passiveCooldowns[id] - 1)
  }
}
