'use client'

import { useState, type ReactNode } from 'react'
import { ArrowLeftRight, Backpack, ChevronLeft, Shield, Sparkles, Star, Sword } from 'lucide-react'
import type { BattleAction, BattleState, ConsumableId, TargetId } from '@/types'
import { CHARACTERS } from '@/data/battle/characters'
import { CONSUMABLE_IDS, CONSUMABLES } from '@/data/battle/items'
import { BATTLE_RULES } from '@/data/battle/rules'
import { STRINGS } from '@/data/strings'
import { activeOf } from '@/game/battle/context'
import { maxHpOf } from '@/game/battle/stats'
import { benchCandidates, swapBlockReason, swapsLeft } from '@/game/battle/swap'
import { cn } from '@/lib/utils'

const T = STRINGS.battle

type Panel = 'main' | 'items' | 'swap'

interface ActionBarProps {
  state: BattleState
  disabled: boolean
  onAction: (action: BattleAction) => void
}

export function ActionBar({ state, disabled, onAction }: ActionBarProps) {
  const [panel, setPanel] = useState<Panel>('main')
  const [targetChoice, setTargetChoice] = useState<TargetId>('opponent')
  const side = state.player
  const member = activeOf(side)
  const { skill } = CHARACTERS[member.characterId]
  const target: TargetId = state.boss ? targetChoice : 'opponent'
  const isMyTurn = state.turn === 'player' && !disabled

  const swapBlock = swapBlockReason(side)
  const candidates = benchCandidates(side)
  const swapBadge =
    swapBlock === 'limit' ? T.swapLimit : swapBlock === 'cooldown' ? `${T.swapCooldown} ${side.swap.cooldown}` : `${swapsLeft(side)}x`

  const send = (action: BattleAction) => {
    onAction(action)
    setPanel('main')
  }

  const handleSwap = () => {
    if (candidates.length === 1) send({ type: 'SWAP', side: 'player', toIndex: candidates[0] })
    else setPanel('swap')
  }

  const status = state.turn === 'player' ? T.yourTurn : state.turn === 'enemy' ? T.botTurn : T.bossTurn

  return (
    <div className="flex flex-col gap-2 border-t-[3px] border-panel-edge bg-[linear-gradient(180deg,oklch(0.26_0.05_270),oklch(0.16_0.045_270))] px-3 pt-1.5 pb-2.5">
      <div className="flex items-center justify-between gap-2">
        <p
          aria-live="polite"
          className={cn('font-display text-[9px]', state.turn === 'player' ? 'text-gold' : 'text-parchment/60')}
        >
          {status}
        </p>
        {state.boss && (
          <div role="radiogroup" aria-label={T.target} className="flex items-center gap-1">
            <span className="font-display text-[7px] text-parchment/60">{T.target}:</span>
            {(['opponent', 'boss'] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={target === id}
                onClick={() => setTargetChoice(id)}
                className={cn(
                  'border-2 px-2 py-1 font-display text-[8px] transition-colors',
                  target === id
                    ? id === 'boss'
                      ? 'border-gold bg-gold text-primary-foreground'
                      : 'border-destructive bg-destructive text-parchment'
                    : 'border-panel-edge bg-night-deep/60 text-parchment/70',
                )}
              >
                {id === 'boss' ? T.targetBoss : T.targetOpponent}
              </button>
            ))}
          </div>
        )}
      </div>

      {panel === 'main' && (
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            icon={<Sword className="size-4" aria-hidden="true" />}
            label={T.attack}
            hint={ELEMENTS[BATTLE_RULES.attackElement].code}
            disabled={!isMyTurn}
            onClick={() => send({ type: 'ATTACK', side: 'player', target })}
          />
          <ActionButton
            icon={<Sparkles className="size-4" aria-hidden="true" />}
            label={skill.name}
            hint={skill.element ? `${skill.mpCost} MP · ${ELEMENTS[skill.element].code}` : `${skill.mpCost} MP`}
            disabled={!isMyTurn || member.mp < skill.mpCost}
            onClick={() => send({ type: 'SKILL', side: 'player', target })}
            title={skill.description}
          />
          <ActionButton
            icon={<Star className="size-4" aria-hidden="true" />}
            label={T.special}
            hint={`${BATTLE_RULES.specialStarCost} estrelas · ${ELEMENTS[BATTLE_RULES.specialElement].code}`}
            tone="gold"
            disabled={!isMyTurn || side.stars < BATTLE_RULES.specialStarCost}
            onClick={() => send({ type: 'SPECIAL', side: 'player', target })}
            title={`${BATTLE_RULES.specialPower}x ATK ignorando ${BATTLE_RULES.specialPierce * 100}% da DEF`}
          />
          <ActionButton
            icon={<Shield className="size-4" aria-hidden="true" />}
            label={T.defend}
            hint={`+${BATTLE_RULES.defendDefPercent}% DEF`}
            disabled={!isMyTurn}
            onClick={() => send({ type: 'DEFEND', side: 'player' })}
          />
          <ActionButton
            icon={<Backpack className="size-4" aria-hidden="true" />}
            label={T.items}
            hint={`${CONSUMABLE_IDS.reduce((n, id) => n + side.inventory[id], 0)}`}
            disabled={!isMyTurn}
            onClick={() => setPanel('items')}
          />
          <ActionButton
            icon={<ArrowLeftRight className="size-4" aria-hidden="true" />}
            label={T.swap}
            hint={swapBadge}
            tone="arcane"
            disabled={!isMyTurn || swapBlock !== null}
            onClick={handleSwap}
          />
        </div>
      )}

      {panel === 'items' && (
        <SubPanel title={T.items} onBack={() => setPanel('main')}>
          {CONSUMABLE_IDS.every((id) => side.inventory[id] === 0) && (
            <p className="col-span-full py-2 text-center text-sm text-parchment/60">{T.noItems}</p>
          )}
          {CONSUMABLE_IDS.filter((id) => side.inventory[id] > 0).map((id: ConsumableId) => (
            <ActionButton
              key={id}
              icon={<Backpack className="size-4" aria-hidden="true" />}
              label={CONSUMABLES[id].name}
              hint={`x${side.inventory[id]}`}
              title={CONSUMABLES[id].description}
              disabled={!isMyTurn}
              onClick={() => send({ type: 'USE_ITEM', side: 'player', item: id })}
            />
          ))}
        </SubPanel>
      )}

      {panel === 'swap' && (
        <SubPanel title={T.swapTitle} onBack={() => setPanel('main')}>
          {candidates.map((index) => {
            const benched = side.party[index]
            return (
              <ActionButton
                key={benched.characterId}
                icon={<ArrowLeftRight className="size-4" aria-hidden="true" />}
                label={CHARACTERS[benched.characterId].name}
                hint={`${benched.hp}/${maxHpOf(benched)} HP`}
                tone="arcane"
                disabled={!isMyTurn}
                onClick={() => send({ type: 'SWAP', side: 'player', toIndex: index })}
              />
            )
          })}
        </SubPanel>
      )}
    </div>
  )
}

function SubPanel({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={T.back}
          className="flex size-8 items-center justify-center border-2 border-panel-edge bg-night-deep/60 text-parchment"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <p className="font-display text-[9px] text-parchment">{title}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </div>
  )
}

interface ActionButtonProps {
  icon: ReactNode
  label: string
  hint?: string
  title?: string
  tone?: 'default' | 'gold' | 'arcane'
  disabled?: boolean
  onClick: () => void
}

const tones: Record<NonNullable<ActionButtonProps['tone']>, string> = {
  default:
    'border-panel-edge bg-[linear-gradient(180deg,oklch(0.38_0.06_270),oklch(0.27_0.05_270))] text-parchment',
  gold: 'border-gold-dim bg-[linear-gradient(180deg,oklch(0.55_0.11_80),oklch(0.4_0.09_75))] text-parchment',
  arcane: 'border-arcane/70 bg-[linear-gradient(180deg,oklch(0.45_0.1_200),oklch(0.32_0.08_210))] text-parchment',
}

function ActionButton({ icon, label, hint, title, tone = 'default', disabled, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex min-h-12 flex-col items-center justify-center gap-1 border-[3px] px-1 py-1.5 shadow-[inset_0_2px_0_oklch(1_0_0/0.1),0_4px_0_oklch(0.1_0.03_272)] transition-[transform,box-shadow,filter,opacity] duration-100 select-none hover:brightness-110 active:translate-y-1 active:shadow-[inset_0_2px_0_oklch(1_0_0/0.1),0_0_0_oklch(0.1_0.03_272)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 disabled:active:translate-y-0',
        tones[tone],
      )}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        <span className="text-shadow-pixel line-clamp-1 font-display text-[8px] leading-tight">{label}</span>
      </span>
      {hint && <span className="font-body text-xs leading-none text-parchment/70">{hint}</span>}
    </button>
  )
}
