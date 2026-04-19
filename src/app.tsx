import React, { useEffect, useRef, useState } from 'react'
import useGameStore from './stores/gameStore'
import Game from './components/Game'
import Menu from './components/Menu'
import { initTerminalSearch } from './entities/terminalSearch'
// @ts-expect-error css import
import './index.css'

initTerminalSearch()

export function App() {
  const targetScene = useGameStore((s) => s.scene)
  const [currentScene, setCurrentScene] = useState<'menu' | 'game'>(targetScene)
  const [isFading, setIsFading] = useState(false)
  const FADE_DURATION = 800
  const lastTarget = useRef(targetScene)

  useEffect(() => {
    if (targetScene === lastTarget.current) return
    lastTarget.current = targetScene

    setIsFading(true)

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
      {currentScene === 'menu' ? <Menu /> : <Game />}

      <div
        className={`scene-fade ${isFading ? 'visible' : ''}`}
        aria-hidden
        style={{ transitionDuration: `${FADE_DURATION}ms` }}
      />
    </div>
  )
}
