import type { SceneDefinition, SceneId } from '@/types'

export const SCENES: Record<SceneId, SceneDefinition> = {
  title: {
    id: 'title',
    name: 'Tela Inicial',
    description: 'Menu principal do jogo.',
  },
  world: {
    id: 'world',
    name: 'Planícies de Eldoria',
    description: 'Região inicial do mundo. Em breve receberá vilas, masmorras e criaturas.',
  },
  training: {
    id: 'training',
    name: 'Arena de Treino',
    description: 'Campo de testes seguro. Pratique movimentação e habilidades sem risco.',
  },
  arena: {
    id: 'arena',
    name: 'Arena de Eldoria',
    description: 'Duelo por turnos contra o bot, com bosses a cada dois Farmings.',
  },
}

export const INITIAL_SCENE: SceneId = 'world'

export const TRAINING_SCENE: SceneId = 'training'

export const ARENA_SCENE: SceneId = 'arena'
