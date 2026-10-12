import type {
  ConsumableDefinition,
  ConsumableId,
  EquipmentDefinition,
  EquipmentId,
} from '@/types'

export const CONSUMABLES: Record<ConsumableId, ConsumableDefinition> = {
  smallPotion: {
    id: 'smallPotion',
    name: 'Poção Pequena',
    description: 'Recupera 20 HP.',
    effect: { type: 'heal', amount: 20 },
  },
  smallEther: {
    id: 'smallEther',
    name: 'Éter Pequeno',
    description: 'Recupera 12 MP.',
    effect: { type: 'restoreMp', amount: 12 },
  },
  ironTonic: {
    id: 'ironTonic',
    name: 'Tônico de Ferro',
    description: '+15% DEF por 2 turnos.',
    effect: { type: 'buff', stat: 'def', percent: 15, turns: 2 },
  },
}

export const CONSUMABLE_IDS = Object.keys(CONSUMABLES) as ConsumableId[]

export const EQUIPMENT: Record<EquipmentId, EquipmentDefinition> = {
  golemPlate: {
    id: 'golemPlate',
    name: 'Placa do Golem',
    description: '+2 DEF para a unidade ativa.',
    bonus: { def: 2 },
  },
  golemCore: {
    id: 'golemCore',
    name: 'Núcleo do Golem',
    description: '+2 ATK para a unidade ativa.',
    bonus: { atk: 2 },
  },
}

export const EQUIPMENT_IDS = Object.keys(EQUIPMENT) as EquipmentId[]
