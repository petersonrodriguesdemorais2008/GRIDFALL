import type { BossId, ConsumableId, RewardTierId, StatKey } from '@/types'

export const BATTLE_RULES = {
  roundsPerFarming: 3,
  starsPerFarming: 1,
  maxStars: 9,
  maxPerConsumable: 3,
  /** Custo em estrelas do Golpe Estelar. */
  specialStarCost: 3,
  specialPower: 1.8,
  specialPierce: 0.3,
  defendDefPercent: 50,
  defendMpRestore: 5,
  /** Limites de buffs somados por atributo. */
  buffCapPercent: 50,
  startingInventory: { smallPotion: 1, smallEther: 0, ironTonic: 0 } satisfies Record<ConsumableId, number>,
  maxLogEntries: 40,
} as const

/** Boss aparece nos Farmings múltiplos deste valor (2, 4, 6...). */
export const BOSS_SCHEDULE: { everyFarming: number; bossId: BossId } = {
  everyFarming: 2,
  bossId: 'ironGolem',
}

/**
 * Regras da troca (SWAP).
 * - HP/MP: cada personagem mantém o próprio HP/MP ao sair e ao voltar.
 * - Buffs do personagem que sai são removidos.
 * - A troca não encerra o turno, mas tem recarga e limite por partida.
 * - Troca forçada (Main Unit derrotada) não consome recarga nem limite.
 */
export const SWAP_RULES = {
  cooldownTurns: 3,
  maxSwapsPerMatch: 3,
  endsTurn: false,
  keepHpMp: true,
  clearBuffsOnExit: true,
} as const

export interface RewardTierDefinition {
  id: Exclude<RewardTierId, 'none'>
  label: string
  minShare: number
  stars: number
  hpPercent: number
  mp: number
  consumable: boolean
  buff: { stat: StatKey; percent: number; turns: number } | null
  equipment: boolean
}

/** Recompensas propositalmente pequenas para não quebrar a partida. */
export const REWARD_TIERS: RewardTierDefinition[] = [
  {
    id: 'major',
    label: 'Maior contribuição',
    minShare: 0.6,
    stars: 3,
    hpPercent: 0.1,
    mp: 8,
    consumable: true,
    buff: { stat: 'atk', percent: 10, turns: 2 },
    equipment: true,
  },
  {
    id: 'standard',
    label: 'Contribuição sólida',
    minShare: 0.3,
    stars: 2,
    hpPercent: 0.08,
    mp: 6,
    consumable: true,
    buff: { stat: 'def', percent: 10, turns: 2 },
    equipment: false,
  },
  {
    id: 'minor',
    label: 'Participação',
    minShare: 0.05,
    stars: 1,
    hpPercent: 0.05,
    mp: 4,
    consumable: false,
    buff: null,
    equipment: false,
  },
]

export const LAST_HIT_BONUS_STARS = 1
/** Equipamento repetido vira estrelas em vez de acumular atributos. */
export const DUPLICATE_EQUIPMENT_STARS = 1
