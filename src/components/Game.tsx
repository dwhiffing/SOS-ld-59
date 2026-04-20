import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { processMountQueue } from '../entities/mountScheduler'

import { PerformanceMonitor, Preload } from '@react-three/drei'
import { morse } from '../entities/morseRecorder'
import { isTouchDevice, pressR } from '../entities/controller/system'
import { DebugLevel } from '../levels/debug'
import { KootaSystems } from '../providers'
import useGameStore, { type SoundMode } from '../stores/gameStore'

function MountScheduler() {
  useFrame(() => {
    processMountQueue()
  })
  return null
}
// Compiles all shaders (including from initially-hidden rooms) before first frame
function ShaderWarmup() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    gl.compileAsync(scene, camera).catch(() => {})
  }, [])
  return null
}

export function Game() {
  const [dpr, setDpr] = useState(1.5)
  return (
    <div className="game">
      {/* <Canvas dpr={dpr} shadows frameloop="demand"> */}
      <Canvas dpr={dpr} shadows>
        <PerformanceMonitor
          iterations={10}
          threshold={0.75}
          flipflops={4}
          onIncline={() => setDpr(2)}
          onDecline={() => setDpr(1)}
        />
        <Preload all />
        <ShaderWarmup />
        <MountScheduler />
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

function MobileCancelButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isTouchDevice) return
    let raf: number
    const check = () => {
      setVisible(morse.phase === 'recording' || morse.phase === 'responding')
      raf = requestAnimationFrame(check)
    }
    raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onPress = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    pressR()
  }, [])

  if (!visible) return null

  return (
    <button
      onTouchStart={onPress}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        border: '2px solid rgba(255,255,255,0.4)',
        color: 'white',
        fontSize: 13,
        letterSpacing: 1,
        cursor: 'pointer',
        touchAction: 'none',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}>
      CLEAR
    </button>
  )
}

function Hud() {
  return (
    <div className="ui">
      <SoundModeToast />
      <MobileCancelButton />
    </div>
  )
}
