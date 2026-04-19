import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { DebugLevel } from '../levels/debug'
import { KootaSystems } from '../providers'
import useGameStore, { type SoundMode } from '../stores/gameStore'

export function Game() {
  return (
    <div className="game">
      <Canvas shadows>
        <Preload all />
        <KootaSystems>
          <DebugLevel />
        </KootaSystems>
      </Canvas>
      <div className="crosshair">
        <div
          style={{
            width: 5,
            height: 5,
            backgroundColor: 'white',
            borderRadius: '100%',
          }}
        />
      </div>
      <Hud />
    </div>
  )
}

export default Game

const SOUND_MODE_LABELS: Record<SoundMode, string> = {
  all: 'Unmute All',
  muteMusic: 'Mute Music',
  muteAll: 'Mute All',
}

function SoundModeToast() {
  const soundMode = useGameStore((s) => s.soundMode)
  const [toastKey, setToastKey] = useState<number | null>(null)
  const prevMode = useRef(soundMode)

  useEffect(() => {
    if (soundMode === prevMode.current) return
    prevMode.current = soundMode
    setToastKey(Date.now())
  }, [soundMode])

  if (toastKey === null) return null

  return (
    <div
      key={toastKey}
      style={{
        color: 'white',
        fontSize: 14,
        pointerEvents: 'none',
        animation: 'soundToastFade 0.5s ease-out 1.5s forwards',
        opacity: 1,
      }}>
      {SOUND_MODE_LABELS[soundMode]}
    </div>
  )
}

function Hud() {
  return (
    <div className="ui">
      <SoundModeToast />
    </div>
  )
}
