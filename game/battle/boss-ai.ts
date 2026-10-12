import type { BattleState, BossState, SideId } from '@/types'
import { BOSSES } from '@/data/battle/bosses'
import { activeOf, getSide, log, rand } from './context'
import { damageSide, rollDamage } from './combat'
import { addBuff, bossStat, sideStat, STAT_LABEL } from './stats'

export function spawnBoss(state: BattleState, bossId: BossState['bossId']) {
  const definition = BOSSES[bossId]
  state.boss = {
    bossId,
    hp: definition.stats.maxHp,
    maxHp: definition.stats.maxHp,
    enraged: false,
    patternIndex: 0,
    telegraph: definition.pattern[0],
    buffs: [],
    contribution: { player: 0, enemy: 0 },
    lastHitBy: null,
  }
  log(state, `${definition.name} surgiu no Farming ${state.farming}!`, 'boss')
}

/** Alvo único: quem causou mais dano (ameaça). Empate é decidido no acaso. */
function pickThreatTarget(state: BattleState, boss: BossState): SideId {
  const { player, enemy } = boss.contribution
  if (player === enemy) return rand(state) < 0.5 ? 'player' : 'enemy'
  return player > enemy ? 'player' : 'enemy'
}

function hitSide(state: BattleState, boss: BossState, sideId: SideId, power: number) {
  const side = getSide(state, sideId)
  if (activeOf(side).hp <= 0) return 0
  const amount = rollDamage(state, bossStat(boss, 'atk'), power, sideStat(side, 'def'))
  return damageSide(state, sideId, amount)
}

/** Executa o ataque anunciado (telegraph) e anuncia o próximo. */
export function bossTakeTurn(state: BattleState) {
  const boss = state.boss
  if (!boss) return
  const definition = BOSSES[boss.bossId]
  const attack = definition.attacks[boss.telegraph]

  switch (attack.target) {
    case 'single': {
      const target = pickThreatTarget(state, boss)
      const dealt = hitSide(state, boss, target, attack.power)
      log(state, `${definition.name} usou ${attack.name} em ${getSide(state, target).name}: ${dealt} de dano.`, 'boss')
      break
    }
    case 'area': {
      const toPlayer = hitSide(state, boss, 'player', attack.power)
      const toEnemy = hitSide(state, boss, 'enemy', attack.power)
      log(state, `${definition.name} usou ${attack.name}! Você: ${toPlayer}, Bot: ${toEnemy}.`, 'boss')
      break
    }
    case 'self': {
      if (attack.selfBuff) {
        addBuff(boss.buffs, {
          id: `boss.${attack.id}`,
          label: `${attack.name} +${attack.selfBuff.percent}% ${STAT_LABEL[attack.selfBuff.stat]}`,
          stat: attack.selfBuff.stat,
          percent: attack.selfBuff.percent,
          turnsLeft: attack.selfBuff.turns,
        })
      }
      log(state, `${definition.name} usou ${attack.name}.`, 'boss')
      break
    }
  }

  const pattern = boss.enraged ? definition.enragedPattern : definition.pattern
  boss.patternIndex = (boss.patternIndex + 1) % pattern.length
  boss.telegraph = pattern[boss.patternIndex]
}
