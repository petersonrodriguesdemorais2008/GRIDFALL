import type {
  BattleAction,
  BattleLoadout,
  BattleState,
  CombatantState,
  SideId,
  SideState,
  TargetId,
} from '@/types'
import { CHARACTER_IDS, CHARACTERS } from '@/data/battle/characters'
import { CONSUMABLES } from '@/data/battle/items'
import { BATTLE_RULES, BOSS_SCHEDULE, SWAP_RULES } from '@/data/battle/rules'
import { SUPPORT_UNIT_IDS, SUPPORT_UNITS } from '@/data/battle/support-units'
import { activeOf, getSide, log, opponentOf } from './context'
import { checkWinner, damageBoss, damageSide, healActive, rollDamage } from './combat'
import { runPassives, tickPassiveCooldowns } from './passives'
import { addBuff, bossStat, maxHpOf, maxMpOf, sideStat, tickBuffs } from './stats'
import { bossTakeTurn, spawnBoss } from './boss-ai'
import { performSwap } from './swap'

type ActionOutcome = 'invalid' | 'continue' | 'ended'

function createCombatant(characterId: CombatantState['characterId']): CombatantState {
  const { stats } = CHARACTERS[characterId]
  return { characterId, hp: stats.maxHp, mp: stats.maxMp, buffs: [] }
}

function createSide(id: SideId, name: string, loadout: BattleLoadout): SideState {
  return {
    id,
    name,
    party: [createCombatant(loadout.mainId), createCombatant(loadout.supportCharacterId)],
    activeIndex: 0,
    supportUnitId: loadout.supportUnitId,
    passiveCooldowns: {},
    stars: 0,
    inventory: { ...BATTLE_RULES.startingInventory },
    equipment: null,
    swap: { cooldown: 0, used: 0 },
  }
}

export function randomLoadout(random: () => number = Math.random): BattleLoadout {
  const ids = [...CHARACTER_IDS].sort(() => random() - 0.5)
  return {
    mainId: ids[0],
    supportCharacterId: ids[1],
    supportUnitId: SUPPORT_UNIT_IDS[Math.floor(random() * SUPPORT_UNIT_IDS.length)],
  }
}

/* ---------- Fluxo de turnos ---------- */

function beginSideTurn(state: BattleState, sideId: SideId) {
  const side = getSide(state, sideId)
  const member = activeOf(side)
  member.buffs = tickBuffs(member.buffs)
  tickPassiveCooldowns(side)
  side.swap.cooldown = Math.max(0, side.swap.cooldown - 1)
  runPassives(state, sideId, 'turnStart')
}

function startFarming(state: BattleState) {
  for (const side of [state.player, state.enemy]) {
    side.stars = Math.min(BATTLE_RULES.maxStars, side.stars + BATTLE_RULES.starsPerFarming)
  }
  log(state, `Farming ${state.farming} começou. +${BATTLE_RULES.starsPerFarming} estrela para cada lado.`, 'system')
  if (state.farming % BOSS_SCHEDULE.everyFarming === 0 && !state.boss) {
    spawnBoss(state, BOSS_SCHEDULE.bossId)
  }
}

function endRound(state: BattleState) {
  state.round++
  if (state.round > BATTLE_RULES.roundsPerFarming) {
    state.farming++
    state.round = 1
    startFarming(state)
  }
  state.turn = 'player'
  beginSideTurn(state, 'player')
}

function endTurn(state: BattleState) {
  if (state.turn === 'player') {
    state.turn = 'enemy'
    beginSideTurn(state, 'enemy')
  } else if (state.turn === 'enemy' && state.boss) {
    state.turn = 'boss'
    state.boss.buffs = tickBuffs(state.boss.buffs)
  } else {
    endRound(state)
  }
}

/* ---------- Ações ---------- */

function strike(state: BattleState, sideId: SideId, target: TargetId, power: number, pierce: number, label: string) {
  const attacker = getSide(state, sideId)
  const atk = sideStat(attacker, 'atk')
  const attackerName = CHARACTERS[activeOf(attacker).characterId].name

  if (target === 'boss' && state.boss) {
    const amount = rollDamage(state, atk, power, bossStat(state.boss, 'def'), pierce)
    log(state, `${attackerName} usou ${label} no boss: ${amount} de dano.`, sideId)
    damageBoss(state, sideId, amount)
    return
  }
  const defenderId = opponentOf(sideId)
  const defender = getSide(state, defenderId)
  const defenderName = CHARACTERS[activeOf(defender).characterId].name
  const amount = rollDamage(state, atk, power, sideStat(defender, 'def'), pierce)
  log(state, `${attackerName} usou ${label} em ${defenderName}: ${amount} de dano.`, sideId)
  damageSide(state, defenderId, amount)
}

function performSideAction(state: BattleState, action: Exclude<BattleAction, { type: 'BOSS_ACT' | 'DISMISS_REWARD' | 'RESET' }>): ActionOutcome {
  const side = getSide(state, action.side)
  const member = activeOf(side)
  const character = CHARACTERS[member.characterId]

  if ('target' in action && action.target === 'boss' && !state.boss) return 'invalid'

  switch (action.type) {
    case 'ATTACK':
      strike(state, action.side, action.target, 1, 0, 'Ataque')
      return 'ended'

    case 'SKILL': {
      const { skill } = character
      if (member.mp < skill.mpCost) return 'invalid'
      member.mp -= skill.mpCost
      if (skill.kind === 'heal') {
        const healed = healActive(state, action.side, Math.round(maxHpOf(member) * skill.power))
        log(state, `${character.name} usou ${skill.name}: +${healed} HP.`, action.side)
      } else {
        strike(state, action.side, action.target, skill.power, skill.pierce ?? 0, skill.name)
      }
      return 'ended'
    }

    case 'SPECIAL':
      if (side.stars < BATTLE_RULES.specialStarCost) return 'invalid'
      side.stars -= BATTLE_RULES.specialStarCost
      strike(state, action.side, action.target, BATTLE_RULES.specialPower, BATTLE_RULES.specialPierce, 'Golpe Estelar')
      return 'ended'

    case 'DEFEND':
      addBuff(member.buffs, {
        id: 'defend',
        label: `Defesa +${BATTLE_RULES.defendDefPercent}% DEF`,
        stat: 'def',
        percent: BATTLE_RULES.defendDefPercent,
        turnsLeft: 1,
      })
      member.mp = Math.min(maxMpOf(member), member.mp + BATTLE_RULES.defendMpRestore)
      log(state, `${character.name} se defendeu (+${BATTLE_RULES.defendMpRestore} MP).`, action.side)
      return 'ended'

    case 'USE_ITEM': {
      if (side.inventory[action.item] <= 0) return 'invalid'
      const item = CONSUMABLES[action.item]
      side.inventory[action.item]--
      const effect = item.effect
      if (effect.type === 'heal') healActive(state, action.side, effect.amount)
      else if (effect.type === 'restoreMp') member.mp = Math.min(maxMpOf(member), member.mp + effect.amount)
      else
        addBuff(member.buffs, {
          id: `item.${item.id}`,
          label: item.name,
          stat: effect.stat,
          percent: effect.percent,
          turnsLeft: effect.turns,
        })
      log(state, `${character.name} usou ${item.name}.`, action.side)
      return 'ended'
    }

    case 'SWAP':
      if (!performSwap(state, action.side, action.toIndex)) return 'invalid'
      return SWAP_RULES.endsTurn ? 'ended' : 'continue'
  }
}

export function createBattle(loadout: BattleLoadout, botLoadout: BattleLoadout, seed: number): BattleState {
  const state: BattleState = {
    seed,
    farming: 1,
    round: 1,
    turn: 'player',
    player: createSide('player', 'Você', loadout),
    enemy: createSide('enemy', 'Bot', botLoadout),
    boss: null,
    bossesDefeated: 0,
    pendingReward: null,
    winner: null,
    log: [],
    impacts: [],
    nextEventId: 1,
  }
  log(
    state,
    `A batalha começou! Bot escalou ${CHARACTERS[botLoadout.mainId].name} com ${SUPPORT_UNITS[botLoadout.supportUnitId].name}.`,
    'system',
  )
  startFarming(state)
  beginSideTurn(state, 'player')
  return state
}

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  if (action.type === 'RESET') return action.state
  if (action.type === 'DISMISS_REWARD') {
    return state.pendingReward ? { ...state, pendingReward: null } : state
  }
  if (state.winner || state.pendingReward) return state

  const draft = structuredClone(state)

  if (action.type === 'BOSS_ACT') {
    if (state.turn !== 'boss' || !draft.boss) return state
    bossTakeTurn(draft)
    checkWinner(draft)
    if (!draft.winner) endTurn(draft)
    return draft
  }

  if (action.side !== state.turn) return state
  const outcome = performSideAction(draft, action)
  if (outcome === 'invalid') return state
  checkWinner(draft)
  if (outcome === 'ended' && !draft.winner) endTurn(draft)
  return draft
}
