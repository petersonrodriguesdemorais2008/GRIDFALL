import { cn } from '@/lib/utils'

interface StatBarProps {
  label: string
  value: number
  max: number
  tone: 'hp' | 'mp' | 'boss'
  size?: 'sm' | 'md'
}

const fill: Record<StatBarProps['tone'], string> = {
  hp: 'bg-chart-3',
  mp: 'bg-arcane',
  boss: 'bg-destructive',
}

export function StatBar({ label, value, max, tone, size = 'sm' }: StatBarProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  const low = tone === 'hp' && ratio < 0.3

  return (
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 font-display text-[8px] text-parchment/70">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          'relative flex-1 overflow-hidden border-2 border-night-deep bg-night-deep/80',
          size === 'md' ? 'h-4' : 'h-2.5',
        )}
      >
        <div
          className={cn('h-full transition-[width] duration-500 ease-out', low ? 'bg-destructive' : fill[tone])}
          style={{ width: `${ratio * 100}%` }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/3 bg-white/15" />
      </div>
      <span className="w-14 shrink-0 text-right font-display text-[8px] tabular-nums text-parchment">
        {value}/{max}
      </span>
    </div>
  )
}
