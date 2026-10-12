'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ChevronLeft, Sparkles, Swords, Users } from 'lucide-react'
import type { BattleLoadout, CharacterId, SupportUnitId } from '@/types'
import { CHARACTER_IDS, CHARACTERS } from '@/data/battle/characters'
import { SUPPORT_UNIT_IDS, SUPPORT_UNITS } from '@/data/battle/support-units'
import { STRINGS } from '@/data/strings'
import { createId } from '@/lib/id'
import { cn } from '@/lib/utils'
import { useGameDispatch } from '@/hooks/use-game-store'
import { MenuBackground } from '../main-menu/menu-background'
import { RpgButton } from '../../ui/rpg-button'

const T = STRINGS.teamSelect

export function TeamSelectScreen() {
  const dispatch = useGameDispatch()
  const [loadout, setLoadout] = useState<BattleLoadout>({
    mainId: 'knight',
    supportCharacterId: 'mage',
    supportUnitId: 'guardian',
  })

  const setMain = (id: CharacterId) =>
    setLoadout((prev) => ({
      ...prev,
      mainId: id,
      supportCharacterId: prev.supportCharacterId === id ? prev.mainId : prev.supportCharacterId,
    }))

  const setSupportCharacter = (id: CharacterId) => {
    if (id === loadout.mainId) return
    setLoadout((prev) => ({ ...prev, supportCharacterId: id }))
  }

  const setSupportUnit = (id: SupportUnitId) => setLoadout((prev) => ({ ...prev, supportUnitId: id }))

  const start = () => dispatch({ type: 'START_GAME', playerId: createId('player'), mode: 'vsBot', loadout })

  return (
    <section className="relative flex h-full flex-col overflow-hidden" aria-labelledby="team-heading">
      <MenuBackground />

      <header className="animate-rise-in relative z-10 flex items-center gap-2 px-4 pt-3">
        <button
          type="button"
          onClick={() => dispatch({ type: 'OPEN_MODE_SELECT' })}
          aria-label={T.back}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg border-2 border-panel-edge bg-[linear-gradient(180deg,oklch(0.35_0.06_270),oklch(0.24_0.05_270))] text-parchment focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>
        <div className="flex flex-1 flex-col items-center rounded-lg border-2 border-gold-dim bg-night-deep/85 px-4 py-2">
          <h2 id="team-heading" className="text-shadow-pixel flex items-center gap-2 font-display text-sm text-gold uppercase">
            <Users className="size-4" aria-hidden="true" />
            {T.heading}
          </h2>
          <p className="font-body text-sm text-parchment/65">{T.subheading}</p>
        </div>
        <span aria-hidden="true" className="size-11 shrink-0" />
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
          <Group title={T.mainUnit} hint={T.mainUnitHint}>
            {CHARACTER_IDS.map((id) => (
              <CharacterOption key={id} id={id} selected={loadout.mainId === id} onSelect={() => setMain(id)} />
            ))}
          </Group>

          <Group title={T.supportCharacter} hint={T.supportCharacterHint}>
            {CHARACTER_IDS.map((id) => (
              <CharacterOption
                key={id}
                id={id}
                selected={loadout.supportCharacterId === id}
                disabled={loadout.mainId === id}
                onSelect={() => setSupportCharacter(id)}
              />
            ))}
          </Group>

          <Group title={T.supportUnit} hint={T.supportUnitHint}>
            {SUPPORT_UNIT_IDS.map((id) => {
              const unit = SUPPORT_UNITS[id]
              const selected = loadout.supportUnitId === id
              return (
                <OptionButton key={id} selected={selected} onSelect={() => setSupportUnit(id)}>
                  <span className="flex items-center gap-1.5 font-display text-[8px] text-parchment">
                    <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
                    {unit.name}
                  </span>
                  {unit.passives.map((p) => (
                    <span key={p.id} className="text-left font-body text-xs leading-tight text-parchment/70">
                      <span className="text-gold">{p.name}:</span> {p.description}
                    </span>
                  ))}
                </OptionButton>
              )
            })}
          </Group>
        </div>
      </div>

      <footer className="relative z-10 border-t-[3px] border-panel-edge bg-[linear-gradient(180deg,oklch(0.26_0.05_270),oklch(0.16_0.045_270))] px-4 py-3">
        <RpgButton onClick={start} className="mx-auto flex max-w-xs">
          <Swords className="size-4" aria-hidden="true" />
          {T.start}
        </RpgButton>
      </footer>
    </section>
  )
}

function Group({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <fieldset className="rpg-frame flex flex-col gap-2 p-3">
      <legend className="sr-only">{title}</legend>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <h3 aria-hidden="true" className="text-shadow-pixel font-display text-[10px] text-gold">
          {title}
        </h3>
        <p className="font-body text-xs text-parchment/60">{hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>
    </fieldset>
  )
}

function OptionButton({
  selected,
  disabled,
  onSelect,
  children,
}: {
  selected: boolean
  disabled?: boolean
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start gap-1 border-[3px] bg-night-deep/70 p-2 transition-[border-color,filter,opacity] duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane disabled:cursor-not-allowed disabled:opacity-35',
        selected ? 'border-gold shadow-[0_0_0_2px_oklch(0.83_0.14_85/0.25)]' : 'border-panel-edge',
      )}
    >
      {children}
    </button>
  )
}

function CharacterOption({
  id,
  selected,
  disabled,
  onSelect,
}: {
  id: CharacterId
  selected: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  const character = CHARACTERS[id]
  const { stats, skill } = character
  return (
    <OptionButton selected={selected} disabled={disabled} onSelect={onSelect}>
      <span className="flex w-full items-center gap-2">
        <Image
          src={character.portrait || '/placeholder.svg'}
          alt=""
          width={40}
          height={40}
          className="size-10 border-2 border-panel-edge object-cover"
        />
        <span className="flex min-w-0 flex-col text-left">
          <span className="truncate font-display text-[8px] text-parchment">{character.name}</span>
          <span className="font-body text-xs text-parchment/60">
            {disabled ? STRINGS.teamSelect.inUse : character.title}
          </span>
        </span>
      </span>
      <span className="font-display text-[7px] leading-relaxed text-parchment/70">
        HP {stats.maxHp} · MP {stats.maxMp} · ATK {stats.atk} · DEF {stats.def}
      </span>
      <span className="text-left font-body text-xs leading-tight text-arcane">
        {skill.name}: <span className="text-parchment/70">{skill.description}</span>
      </span>
    </OptionButton>
  )
}
