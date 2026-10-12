import type { CSSProperties } from 'react'
import { Droplets, Flame, Leaf, Moon, Snowflake, Wind, Zap, Sword, type LucideIcon } from 'lucide-react'
import type { ElementTag } from '@/types'
import { ELEMENTS } from '@/data/battle/elements'
import { cn } from '@/lib/utils'

export const ELEMENT_ICONS: Record<ElementTag, LucideIcon> = {
  fire: Flame,
  water: Droplets,
  ice: Snowflake,
  wind: Wind,
  thunder: Zap,
  shadow: Moon,
  nature: Leaf,
  impact: Sword,
}

interface ElementChipProps {
  tag: ElementTag
  /** Texto extra após o nome, como turnos restantes. */
  suffix?: string
  size?: 'sm' | 'md'
  className?: string
}

export function ElementChip({ tag, suffix, size = 'sm', className }: ElementChipProps) {
  const element = ELEMENTS[tag]
  const Icon = ELEMENT_ICONS[tag]
  const style = { '--element': element.color } as CSSProperties

  return (
    <span
      style={style}
      title={element.label}
      className={cn(
        'inline-flex items-center gap-1 border border-[var(--element)] bg-[color-mix(in_oklch,var(--element)_18%,var(--night-deep))] leading-none text-[var(--element)]',
        size === 'sm' ? 'px-1 py-0.5 font-display text-[7px]' : 'px-2 py-1 font-display text-[8px]',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} aria-hidden="true" />
      {element.code}
      {suffix && <span className="text-parchment/70">{suffix}</span>}
    </span>
  )
}
