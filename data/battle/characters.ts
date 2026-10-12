import type { CharacterDefinition, CharacterId } from '@/types'

export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  knight: {
    id: 'knight',
    name: 'Aldric',
    title: 'Cavaleiro',
    portrait: '/battle/knight.png',
    stats: { maxHp: 130, maxMp: 30, atk: 17, def: 12 },
    skill: {
      name: 'Corte Firme',
      description: 'Golpe pesado com 1.6x ATK.',
      mpCost: 8,
      kind: 'damage',
      power: 1.6,
      element: 'impact',
    },
  },
  mage: {
    id: 'mage',
    name: 'Lyra',
    title: 'Maga',
    portrait: '/battle/mage.png',
    stats: { maxHp: 100, maxMp: 50, atk: 20, def: 7 },
    skill: {
      name: 'Bola de Fogo',
      description: 'Explosão arcana com 1.9x ATK.',
      mpCost: 12,
      kind: 'damage',
      power: 1.9,
      element: 'fire',
    },
  },
  archer: {
    id: 'archer',
    name: 'Sora',
    title: 'Arqueira',
    portrait: '/battle/archer.png',
    stats: { maxHp: 110, maxMp: 36, atk: 19, def: 9 },
    skill: {
      name: 'Flecha Perfurante',
      description: '1.4x ATK ignorando 50% da DEF.',
      mpCost: 9,
      kind: 'damage',
      power: 1.4,
      pierce: 0.5,
      element: 'wind',
    },
  },
  cleric: {
    id: 'cleric',
    name: 'Bram',
    title: 'Clérigo',
    portrait: '/battle/cleric.png',
    stats: { maxHp: 115, maxMp: 44, atk: 15, def: 10 },
    skill: {
      name: 'Luz Restauradora',
      description: 'Recupera 22% do HP máximo.',
      mpCost: 12,
      kind: 'heal',
      power: 0.22,
    },
  },
}

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[]
