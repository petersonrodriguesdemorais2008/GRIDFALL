import type {
  BattleState,
  BossRewardReport,
  BossState,
  RewardGrant,
  SideId,
  SideRewardReport,
} from '@/types'
import { BOSSES } from '@/data/battle/bosses'
import { CONSUMABLE_IDS, CONSUMABLES, EQUIPMENT, EQUIPMENT_IDS } from '@/data/battle/items'
import {
  BATTLE_RULES,
  DUPLICATE_EQUIPMENT_STARS,
  LAST_HIT_BONUS_STARS,
  REWARD_TIERS,
  type RewardTierDefinition,
} from '@/data/battle/rules'
import { activeOf, getSide, impact, log, pick } from './context'
import { addBuff, maxHpOf, maxMpOf, STAT_LABEL } from './stats'

export function tierForShare(share: number): RewardTierDefinition | null {
  return REWARD_TIERS.find((tier) => share >= tier.minShare) ?? null
}

function buildSideReport(state: BattleState, boss: BossState, sideId: SideId, total: number): SideRewardReport {
  const side = getSide(state, sideId)
  const damage = boss.contribution[sideId]
  const share = total > 0 ? damage / total : 0
  const tier = tierForShare(share)
  const lastHit = boss.lastHitBy === sideId
  const grants: RewardGrant[] = []

  if (tier) {
    grants.push({ type: 'stars', amount: tier.stars })
    grants.push({ type: 'hp', amount: Math.round(maxHpOf(activeOf(side)) * tier.hpPercent) })
    grants.push({ type: 'mp', amount: tier.mp })
    if (tier.consumable) grants.push({ type: 'consumable', item: pick(state, CONSUMABLE_IDS) })
    if (tier.buff) grants.push({ type: 'buff', ...tier.buff })
    if (tier.equipment) {
      grants.push(
        side.equipment
          ? { type: 'stars', amount: DUPLICATE_EQUIPMENT_STARS, reason: 'Equipamento repetido' }
          : { type: 'equipment', item: pick(state, EQUIPMENT_IDS) },
      )
    }
  }
  if (lastHit) grants.push({ type: 'stars', amount: LAST_HIT_BONUS_STARS, reason: 'Último golpe' })

  return { damage, share, tier: tier?.id ?? 'none', lastHit, grants }
}

/** A recompensa é proporcional ao dano total causado — o último golpe dá só um bônus pequeno. */
export function buildRewardReport(state: BattleState, boss: BossState): BossRewardReport {
  const total = boss.contribution.player + boss.contribution.enemy
  return {
    bossName: BOSSES[boss.bossId].name,
    totalDamage: total,
    sides: {
      player: buildSideReport(state, boss, 'player', total),
      enemy: buildSideReport(state, boss, 'enemy', total),
    },
  }
}

export function applyGrants(state: BattleState, sideId: SideId, grants: RewardGrant[]) {
  const side = getSide(state, sideId)
  const member = activeOf(side)

  for (const grant of grants) {
    switch (grant.type) {
      case 'stars':
        side.stars = Math.min(BATTLE_RULES.maxStars, side.stars + grant.amount)
        break
      case 'hp':
        if (member.hp > 0 && grant.amount > 0) {
          member.hp = Math.min(maxHpOf(member), member.hp + grant.amount)
          impact(state, sideId, grant.amount, 'heal')
        }
        break
      case 'mp':
        member.mp = Math.min(maxMpOf(member), member.mp + grant.amount)
        break
      case 'consumable':
        side.inventory[grant.item] = Math.min(BATTLE_RULES.maxPerConsumable, side.inventory[grant.item] + 1)
        break
      case 'buff':
        addBuff(member.buffs, {
          id: `reward.${grant.stat}`,
          label: `Espólio +${grant.percent}% ${STAT_LABEL[grant.stat]}`,
          stat: grant.stat,
          percent: grant.percent,
          turnsLeft: grant.turns,
        })
        break
      case 'equipment':
        side.equipment = grant.item
        break
    }
  }
}

export function describeGrant(grant: RewardGrant): string {
  switch (grant.type) {
    case 'stars':
      return `+${grant.amount} estrela${grant.amount > 1 ? 's' : ''}${grant.reason ? ` (${grant.reason})` : ''}`
    case 'hp':
      return `+${grant.amount} HP`
    case 'mp':
      return `+${grant.amount} MP`
    case 'consumable':
      return CONSUMABLES[grant.item].name
    case 'buff':
      return `+${grant.percent}% ${STAT_LABEL[grant.stat]} (${grant.turns} turnos)`
    case 'equipment':
      return `${EQUIPMENT[grant.item].name} (${EQUIPMENT[grant.item].description})`
  }
}

export function grantRewards(state: BattleState, boss: BossState) {
  const report = buildRewardReport(state, boss)
  applyGrants(state, 'player', report.sides.player.grants)
  applyGrants(state, 'enemy', report.sides.enemy.grants)
  state.pendingReward = report
  log(
    state,
    `${report.bossName} derrotado! Contribuição: você ${Math.round(report.sides.player.share * 100)}%, bot ${Math.round(report.sides.enemy.share * 100)}%.`,
    'reward',
  )
}
