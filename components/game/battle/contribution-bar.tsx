import { STRINGS } from '@/data/strings'

interface ContributionBarProps {
  player: number
  enemy: number
}

const T = STRINGS.battle

/** Divisão do dano causado ao boss entre os dois lados. */
export function ContributionBar({ player, enemy }: ContributionBarProps) {
  const total = player + enemy
  const playerShare = total > 0 ? player / total : 0.5
  const playerPct = total > 0 ? Math.round(playerShare * 100) : 0
  const enemyPct = total > 0 ? 100 - playerPct : 0

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between font-display text-[7px]">
        <span className="text-arcane">
          {T.you} {player} ({playerPct}%)
        </span>
        <span className="text-parchment/60">{T.contribution}</span>
        <span className="text-destructive">
          {T.bot} {enemy} ({enemyPct}%)
        </span>
      </div>
      <div
        role="meter"
        aria-label={`${T.contribution}: ${T.you} ${playerPct}%, ${T.bot} ${enemyPct}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={playerPct}
        className="flex h-2 overflow-hidden border-2 border-night-deep bg-night-deep"
      >
        <div className="h-full bg-arcane transition-[width] duration-500" style={{ width: `${playerShare * 100}%` }} />
        <div className="h-full flex-1 bg-destructive" />
      </div>
    </div>
  )
}
