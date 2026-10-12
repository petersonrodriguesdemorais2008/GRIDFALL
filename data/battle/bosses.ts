import type { BossDefinition, BossId } from '@/types'

export const BOSSES: Record<BossId, BossDefinition> = {
  ironGolem: {
    id: 'ironGolem',
    name: 'IRON GOLEM',
    portrait: '/battle/iron-golem.png',
    stats: { maxHp: 150, atk: 22, def: 14 },
    enrageThreshold: 0.25,
    enrageAtkPercent: 30,
    pattern: ['ironFist', 'quake', 'ironFist', 'fortify'],
    enragedPattern: ['overload', 'ironFist', 'overload', 'quake'],
    attacks: {
      ironFist: {
        id: 'ironFist',
        name: 'Punho de Ferro',
        target: 'single',
        power: 1,
        telegraph: 'Ergue o punho contra quem mais o feriu.',
        element: 'impact',
      },
      quake: {
        id: 'quake',
        name: 'Terremoto',
        target: 'area',
        power: 0.7,
        telegraph: 'O chão treme. Ataque em ÁREA!',
        element: 'nature',
      },
      fortify: {
        id: 'fortify',
        name: 'Fortificar',
        target: 'self',
        power: 0,
        telegraph: 'Reforça as placas de ferro.',
        selfBuff: { stat: 'def', percent: 40, turns: 2 },
      },
      overload: {
        id: 'overload',
        name: 'Sobrecarga',
        target: 'area',
        power: 0.9,
        telegraph: 'O núcleo superaquece. Ataque em ÁREA!',
        element: 'thunder',
      },
    },
  },
}
