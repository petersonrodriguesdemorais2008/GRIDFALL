'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { BattleAction, BattleLoadout, BattleState } from '@/types'
import { battleReducer, createBattle, randomLoadout } from '@/game/battle/battle-engine'
import { chooseBotAction } from '@/game/battle/bot-ai'

const BOT_DELAY_MS = 900
const BOSS_DELAY_MS = 1100

function newBattle(loadout: BattleLoadout) {
  return createBattle(loadout, randomLoadout(), Math.floor(Math.random() * 2 ** 31))
}

/** Liga o motor puro da batalha ao React e agenda os turnos do bot e do boss. */
export function useBattle(loadout: BattleLoadout, paused: boolean) {
  const [state, dispatch] = useReducer(battleReducer, loadout, newBattle)
  const stateRef = useRef<BattleState>(state)
  stateRef.current = state

  const blocked = paused || state.winner !== null || state.pendingReward !== null

  useEffect(() => {
    if (blocked || state.turn === 'player') return
    const delay = state.turn === 'boss' ? BOSS_DELAY_MS : BOT_DELAY_MS
    const id = window.setTimeout(() => {
      const current = stateRef.current
      if (current.turn === 'boss') {
        dispatch({ type: 'BOSS_ACT' })
        return
      }
      const action = chooseBotAction(current)
      const next = battleReducer(current, action)
      dispatch(next === current ? { type: 'ATTACK', side: 'enemy', target: 'opponent' } : action)
    }, delay)
    return () => window.clearTimeout(id)
  }, [blocked, state.turn, state.nextEventId])

  const restart = useCallback(() => dispatch({ type: 'RESET', state: newBattle(loadout) }), [loadout])
  const act = useCallback((action: BattleAction) => dispatch(action), [])

  return { state, act, restart }
}
