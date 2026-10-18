import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { processMountQueue } from '../entities/mountScheduler'

import { PerformanceMonitor, Preload } from '@react-three/drei'
import { isTouchDevice } from '../entities/controller/system'
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

// What the crosshair is pointing at
function LookPrompt() {
  const lookingAt = useGameStore((s) => s.lookingAt)
  if (!lookingAt) return null
  return (
    <div className="look-prompt">
      {lookingAt}
      <span className="look-hint">
        {isTouchDevice ? 'tap' : 'click'} to interact
      </span>
    </div>
  )
}

// Placeholder feedback until real interactions exist
function InteractionToast() {
  const interaction = useGameStore((s) => s.lastInteraction)
  if (!interaction) return null
  return (
    <div
      key={interaction.at}
      style={{
        color: '#ffd400',
        fontSize: 14,
        letterSpacing: 1,
        pointerEvents: 'none',
        animation: 'hudMessageFade 2s ease-out forwards',
      }}>
      Interacted with {interaction.label}
    </div>
  )
}

function Hud() {
  return (
    <>
      <LookPrompt />
      <div className="ui">
        <SoundModeToast />
        <InteractionToast />
      </div>
    </>
  )
}
