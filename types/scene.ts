export type SceneId = 'title' | 'world' | 'training' | 'arena'

export interface SceneDefinition {
  id: SceneId
  name: string
  description: string
}
