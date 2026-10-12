import Image from 'next/image'
import { Gem, Shield, Sparkles, Star } from 'lucide-react'
import type { ImpactEvent, SideState } from '@/types'
import { CHARACTERS } from '@/data/battle/characters'
import { EQUIPMENT } from '@/data/battle/items'
import { SUPPORT_UNITS } from '@/data/battle/support-units'
import { STRINGS } from '@/data/strings'
import { activeOf } from '@/game/battle/context'
import { maxHpOf, maxMpOf, sideStat } from '@/game/battle/stats'
import { cn } from '@/lib/utils'
import { ImpactLayer, lastHitId } from './impact-layer'
import { StatBar } from './stat-bar'

interface SidePanelProps {
  side: SideState
  impacts: ImpactEvent[]
  isTurn: boolean
}

const T = STRINGS.battle

export function SidePanel({ side, impacts, isTurn }: SidePanelProps) {
  const member = activeOf(side)
  const character = CHARACTERS[member.characterId]
  const supportUnit = SUPPORT_UNITS[side.supportUnitId]
  const bench = side.party.filter((_, i) => i !== side.activeIndex)
  const isPlayer = side.id === 'player'

  return (
    <section
      aria-label={`${side.name}: ${character.name}`}
      className={cn(
        'rpg-frame flex gap-3 p-2 transition-[border-color] duration-200',
        isTurn && (isPlayer ? 'border-arcane' : 'border-destructive'),
      )}
    >
      <div key={lastHitId(impacts, side.id)} className="animate-hit-shake relative shrink-0">
        <ImpactLayer impacts={impacts} target={side.id} />
        <Image
          src={character.portrait || '/placeholder.svg'}
          alt={`${character.name}, ${character.title}`}
          width={64}
          height={64}
          className={cn(
            'size-14 border-2 bg-night-deep object-cover',
            isPlayer ? 'border-arcane' : 'border-destructive',
          )}
        />
        <span
          className={cn(
            'absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 font-display text-[7px] text-night-deep',
            isPlayer ? 'bg-arcane' : 'bg-destructive',
          )}
        >
          {side.name}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-shadow-pixel truncate font-display text-[10px] text-parchment">
            {character.name} <span className="text-parchment/50">· {character.title}</span>
          </h3>
          <span className="flex shrink-0 items-center gap-1 font-display text-[9px] text-gold" aria-label={`${side.stars} ${T.stars}`}>
            <Star className="size-3 fill-gold" aria-hidden="true" />
            {side.stars}
          </span>
        </div>

        <StatBar label="HP" value={member.hp} max={maxHpOf(member)} tone="hp" />
        <StatBar label="MP" value={member.mp} max={maxMpOf(member)} tone="mp" />

        <div className="flex flex-wrap items-center gap-1">
          <span className="font-display text-[7px] text-parchment/60">
            ATK {sideStat(side, 'atk')} · DEF {sideStat(side, 'def')}
          </span>
          {bench.map((benched) => (
            <span
              key={benched.characterId}
              className={cn(
                'border border-panel-edge/70 px-1 py-0.5 font-body text-[11px] leading-none',
                benched.hp <= 0 ? 'text-parchment/35 line-through' : 'text-parchment/70',
              )}
            >
              {T.bench}: {CHARACTERS[benched.characterId].name}{' '}
              {benched.hp <= 0 ? `(${T.knockedOut})` : `${benched.hp}/${maxHpOf(benched)}`}
            </span>
          ))}
          <span
            className="flex items-center gap-1 border border-panel-edge bg-night-deep/70 px-1 py-0.5 font-body text-[11px] leading-none text-parchment/80"
            title={supportUnit.passives.map((p) => `${p.name}: ${p.description}`).join('\n')}
          >
            <Sparkles className="size-3 text-gold" aria-hidden="true" />
            {supportUnit.name}
          </span>
          {side.equipment && (
            <span
              className="flex items-center gap-1 border border-gold-dim bg-night-deep/70 px-1 py-0.5 font-body text-[11px] leading-none text-gold"
              title={EQUIPMENT[side.equipment].description}
            >
              <Gem className="size-3" aria-hidden="true" />
              {EQUIPMENT[side.equipment].name}
            </span>
          )}
          {member.buffs.map((buff) => (
            <span
              key={buff.id}
              className="flex items-center gap-1 border border-arcane/60 bg-arcane/15 px-1 py-0.5 font-body text-[11px] leading-none text-arcane"
            >
              <Shield className="size-3" aria-hidden="true" />
              {buff.label} ({buff.turnsLeft})
            </span>
          ))}
        </div>

      </div>
    </section>
  )
}
