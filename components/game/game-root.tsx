'use client'

import { useGameStore } from '@/hooks/use-game-store'
import { useKeyboardInput } from '@/hooks/use-input'
import { GameShell } from './game-shell'
import { TitleScreen } from './screens/title-screen'
import { MainMenuScreen } from './screens/main-menu/main-menu-screen'
import { ModeSelectScreen } from './screens/mode-select/mode-select-screen'
import { LoadingScreen } from './screens/loading-screen'
import { WorldScreen } from './screens/world-screen'
import { TeamSelectScreen } from './screens/team-select/team-select-screen'
import { BattleScreen } from './battle/battle-screen'

/**
 * Ponto de entrada da interface. Lê a fase do jogo na store
 * e monta a tela correspondente. Toda lógica vive em `game/`.
 */
export function GameRoot() {
  const phase = useGameStore((s) => s.phase)
  const isBattle = useGameStore((s) => s.session?.mode === 'vsBot')
  useKeyboardInput()

  return (
    <GameShell>
      {phase === 'title' && <TitleScreen />}
      {phase === 'menu' && <MainMenuScreen />}
      {phase === 'modeSelect' && <ModeSelectScreen />}
      {phase === 'loading' && <LoadingScreen />}
      {phase === 'teamSelect' && <TeamSelectScreen />}
      {(phase === 'world' || phase === 'paused') && (isBattle ? <BattleScreen /> : <WorldScreen />)}
    </GameShell>
  )
}
