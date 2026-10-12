import type { LogEntry, LogTone } from '@/types'
import { STRINGS } from '@/data/strings'
import { cn } from '@/lib/utils'

const toneClass: Record<LogTone, string> = {
  neutral: 'text-parchment/80',
  player: 'text-arcane',
  enemy: 'text-destructive',
  boss: 'text-gold',
  reward: 'text-chart-3',
  system: 'text-parchment/60',
  combo: 'font-semibold text-chart-5',
}

const VISIBLE_ENTRIES = 6

export function BattleLog({ entries }: { entries: LogEntry[] }) {
  const visible = entries.slice(-VISIBLE_ENTRIES).reverse()

  return (
    <section
      aria-label={STRINGS.battle.log}
      className="flex min-h-16 flex-1 flex-col overflow-hidden border-2 border-panel-edge/70 bg-night-deep/70 px-2.5 py-1.5"
    >
      <ol aria-live="polite" className="flex flex-col gap-0.5 overflow-hidden">
        {visible.map((entry, i) => (
          <li
            key={entry.id}
            className={cn('font-body text-sm leading-snug', toneClass[entry.tone], i > 0 && 'opacity-70')}
          >
            {entry.text}
          </li>
        ))}
      </ol>
    </section>
  )
}
