import { useEffect, useMemo, useRef, useState } from 'react'
import { animated, useSpring } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useTraitEffect, useWorld } from 'koota/react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { initialState, useGameStore } from '../stores/gameStore'
import { playDoorClose, playDoorOpen, playDoorUnlock } from './sounds'
import { NearestItem } from './controller/traits'
import Keypad from './keypad'
import { doorH, doorW } from './room'
import { AnimatedTint } from '../components/AnimatedTint'

interface DoorProps {
  position: [number, number, number]
  orientation: 'horizontal' | 'vertical'
  thickness?: number
  color?: string
  doorId: string
  isExit?: boolean
  locked?: boolean
  keypad?: {
    code: string
    id: string
    position: [number, number, number]
    rotation: [number, number, number]
  }
}

function makeDoorMap(mode: 'bump' | 'color') {
  const w = 128
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const px = w * 0.15
  const py = h * 0.075
  const pw = w * 0.7
  const ph = h * 0.8

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#000'
  ctx.fillRect(px, py, pw, ph)

  const tex = new CanvasTexture(canvas)
  if (mode === 'color') tex.colorSpace = SRGBColorSpace
  return tex
}

export const Door: React.FC<DoorProps> = ({
  position,
  orientation,
  thickness = 0.02,
  doorId,
  isExit,
  locked,
  keypad,
}) => {
  const ref = useRef(null)
  const world = useWorld()
  const [isOutlined, setIsOutlined] = useState(false)
  useTraitEffect(world, NearestItem, (nearest) => {
    setIsOutlined(nearest?.mesh === ref.current)
  })

  const isOpen = useGameStore((s) => s.isDoorOpen(doorId ?? ''))
  const isLocked = useGameStore((s) => s.lockedDoors[doorId ?? ''])
  const [showBars, setShowBars] = useState(!!locked)

  const prevLockedRef = useRef(isLocked)
  useEffect(() => {
    if (isLocked) {
      setShowBars(true)
      prevLockedRef.current = true
      return
    }
    if (prevLockedRef.current) playDoorUnlock()
    prevLockedRef.current = false
    const t = setTimeout(() => setShowBars(false), 2000)
    return () => clearTimeout(t)
  }, [isLocked])

  const barSpring = useSpring({
    position: isLocked ? [0, 0, 0] : [0, doorH * 1.5, 0],
    config: isLocked
      ? { tension: 9999, friction: 9999 } // instant snap when locking
      : { tension: 120, friction: 120 }, // animate only when unlocking
  })

  const args: [number, number, number] =
    orientation === 'horizontal'
      ? [doorW, doorH, thickness]
      : [thickness, doorH, doorW]

  const _args: [number, number, number] = [
    args[0] * 1.0,
    args[1] * 1.0,
    args[2] * 1.0,
  ]

  const spring = useSpring({
    position: isOpen ? [0, doorH, 0] : [0, 0, 0],
    config: { tension: 170, friction: 26 },
  })

  useEffect(() => {
    if (!isOpen) return
    playDoorOpen()
    if (isExit) {
      useGameStore.setState(initialState)
      useGameStore.getState().setScene('menu')
    } else {
      setTimeout(() => {
        useGameStore.getState().closeDoor(doorId)
        playDoorClose()
      }, 3000)
    }
  }, [isOpen, doorId, isExit])

  useEffect(() => {
    useGameStore.getState().initDoor(doorId, locked ?? false)
  }, [doorId])

  const bumpMap = useMemo(() => makeDoorMap('bump'), [])

  return (
    <RigidBody type="fixed" colliders={false}>
      <group position={position}>
        {!isOpen && <CuboidCollider args={_args} scale={0.5} />}
        <mesh
          name={!isOpen ? 'door' : ''}
          userData={{ doorId }}
          visible={false}
          ref={ref}>
          <boxGeometry args={_args} />
        </mesh>

        {keypad && (
          <Keypad
            keypadId={keypad.id}
            code={keypad.code}
            doorId={doorId}
            position={keypad.position}
            rotation={keypad.rotation}
          />
        )}

        {showBars &&
          (() => {
            const dir = doorId.split('-').pop()
            const front =
              (thickness / 2 + 0.015) *
              (dir === 'north' || dir === 'east' ? -1 : 1)
            return (
              <animated.group position={barSpring.position as unknown as any}>
                {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
                  const offset = (t - 0.5) * doorW
                  const pos: [number, number, number] =
                    dir === 'north' || dir === 'south'
                      ? [offset, 0, front]
                      : [front, 0, offset]
                  return (
                    <mesh key={i} position={pos} castShadow>
                      <boxGeometry args={[0.025, doorH, 0.025]} />
                      <meshStandardMaterial
                        color="#888"
                        roughness={0.4}
                        metalness={0.9}
                      />
                    </mesh>
                  )
                })}
              </animated.group>
            )
          })()}

        <animated.group position={spring.position as unknown as any}>
          <mesh castShadow>
            <boxGeometry args={_args} />
            <meshStandardMaterial
              color="#555"
              bumpMap={bumpMap}
              bumpScale={5}
              roughness={0.9}
              metalness={0.9}
            />
            <AnimatedTint
              color={isLocked ? 'red' : 'white'}
              opacity={isOutlined ? 0.05 : 0}
            />
          </mesh>
        </animated.group>
      </group>
    </RigidBody>
  )
}

Door.displayName = 'Door'
export default Door
