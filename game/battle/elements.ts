import type { BattleState, ElementMark, ElementTag, SideId, StatusEffect, TurnOwner } from '@/types'
import { CHARACTERS } from '@/data/battle/characters'
import { BOSSES } from '@/data/battle/bosses'
import { ELEMENT_RULES, ELEMENTS, findCombo } from '@/data/battle/elements'
import { activeOf, getSide, log } from './context'
import { damageBoss, damageSide } from './combat'
import { addBuff, STAT_LABEL } from './stats'

/**
 * Sistema elemental genérico:
 * 1. Um golpe com elemento marca o alvo.
 * 2. Se o alvo já tiver uma marca que combina com o novo elemento, a marca é
 *    consumida e os efeitos da combinação são aplicados.
 * Novas combinações entram apenas em `data/battle/elements.ts`.
 */

export interface ElementTarget {
  owner: TurnOwner
  name: string
  marks: ElementMark[]
  buffs: StatusEffect[]
  alive: () => boolean
}

/**
 * Captura o alvo ANTES do dano principal: se a unidade cair e houver troca
 * forçada, a marca não pode vazar para quem entrou em campo.
 */
export function elementTargetOf(state: BattleState, owner: TurnOwner): ElementTarget | null {
  if (owner === 'boss') {
    const boss = state.boss
    if (!boss) return null
    return {
      owner,
      name: BOSSES[boss.bossId].name,
      marks: boss.marks,
      buffs: boss.buffs,
      alive: () => state.boss === boss && boss.hp > 0,
    }
  }
  const side = getSide(state, owner)
  const member = activeOf(side)
  return {
    owner,
    name: CHARACTERS[member.characterId].name,
    marks: member.marks,
    buffs: member.buffs,
    alive: () => member.hp > 0 && activeOf(side) === member,
  }
}

function addMark(marks: ElementMark[], tag: ElementTag) {
  const existing = marks.find((m) => m.tag === tag)
  if (existing) {
    existing.turnsLeft = ELEMENT_RULES.markDuration
    return
  }
  marks.push({ tag, turnsLeft: ELEMENT_RULES.markDuration })
  while (marks.length > ELEMENT_RULES.maxMarks) marks.shift()
}

/** Dano extra da combinação. `attacker` null = golpe do boss (sem contribuição). */
function dealBonus(state: BattleState, attacker: SideId | null, owner: TurnOwner, amount: number) {
  if (amount <= 0) return 0
  if (owner === 'boss') return attacker ? damageBoss(state, attacker, amount) : 0
  return damageSide(state, owner, amount)
}

/** Deve ser chamado logo após o dano principal de um golpe. Sem elemento, não faz nada. */
export function applyElementHit(
  state: BattleState,
  attacker: SideId | null,
  target: ElementTarget | null,
  tag: ElementTag | undefined,
  dealt: number,
) {
  if (!tag || !target || !target.alive()) return

  const markIndex = target.marks.findIndex((m) => findCombo(m.tag, tag) !== null)
  if (markIndex < 0) {
    addMark(target.marks, tag)
    return
  }

  const [consumed] = target.marks.splice(markIndex, 1)
  const combo = findCombo(consumed.tag, tag)
  if (!combo) return

  const parts: string[] = []
  for (const effect of combo.effects) {
    if (effect.type === 'bonusDamage') {
      const bonus = Math.max(1, Math.round((dealt * effect.percent) / 100))
      parts.push(`+${dealBonus(state, attacker, target.owner, bonus)} de dano`)
    } else {
      addBuff(target.buffs, {
        id: `combo.${combo.id}.${effect.stat}`,
        label: `${combo.code} ${effect.percent}% ${STAT_LABEL[effect.stat]}`,
        stat: effect.stat,
        percent: effect.percent,
        turnsLeft: effect.turns,
      })
      parts.push(`${effect.percent}% ${STAT_LABEL[effect.stat]} por ${effect.turns} turno(s)`)
    }
  }

  log(
    state,
    `COMBO ${combo.code}! ${ELEMENTS[consumed.tag].code} + ${ELEMENTS[tag].code} em ${target.name}: ${parts.join(', ')}.`,
    'combo',
  )
}

export function tickMarks(marks: ElementMark[]): ElementMark[] {
  return marks.map((m) => ({ ...m, turnsLeft: m.turnsLeft - 1 })).filter((m) => m.turnsLeft > 0)
}
