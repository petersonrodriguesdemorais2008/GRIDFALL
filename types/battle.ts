export type SideId = 'player' | 'enemy'

export type TurnOwner = SideId | 'boss'

/** Alvo escolhido por um lado: o oponente direto ou o boss ativo. */
export type TargetId = 'opponent' | 'boss'

export type StatKey = 'atk' | 'def'

export type CharacterId = 'knight' | 'mage' | 'archer' | 'cleric'
export type SupportUnitId = 'guardian' | 'sprite' | 'owl' | 'hound'
export type ConsumableId = 'smallPotion' | 'smallEther' | 'ironTonic'
export type EquipmentId = 'golemPlate' | 'golemCore'
export type BossId = 'ironGolem'
export type BossAttackId = 'ironFist' | 'quake' | 'fortify' | 'overload'

export interface BaseStats {
  maxHp: number
  maxMp: number
  atk: number
  def: number
}

export interface SkillDefinition {
  name: string
  description: string
  mpCost: number
  kind: 'damage' | 'heal'
  /** Multiplicador de ATK (dano) ou fração do HP máximo (cura). */
  power: number
  /** Fração da DEF do alvo ignorada (0–1). */
  pierce?: number
}

export interface CharacterDefinition {
  id: CharacterId
  name: string
  title: string
  portrait: string
  stats: BaseStats
  skill: SkillDefinition
}

/* ---------- Passivas genéricas (Support Unit) ---------- */

export type PassiveTrigger = 'turnStart' | 'afterDamaged'

export type PassiveCondition =
  | { type: 'always' }
  | { type: 'hpBelow'; ratio: number }
  | { type: 'mpBelow'; ratio: number }
  | { type: 'bossPresent' }

export type PassiveEffect =
  | { type: 'buff'; stat: StatKey; percent: number; turns: number }
  | { type: 'healPercent'; percent: number }
  | { type: 'restoreMp'; amount: number }

export interface PassiveDefinition {
  id: string
  name: string
  description: string
  trigger: PassiveTrigger
  conditions: PassiveCondition[]
  effect: PassiveEffect
  /** Turnos próprios até poder ativar novamente. 0 = sem recarga. */
  cooldownTurns: number
}

export interface SupportUnitDefinition {
  id: SupportUnitId
  name: string
  passives: PassiveDefinition[]
}

/* ---------- Itens ---------- */

export type ConsumableEffect =
  | { type: 'heal'; amount: number }
  | { type: 'restoreMp'; amount: number }
  | { type: 'buff'; stat: StatKey; percent: number; turns: number }

export interface ConsumableDefinition {
  id: ConsumableId
  name: string
  description: string
  effect: ConsumableEffect
}

export interface EquipmentDefinition {
  id: EquipmentId
  name: string
  description: string
  bonus: Partial<Record<StatKey, number>>
}

/* ---------- Estado de combate ---------- */

export interface StatusEffect {
  id: string
  label: string
  stat: StatKey
  percent: number
  /** Turnos próprios restantes. Removido no início do turno em que chegar a 0. */
  turnsLeft: number
}

export interface CombatantState {
  characterId: CharacterId
  hp: number
  mp: number
  buffs: StatusEffect[]
}

export interface SwapState {
  cooldown: number
  used: number
}

export interface SideState {
  id: SideId
  name: string
  /** Índice 0 começa como Main Unit; os demais são Support Characters. */
  party: CombatantState[]
  activeIndex: number
  supportUnitId: SupportUnitId
  passiveCooldowns: Record<string, number>
  stars: number
  inventory: Record<ConsumableId, number>
  equipment: EquipmentId | null
  swap: SwapState
}

/* ---------- Boss ---------- */

export interface BossAttackDefinition {
  id: BossAttackId
  name: string
  target: 'single' | 'area' | 'self'
  power: number
  telegraph: string
  selfBuff?: { stat: StatKey; percent: number; turns: number }
}

export interface BossDefinition {
  id: BossId
  name: string
  portrait: string
  stats: { maxHp: number; atk: number; def: number }
  /** Fração do HP em que entra em ENRAGED. */
  enrageThreshold: number
  enrageAtkPercent: number
  pattern: BossAttackId[]
  enragedPattern: BossAttackId[]
  attacks: Record<BossAttackId, BossAttackDefinition>
}

export interface BossState {
  bossId: BossId
  hp: number
  maxHp: number
  enraged: boolean
  patternIndex: number
  telegraph: BossAttackId
  buffs: StatusEffect[]
  /** Dano total causado por cada lado — base da recompensa. */
  contribution: Record<SideId, number>
  lastHitBy: SideId | null
}

/* ---------- Recompensas ---------- */

export type RewardTierId = 'major' | 'standard' | 'minor' | 'none'

export type RewardGrant =
  | { type: 'stars'; amount: number; reason?: string }
  | { type: 'hp'; amount: number }
  | { type: 'mp'; amount: number }
  | { type: 'consumable'; item: ConsumableId }
  | { type: 'buff'; stat: StatKey; percent: number; turns: number }
  | { type: 'equipment'; item: EquipmentId }

export interface SideRewardReport {
  damage: number
  share: number
  tier: RewardTierId
  lastHit: boolean
  grants: RewardGrant[]
}

export interface BossRewardReport {
  bossName: string
  totalDamage: number
  sides: Record<SideId, SideRewardReport>
}

/* ---------- Batalha ---------- */

export type LogTone = 'neutral' | 'player' | 'enemy' | 'boss' | 'reward' | 'system'

export interface LogEntry {
  id: number
  text: string
  tone: LogTone
}

export interface ImpactEvent {
  id: number
  target: TurnOwner
  amount: number
  kind: 'damage' | 'heal'
}

export interface BattleLoadout {
  mainId: CharacterId
  supportCharacterId: CharacterId
  supportUnitId: SupportUnitId
}

export interface BattleState {
  seed: number
  farming: number
  round: number
  turn: TurnOwner
  player: SideState
  enemy: SideState
  boss: BossState | null
  bossesDefeated: number
  pendingReward: BossRewardReport | null
  winner: SideId | 'draw' | null
  log: LogEntry[]
  impacts: ImpactEvent[]
  nextEventId: number
}

export type BattleAction =
  | { type: 'ATTACK'; side: SideId; target: TargetId }
  | { type: 'SKILL'; side: SideId; target: TargetId }
  | { type: 'SPECIAL'; side: SideId; target: TargetId }
  | { type: 'DEFEND'; side: SideId }
  | { type: 'USE_ITEM'; side: SideId; item: ConsumableId }
  | { type: 'SWAP'; side: SideId; toIndex: number }
  | { type: 'BOSS_ACT' }
  | { type: 'DISMISS_REWARD' }
  | { type: 'RESET'; state: BattleState }
