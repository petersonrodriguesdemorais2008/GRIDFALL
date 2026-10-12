'use client'

import { useEffect, useState } from 'react'
import { Pause } from 'lucide-react'
import { BATTLE_RULES } from '@/data/battle/rules'
import { STRINGS } from '@/data/strings'
import { randomLoadout } from '@/game/battle/battle-engine'
import { useGameDispatch, useGameStore } from '@/hooks/use-game-store'
import { getInputManager } from '@/hooks/use-input'
import { MenuBackground } from '../screens/main-menu/menu-background'
import { PauseMenu } from '../screens/pause-menu'
import { ActionBar } from './action-bar'
import { BattleLog } from './battle-log'
import { BattleResult } from './battle-result'
import { BossPanel } from './boss-panel'
import { RewardDialog } from './reward-dialog'
import { SidePanel } from './side-panel'
import { useBattle } from './use-battle'

const T = STRINGS.battle

export function BattleScreen() {
  const dispatch = useGameDispatch()
  const isPaused = useGameStore((s) => s.phase === 'paused')
  const sessionLoadout = useGameStore((s) => s.session?.loadout ?? null)
  const [loadout] = useState(() => sessionLoadout ?? randomLoadout())
  const { state, act, restart } = useBattle(loadout, isPaused)

  useEffect(() => {
    const input = getInputManager()
    return input.subscribe((key, pressed) => {
      if (key === 'menu' && pressed) dispatch({ type: isPaused ? 'RESUME' : 'PAUSE' })
    })
  }, [dispatch, isPaused])

  return (
    <section className="relative flex h-full flex-col overflow-hidden" aria-label={STRINGS.menu.play}>
      <MenuBackground />

      <header className="relative z-10 flex items-center gap-2 px-3 pt-2">
        <div className="flex flex-1 items-center justify-between rounded-lg border-2 border-gold-dim bg-night-deep/85 px-3 py-1.5">
          <p className="text-shadow-pixel font-display text-[10px] text-gold">
            {T.farming} {state.farming}
          </p>
          <p className="font-display text-[8px] text-parchment/70">
            {T.round} {state.round}/{BATTLE_RULES.roundsPerFarming}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'PAUSE' })}
          aria-label={T.pause}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-panel-edge bg-[linear-gradient(180deg,oklch(0.35_0.06_270),oklch(0.24_0.05_270))] text-parchment focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
        >
          <Pause className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 [scrollbar-width:thin]">
        <SidePanel side={state.enemy} impacts={state.impacts} isTurn={state.turn === 'enemy'} />
        <BossPanel state={state} />
        <BattleLog entries={state.log} />
        <SidePanel side={state.player} impacts={state.impacts} isTurn={state.turn === 'player'} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl">
        <ActionBar state={state} disabled={isPaused || state.winner !== null || state.pendingReward !== null} onAction={act} />
      </div>

      {state.pendingReward && !state.winner && (
        <RewardDialog report={state.pendingReward} onClose={() => act({ type: 'DISMISS_REWARD' })} />
      )}
      {state.winner && (
        <BattleResult state={state} onRestart={restart} onExit={() => dispatch({ type: 'RETURN_TO_TITLE' })} />
      )}
      {isPaused && <PauseMenu />}
    </section>
  )
}
