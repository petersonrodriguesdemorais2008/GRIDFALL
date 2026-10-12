'use client'

import type { BattleState } from '@/types'
import { STRINGS } from '@/data/strings'
import { cn } from '@/lib/utils'
import { RpgButton } from '../ui/rpg-button'

const T = STRINGS.battle

interface BattleResultProps {
  state: BattleState
  onRestart: () => void
  onExit: () => void
}

export function BattleResult({ state, onRestart, onExit }: BattleResultProps) {
  const title = state.winner === 'player' ? T.victory : state.winner === 'enemy' ? T.defeat : T.draw

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-heading"
      className="absolute inset-0 z-30 flex items-center justify-center bg-night-deep/85 p-6 backdrop-blur-[2px]"
    >
      <div className="rpg-frame animate-rise-in flex w-full max-w-xs flex-col gap-4 p-5">
        <h2
          id="result-heading"
          className={cn(
            'text-shadow-pixel text-center font-display text-lg',
            state.winner === 'player' ? 'text-gold' : state.winner === 'enemy' ? 'text-destructive' : 'text-parchment',
          )}
        >
          {title}
        </h2>
        <dl className="grid grid-cols-2 gap-2 text-center">
          <div className="border-2 border-panel-edge bg-night-deep/60 p-2">
            <dt className="font-display text-[7px] text-parchment/60">{T.reachedFarming}</dt>
            <dd className="font-display text-sm text-parchment">{state.farming}</dd>
          </div>
          <div className="border-2 border-panel-edge bg-night-deep/60 p-2">
            <dt className="font-display text-[7px] text-parchment/60">{T.bossesDefeated}</dt>
            <dd className="font-display text-sm text-parchment">{state.bossesDefeated}</dd>
          </div>
        </dl>
        <RpgButton onClick={onRestart} autoFocus>
          {T.playAgain}
        </RpgButton>
        <RpgButton variant="ghost" onClick={onExit}>
          {T.toMenu}
        </RpgButton>
      </div>
    </div>
  )
}
