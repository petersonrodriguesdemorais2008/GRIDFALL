'use client'

import { useEffect, useState } from 'react'
import { GAME_CONFIG } from '@/data/config'
import { ARENA_SCENE, SCENES, TRAINING_SCENE } from '@/data/scenes'
import { STRINGS } from '@/data/strings'
import { useGameDispatch, useGameStore } from '@/hooks/use-game-store'
import { RpgFrame } from '../ui/rpg-frame'

const STEPS = 20

export function LoadingScreen() {
  const dispatch = useGameDispatch()
  const mode = useGameStore((s) => s.session?.mode ?? 'vsBot')
  const targetScene = mode === 'training' ? TRAINING_SCENE : ARENA_SCENE
  const [progress, setProgress] = useState(0)
  const [tip] = useState(
    () => STRINGS.loading.tips[Math.floor(Math.random() * STRINGS.loading.tips.length)],
  )

  useEffect(() => {
    const interval = GAME_CONFIG.loadingDurationMs / STEPS
    let step = 0
    const id = window.setInterval(() => {
      step++
      setProgress(Math.min(1, step / STEPS))
      if (step >= STEPS) {
        window.clearInterval(id)
        dispatch({ type: 'LOADING_COMPLETE', scene: targetScene })
      }
    }, interval)
    return () => window.clearInterval(id)
  }, [dispatch, targetScene])

  const percent = Math.round(progress * 100)

  return (
    <section
      className="flex h-full flex-col items-center justify-center gap-8 px-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
          {STRINGS.loading.heading}
        </p>
        <h2 className="text-shadow-pixel mt-3 font-display text-base text-gold">
          {SCENES[targetScene].name}
        </h2>
      </div>

      <RpgFrame className="w-full max-w-sm p-4">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-4 w-full border-2 border-panel-edge bg-night-deep p-0.5"
        >
          <div
            className="h-full bg-[repeating-linear-gradient(90deg,var(--gold)_0_6px,var(--gold-dim)_6px_8px)] transition-[width] duration-100"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between font-display text-[9px] text-muted-foreground">
          <span>{percent}%</span>
          <span className="animate-blink">...</span>
        </div>
      </RpgFrame>

      <p className="max-w-xs text-center text-sm text-parchment/70">{tip}</p>
    </section>
  )
}
