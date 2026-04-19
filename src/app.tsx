import React, { useEffect, useRef, useState } from 'react'
import useGameStore from './stores/gameStore'
import Game from './components/Game'
import Menu from './components/Menu'
import { initTerminalSearch } from './entities/terminalSearch'
import {
  startAmbience,
  stopAmbience,
  startMenuHowl,
  stopMenuHowl,
} from './entities/ambience'
import { setMusicMuted } from './entities/ambience'
import { playGameStart, setSfxMuted } from './entities/sounds'
import './index.css'

initTerminalSearch()

// Apply persisted sound mode on load
{
  const mode = useGameStore.getState().soundMode
  setMusicMuted(mode === 'muteMusic' || mode === 'muteAll')
  setSfxMuted(mode === 'muteAll')
}

export function App() {
  const targetScene = useGameStore((s) => s.scene)
  const [currentScene, setCurrentScene] = useState<'menu' | 'game'>(targetScene)
  const [isFading, setIsFading] = useState(false)
  const FADE_DURATION = 900
  const lastTarget = useRef(targetScene)

  useEffect(() => {
    if (targetScene === lastTarget.current) return
    lastTarget.current = targetScene

    setIsFading(true)
    if (targetScene === 'game') {
      stopMenuHowl()
      startAmbience()
      playGameStart()
    } else {
      stopAmbience()
      startMenuHowl()
    }

    const toBlack = window.setTimeout(() => {
      setCurrentScene(targetScene)

      const back = window.setTimeout(() => {
        setIsFading(false)
      }, FADE_DURATION)

      return () => window.clearTimeout(back)
    }, FADE_DURATION)

    return () => window.clearTimeout(toBlack)
  }, [targetScene])

  return (
    <div className="app-root">
      {currentScene === 'menu' && <Menu />}

      <Game />

      <div
        className={`scene-fade ${isFading ? 'visible' : ''}`}
        aria-hidden
        style={{ transitionDuration: `${FADE_DURATION}ms` }}
      />
    </div>
  )
}
