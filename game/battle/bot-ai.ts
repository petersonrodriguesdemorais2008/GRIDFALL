import type { BattleAction, BattleState, TargetId } from '@/types'
import { BOSSES } from '@/data/battle/bosses'
import { CHARACTERS } from '@/data/battle/characters'
import { BATTLE_RULES } from '@/data/battle/rules'
import { activeOf } from './context'
import { maxHpOf } from './stats'
import { benchCandidates, swapBlockReason } from './swap'

/** Heurística simples do bot. Fica fora do reducer para não consumir a semente da partida. */
export function chooseBotAction(state: BattleState, random: () => number = Math.random): BattleAction {
  const side = state.enemy
  const member = activeOf(side)
  const { skill } = CHARACTERS[member.characterId]
  const hpRatio = member.hp / maxHpOf(member)
  const boss = state.boss
  const bossAttack = boss ? BOSSES[boss.bossId].attacks[boss.telegraph] : null

  if (hpRatio < 0.3 && swapBlockReason(side) === null) {
    const healthier = benchCandidates(side).find((i) => side.party[i].hp / maxHpOf(side.party[i]) > 0.6)
    if (healthier !== undefined) return { type: 'SWAP', side: 'enemy', toIndex: healthier }
  }
  if (hpRatio < 0.35 && side.inventory.smallPotion > 0) {
    return { type: 'USE_ITEM', side: 'enemy', item: 'smallPotion' }
  }
  if (skill.kind === 'heal' && hpRatio < 0.5 && member.mp >= skill.mpCost) {
    return { type: 'SKILL', side: 'enemy', target: 'opponent' }
  }
  if (bossAttack?.target === 'area' && hpRatio < 0.5) {
    if (side.inventory.ironTonic > 0) return { type: 'USE_ITEM', side: 'enemy', item: 'ironTonic' }
    if (random() < 0.5) return { type: 'DEFEND', side: 'enemy' }
  }
  if (member.mp < skill.mpCost && side.inventory.smallEther > 0 && random() < 0.4) {
    return { type: 'USE_ITEM', side: 'enemy', item: 'smallEther' }
  }

  let target: TargetId = 'opponent'
  if (boss) target = boss.hp / boss.maxHp < 0.3 || random() < 0.45 ? 'boss' : 'opponent'

  if (side.stars >= BATTLE_RULES.specialStarCost && random() < 0.7) {
    return { type: 'SPECIAL', side: 'enemy', target }
  }
  if (skill.kind === 'damage' && member.mp >= skill.mpCost && random() < 0.6) {
    return { type: 'SKILL', side: 'enemy', target }
  }
  if (member.mp < skill.mpCost && random() < 0.25) return { type: 'DEFEND', side: 'enemy' }
  return { type: 'ATTACK', side: 'enemy', target }
}
