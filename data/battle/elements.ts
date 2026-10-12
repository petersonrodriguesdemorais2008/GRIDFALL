import type { ElementComboDefinition, ElementDefinition, ElementId, ElementTag } from '@/types'

export const ELEMENT_RULES = {
  /** Turnos do alvo até uma marca expirar. */
  markDuration: 3,
  /** Máximo de marcas distintas por alvo; a mais antiga é descartada. */
  maxMarks: 2,
} as const

export const ELEMENTS: Record<ElementTag, ElementDefinition> = {
  fire: { id: 'fire', code: 'FIRE', label: 'Fogo', color: 'oklch(0.68 0.2 35)' },
  water: { id: 'water', code: 'WATER', label: 'Água', color: 'oklch(0.66 0.15 240)' },
  ice: { id: 'ice', code: 'ICE', label: 'Gelo', color: 'oklch(0.85 0.08 215)' },
  wind: { id: 'wind', code: 'WIND', label: 'Vento', color: 'oklch(0.78 0.14 150)' },
  thunder: { id: 'thunder', code: 'THUNDER', label: 'Trovão', color: 'oklch(0.86 0.17 95)' },
  shadow: { id: 'shadow', code: 'SHADOW', label: 'Sombra', color: 'oklch(0.6 0.18 305)' },
  nature: { id: 'nature', code: 'NATURE', label: 'Natureza', color: 'oklch(0.7 0.16 130)' },
  impact: { id: 'impact', code: 'IMPACT', label: 'Impacto', color: 'oklch(0.78 0.03 80)' },
}

export const ELEMENT_IDS: ElementId[] = ['fire', 'water', 'ice', 'wind', 'thunder', 'shadow', 'nature']

/**
 * Combinações elementais. Para criar uma nova, basta adicionar uma entrada:
 * o motor resolve qualquer par de `inputs` independentemente da ordem.
 */
export const ELEMENT_COMBOS: ElementComboDefinition[] = [
  {
    id: 'overload',
    code: 'OVERLOAD',
    label: 'Sobrecarga',
    description: 'Água conduz o trovão: dano extra massivo.',
    inputs: ['water', 'thunder'],
    effects: [{ type: 'bonusDamage', percent: 50 }],
  },
  {
    id: 'shatter',
    code: 'SHATTER',
    label: 'Estilhaçar',
    description: 'Impacto quebra o gelo: dano extra e DEF reduzida.',
    inputs: ['ice', 'impact'],
    effects: [
      { type: 'bonusDamage', percent: 35 },
      { type: 'debuff', stat: 'def', percent: -20, turns: 2 },
    ],
  },
  {
    id: 'firestorm',
    code: 'FIRESTORM',
    label: 'Tempestade de Fogo',
    description: 'Vento alimenta as chamas: dano extra.',
    inputs: ['fire', 'wind'],
    effects: [{ type: 'bonusDamage', percent: 45 }],
  },
  {
    id: 'explosion',
    code: 'EXPLOSION',
    label: 'Explosão',
    description: 'Impacto detona as chamas: dano extra.',
    inputs: ['fire', 'impact'],
    effects: [{ type: 'bonusDamage', percent: 30 }],
  },
  {
    id: 'tempest',
    code: 'TEMPEST',
    label: 'Tempestade',
    description: 'Vento e trovão: dano extra e ATK reduzido.',
    inputs: ['wind', 'thunder'],
    effects: [
      { type: 'bonusDamage', percent: 30 },
      { type: 'debuff', stat: 'atk', percent: -15, turns: 2 },
    ],
  },
  {
    id: 'melt',
    code: 'MELT',
    label: 'Derretimento',
    description: 'Fogo derrete o gelo: DEF muito reduzida.',
    inputs: ['fire', 'ice'],
    effects: [
      { type: 'bonusDamage', percent: 20 },
      { type: 'debuff', stat: 'def', percent: -25, turns: 2 },
    ],
  },
  {
    id: 'freeze',
    code: 'FREEZE',
    label: 'Congelamento',
    description: 'Água congela: ATK muito reduzido por 1 turno.',
    inputs: ['water', 'ice'],
    effects: [{ type: 'debuff', stat: 'atk', percent: -30, turns: 1 }],
  },
  {
    id: 'blight',
    code: 'BLIGHT',
    label: 'Praga',
    description: 'Sombra corrompe a natureza: ATK reduzido por 3 turnos.',
    inputs: ['shadow', 'nature'],
    effects: [
      { type: 'bonusDamage', percent: 20 },
      { type: 'debuff', stat: 'atk', percent: -20, turns: 3 },
    ],
  },
]

/** Procura a combinação entre duas marcas, em qualquer ordem. */
export function findCombo(a: ElementTag, b: ElementTag): ElementComboDefinition | null {
  return (
    ELEMENT_COMBOS.find(({ inputs: [x, y] }) => (x === a && y === b) || (x === b && y === a)) ?? null
  )
}

/** Combinações que um elemento pode fechar — útil para telas de coleção/ajuda. */
export function combosFor(tag: ElementTag): ElementComboDefinition[] {
  return ELEMENT_COMBOS.filter(({ inputs }) => inputs.includes(tag))
}
