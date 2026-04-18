import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { DebugLevel } from '../levels/debug'
import { KootaSystems } from '../providers'
import useGameStore from '../stores/gameStore'

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

function Hud() {
  const keyCount = useGameStore((s) => s.keyCount)

  return (
    <div className="ui">
      <span
        style={{
          marginLeft: 12,
          color: 'gold',
        }}>
        Keys: {keyCount}
      </span>
    </div>
  )
}
