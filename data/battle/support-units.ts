import type { SupportUnitDefinition, SupportUnitId } from '@/types'

/**
 * Unidades de Apoio: não possuem turno próprio, apenas passivas.
 * Para criar novas, basta combinar gatilho + condições + efeito.
 */
export const SUPPORT_UNITS: Record<SupportUnitId, SupportUnitDefinition> = {
  guardian: {
    id: 'guardian',
    name: 'Escudeiro Guardião',
    passives: [
      {
        id: 'guardian.lastStand',
        name: 'Muralha',
        description: 'HP abaixo de 40%: +10% DEF durante 1 turno.',
        trigger: 'turnStart',
        conditions: [{ type: 'hpBelow', ratio: 0.4 }],
        effect: { type: 'buff', stat: 'def', percent: 10, turns: 1 },
        cooldownTurns: 0,
      },
    ],
  },
  sprite: {
    id: 'sprite',
    name: 'Fada Curandeira',
    passives: [
      {
        id: 'sprite.mend',
        name: 'Orvalho',
        description: 'HP abaixo de 30%: recupera 5% do HP. Recarga 3 turnos.',
        trigger: 'turnStart',
        conditions: [{ type: 'hpBelow', ratio: 0.3 }],
        effect: { type: 'healPercent', percent: 5 },
        cooldownTurns: 3,
      },
    ],
  },
  owl: {
    id: 'owl',
    name: 'Coruja Arcana',
    passives: [
      {
        id: 'owl.focus',
        name: 'Foco',
        description: 'MP abaixo de 30%: +5 MP. Recarga 2 turnos.',
        trigger: 'turnStart',
        conditions: [{ type: 'mpBelow', ratio: 0.3 }],
        effect: { type: 'restoreMp', amount: 5 },
        cooldownTurns: 2,
      },
    ],
  },
  hound: {
    id: 'hound',
    name: 'Cão de Caça',
    passives: [
      {
        id: 'hound.loyalFury',
        name: 'Fúria Leal',
        description: 'Ao sofrer dano: +8% ATK por 2 turnos. Recarga 3 turnos.',
        trigger: 'afterDamaged',
        conditions: [{ type: 'always' }],
        effect: { type: 'buff', stat: 'atk', percent: 8, turns: 2 },
        cooldownTurns: 3,
      },
    ],
  },
}

export const SUPPORT_UNIT_IDS = Object.keys(SUPPORT_UNITS) as SupportUnitId[]
