import Image from 'next/image'
import { AlertTriangle, Flame, Skull } from 'lucide-react'
import type { BattleState, BossAttackDefinition } from '@/types'
import { BOSSES } from '@/data/battle/bosses'
import { BOSS_SCHEDULE } from '@/data/battle/rules'
import { STRINGS } from '@/data/strings'
import { bossStat } from '@/game/battle/stats'
import { cn } from '@/lib/utils'
import { ImpactLayer, lastHitId } from './impact-layer'
import { StatBar } from './stat-bar'
import { ContributionBar } from './contribution-bar'

const T = STRINGS.battle

const targetLabel: Record<BossAttackDefinition['target'], string> = {
  single: T.single,
  area: T.area,
  self: T.self,
}

interface BossPanelProps {
  state: BattleState
}

export function BossPanel({ state }: BossPanelProps) {
  const boss = state.boss

  if (!boss) {
    const every = BOSS_SCHEDULE.everyFarming
    const nextFarming = Math.floor(state.farming / every) * every + every
    return (
      <div className="flex items-center justify-center gap-2 border-2 border-dashed border-panel-edge/70 px-3 py-2 text-parchment/55">
        <Skull className="size-4" aria-hidden="true" />
        <p className="font-display text-[8px] leading-relaxed">
          {BOSSES[BOSS_SCHEDULE.bossId].name} {T.nextBoss} {nextFarming}
        </p>
      </div>
    )
  }

  const definition = BOSSES[boss.bossId]
  const attack = definition.attacks[boss.telegraph]

  return (
    <section
      aria-label={definition.name}
      className={cn(
        'rpg-frame flex flex-col gap-1.5 p-2',
        boss.enraged ? 'animate-enrage border-destructive' : 'border-gold',
      )}
    >
      <div className="flex gap-3">
        <div key={lastHitId(state.impacts, 'boss')} className="animate-hit-shake relative shrink-0">
          <ImpactLayer impacts={state.impacts} target="boss" />
          <Image
            src={definition.portrait || '/placeholder.svg'}
            alt={definition.name}
            width={56}
            height={56}
            priority
            className={cn(
              'size-14 border-2 bg-night-deep object-cover',
              boss.enraged ? 'border-destructive saturate-150' : 'border-gold-dim',
            )}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-shadow-pixel font-display text-[11px] text-gold">{definition.name}</h3>
            {boss.enraged && (
              <span className="flex items-center gap-1 bg-destructive px-1.5 py-0.5 font-display text-[7px] text-parchment">
                <Flame className="size-3" aria-hidden="true" />
                {T.enraged}
              </span>
            )}
          </div>
          <StatBar label="HP" value={boss.hp} max={boss.maxHp} tone="boss" size="md" />
          <p className="font-display text-[7px] text-parchment/55">
            ATK {bossStat(boss, 'atk')} · DEF {bossStat(boss, 'def')}
            {boss.buffs.map((b) => ` · ${b.label} (${b.turnsLeft})`).join('')}
          </p>
          <ContributionBar player={boss.contribution.player} enemy={boss.contribution.enemy} />
        </div>
      </div>

      <div
        role="status"
        className={cn(
          'flex items-center gap-2 border-2 px-2 py-1',
          attack.target === 'area' ? 'border-destructive/70 bg-destructive/15' : 'border-gold-dim/60 bg-night-deep/60',
        )}
      >
        <AlertTriangle
          className={cn('size-4 shrink-0', attack.target === 'area' ? 'text-destructive' : 'text-gold')}
          aria-hidden="true"
        />
        <p className="min-w-0 font-body text-sm leading-tight text-parchment/75">
          <span className="font-display text-[8px] text-gold">
            {T.nextAttack}: {attack.name} [{targetLabel[attack.target]}]
          </span>{' '}
          {attack.telegraph}
        </p>
      </div>
    </section>
  )
}
