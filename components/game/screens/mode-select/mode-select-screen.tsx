'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Swords } from 'lucide-react'
import { GAME_MODES, isPlayableMode, type GameModeDefinition } from '@/data/game-modes'
import { STRINGS } from '@/data/strings'
import { createId } from '@/lib/id'
import { useGameDispatch } from '@/hooks/use-game-store'
import { MenuBackground } from '../main-menu/menu-background'
import { ModeCard } from './mode-card'
import { DevNotice } from './dev-notice'

const NOTICE_DURATION_MS = 2200

const [featuredMode, ...otherModes] = GAME_MODES

export function ModeSelectScreen() {
  const dispatch = useGameDispatch()
  const [notice, setNotice] = useState<string | null>(null)
  const noticeTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    }
  }, [])

  const showNotice = (message: string) => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_DURATION_MS)
  }

  const handleSelect = (mode: GameModeDefinition) => {
    if (mode.status !== 'available' || !isPlayableMode(mode.id)) {
      showNotice(mode.devNotice ?? STRINGS.modeSelect.inDevelopment)
      return
    }
    if (mode.id === 'vsBot') {
      dispatch({ type: 'OPEN_TEAM_SELECT' })
      return
    }
    dispatch({ type: 'START_GAME', playerId: createId('player'), mode: mode.id })
  }

  const goBack = () => dispatch({ type: 'OPEN_MENU' })

  return (
    <section className="relative flex h-full flex-col overflow-hidden" aria-labelledby="mode-select-heading">
      <MenuBackground />

      <header className="animate-rise-in relative z-10 flex items-center gap-2 px-4 pt-3">
        <button
          type="button"
          onClick={goBack}
          aria-label={STRINGS.modeSelect.back}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg border-2 border-panel-edge bg-[linear-gradient(180deg,oklch(0.35_0.06_270),oklch(0.24_0.05_270))] text-parchment shadow-[inset_0_2px_0_oklch(1_0_0/0.08),0_3px_0_oklch(0_0_0/0.5)] transition-transform duration-100 active:translate-y-0.5 active:shadow-[inset_0_2px_0_oklch(1_0_0/0.08),0_1px_0_oklch(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>
        <div className="flex flex-1 flex-col items-center rounded-lg border-2 border-gold-dim bg-night-deep/85 px-4 py-2 shadow-[inset_0_0_0_2px_oklch(1_0_0/0.05),0_4px_0_oklch(0_0_0/0.6)]">
          <h2
            id="mode-select-heading"
            className="text-shadow-pixel flex items-center gap-2 font-display text-sm text-gold uppercase"
          >
            <Swords className="size-4" aria-hidden="true" />
            {STRINGS.modeSelect.heading}
          </h2>
          <p className="font-body text-sm text-parchment/65">{STRINGS.modeSelect.subheading}</p>
        </div>
        <span aria-hidden="true" className="size-11 shrink-0" />
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-4 [scrollbar-width:thin]">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
          <ModeCard mode={featuredMode} index={0} featured onSelect={handleSelect} />
          <div className="grid grid-cols-2 gap-3">
            {otherModes.map((mode, i) => (
              <ModeCard key={mode.id} mode={mode} index={i + 1} onSelect={handleSelect} />
            ))}
          </div>
        </div>
      </div>

      <DevNotice message={notice} />

      <footer className="animate-rise-in relative z-10 border-t-[3px] border-panel-edge bg-[linear-gradient(180deg,oklch(0.26_0.05_270),oklch(0.16_0.045_270))] px-4 py-3 shadow-[0_-8px_24px_-8px_oklch(0_0_0/0.8)] [--rise-delay:0.3s]">
        <button
          type="button"
          onClick={goBack}
          className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 rounded-lg border-[3px] border-panel-edge bg-[linear-gradient(180deg,oklch(0.38_0.06_270),oklch(0.26_0.05_270))] px-5 py-3 font-display text-[11px] tracking-wider text-parchment uppercase shadow-[inset_0_2px_0_oklch(1_0_0/0.1),0_5px_0_oklch(0.1_0.03_272),0_10px_18px_-8px_oklch(0_0_0/0.8)] transition-[transform,box-shadow,filter] duration-100 select-none hover:brightness-110 active:translate-y-1 active:shadow-[inset_0_2px_0_oklch(1_0_0/0.1),0_1px_0_oklch(0.1_0.03_272),0_4px_10px_-8px_oklch(0_0_0/0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
          {STRINGS.modeSelect.back}
        </button>
      </footer>
    </section>
  )
}
