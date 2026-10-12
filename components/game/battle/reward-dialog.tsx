'use client'

import { Crown, Gift } from 'lucide-react'
import type { BossRewardReport, SideId, SideRewardReport } from '@/types'
import { STRINGS } from '@/data/strings'
import { describeGrant } from '@/game/battle/rewards'
import { cn } from '@/lib/utils'
import { RpgButton } from '../ui/rpg-button'
import { ContributionBar } from './contribution-bar'

const T = STRINGS.battle

interface RewardDialogProps {
  report: BossRewardReport
  onClose: () => void
}

export function RewardDialog({ report, onClose }: RewardDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-heading"
      className="absolute inset-0 z-30 flex items-center justify-center bg-night-deep/85 p-4 backdrop-blur-[2px]"
    >
      <div className="rpg-frame animate-rise-in flex w-full max-w-md flex-col gap-3 p-4">
        <div className="flex items-center justify-center gap-2">
          <Gift className="size-5 text-gold" aria-hidden="true" />
          <h2 id="reward-heading" className="text-shadow-pixel text-center font-display text-xs text-gold">
            {report.bossName} {T.rewardHeading}
          </h2>
        </div>
        <p className="text-center font-display text-[8px] text-parchment/60">
          {T.rewardTotal}: {report.totalDamage}
        </p>

        <ContributionBar player={report.sides.player.damage} enemy={report.sides.enemy.damage} />

        <div className="grid grid-cols-2 gap-2">
          <SideRewards sideId="player" report={report.sides.player} />
          <SideRewards sideId="enemy" report={report.sides.enemy} />
        </div>

        <RpgButton onClick={onClose} autoFocus>
          {T.continue}
        </RpgButton>
      </div>
    </div>
  )
}

function SideRewards({ sideId, report }: { sideId: SideId; report: SideRewardReport }) {
  const isPlayer = sideId === 'player'
  return (
    <section
      className={cn(
        'flex flex-col gap-1.5 border-2 bg-night-deep/60 p-2',
        isPlayer ? 'border-arcane/70' : 'border-destructive/70',
      )}
    >
      <h3 className={cn('font-display text-[9px]', isPlayer ? 'text-arcane' : 'text-destructive')}>
        {isPlayer ? T.you : T.bot} · {Math.round(report.share * 100)}%
      </h3>
      <p className="font-display text-[7px] leading-relaxed text-parchment/70">{T.tiers[report.tier]}</p>
      {report.lastHit && (
        <p className="flex items-center gap-1 font-display text-[7px] text-gold">
          <Crown className="size-3" aria-hidden="true" />
          {T.lastHit}
        </p>
      )}
      {report.grants.length === 0 ? (
        <p className="text-xs text-parchment/55">{T.noReward}</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {report.grants.map((grant, i) => (
            <li key={i} className="font-body text-sm leading-tight text-parchment">
              {describeGrant(grant)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
