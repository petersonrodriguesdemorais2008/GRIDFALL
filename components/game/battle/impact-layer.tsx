import type { ImpactEvent, TurnOwner } from '@/types'
import { cn } from '@/lib/utils'

function lastImpact(impacts: ImpactEvent[], target: TurnOwner, kind?: ImpactEvent['kind']) {
  for (let i = impacts.length - 1; i >= 0; i--) {
    const event = impacts[i]
    if (event.target === target && (!kind || event.kind === kind)) return event
  }
  return null
}

/** Id do último dano sofrido — usado como `key` para reiniciar a animação de tremor. */
export function lastHitId(impacts: ImpactEvent[], target: TurnOwner) {
  return lastImpact(impacts, target, 'damage')?.id ?? 0
}

interface ImpactLayerProps {
  impacts: ImpactEvent[]
  target: TurnOwner
}

/** Número flutuante do último dano/cura recebido pelo alvo. */
export function ImpactLayer({ impacts, target }: ImpactLayerProps) {
  const last = lastImpact(impacts, target)
  if (!last) return null

  return (
    <span
      key={last.id}
      aria-hidden="true"
      className={cn(
        'animate-impact text-shadow-pixel pointer-events-none absolute top-1 left-1/2 z-10 font-display text-sm',
        last.kind === 'damage' ? 'text-destructive' : 'text-chart-3',
      )}
    >
      {last.kind === 'damage' ? `-${last.amount}` : `+${last.amount}`}
    </span>
  )
}
