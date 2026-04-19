import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CylinderGeometry,
  SphereGeometry,
  CircleGeometry,
  MeshStandardMaterial,
  type Mesh as ThreeMesh,
} from 'three'

// Shared geometry/material instances — created once, reused across all DrippingPipe instances
const PIPE_RADIUS = 0.055
const PIPE_LENGTH = 0.3
const ELBOW_RADIUS = 0.042
const HALF_PIPE = PIPE_LENGTH / 2
const TIP_Y = -0.03
const BOTTOM_Y = -1
const DROP_SPEED = 2.5

const pipeGeometry = new CylinderGeometry(
  PIPE_RADIUS,
  PIPE_RADIUS,
  PIPE_LENGTH,
  20,
)
const capGeometry = new CircleGeometry(PIPE_RADIUS * 0.9, 20)
const dropGeometry = new SphereGeometry(0.008, 6, 6)
const puddleGeometry = new CircleGeometry(0.07, 16)

const pipeMaterial = new MeshStandardMaterial({
  color: '#3a3835',
  roughness: 0.85,
  metalness: 0.6,
})
const capMaterial = new MeshStandardMaterial({
  color: '#000000',
  roughness: 1,
  metalness: 0,
})
const dropMaterial = new MeshStandardMaterial({
  color: '#4488aa',
  roughness: 0.05,
  metalness: 0,
  transparent: true,
  depthWrite: false,
  opacity: 0.9,
})
const puddleMaterial = new MeshStandardMaterial({
  color: '#2a5566',
  roughness: 0.3,
  metalness: 0.1,
  transparent: true,
  depthWrite: false,
  opacity: 0.7,
})

// Returns an array of [isOn, durationMs] pairs for a morse code string.
// Base unit = 500ms. dot=1, dash=3, symbol gap=1, letter gap=3 (space), word gap=7 (slash or double space).
function buildMorseSequence(morse: string): [boolean, number][] {
  const UNIT = 300
  const seq: [boolean, number][] = []
  const tokens = morse.trim().split('')
  let pendingGap = 0

  for (let i = 0; i < tokens.length; i++) {
    const ch = tokens[i]
    if (ch === '.') {
      if (pendingGap > 0) seq.push([false, pendingGap])
      seq.push([true, UNIT])
      pendingGap = UNIT // inter-symbol gap
    } else if (ch === '-') {
      if (pendingGap > 0) seq.push([false, pendingGap])
      seq.push([true, UNIT * 4])
      pendingGap = UNIT // inter-symbol gap
    }
  }
  return seq
}

export function DrippingPipe({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  dropDistance = 100,
  morseCode,
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  dropDistance?: number
  morseCode?: string
}) {
  const dropRef = useRef<ThreeMesh | null>(null)

  const morseSeqRef = useRef<[boolean, number][]>([])
  const morseIndexRef = useRef(0)
  const morseElapsedRef = useRef(0)
  const morseRestartRef = useRef(0)

  const droppingRef = useRef(false)
  const dropYRef = useRef(TIP_Y)
  const prevShouldDripRef = useRef(false)

  useEffect(() => {
    if (morseCode) {
      morseSeqRef.current = buildMorseSequence(morseCode)
      morseIndexRef.current = 0
      morseElapsedRef.current = 0
      morseRestartRef.current = 0
    }
  }, [morseCode])

  useFrame((_, delta) => {
    const drop = dropRef.current
    if (!drop) return

    const deltaMs = delta * 1000
    let shouldDrip = false
    const seq = morseSeqRef.current

    if (morseCode && seq.length > 0) {
      if (morseRestartRef.current > 0) {
        morseRestartRef.current -= deltaMs
      } else {
        morseElapsedRef.current += deltaMs
        const [isOn, duration] = seq[morseIndexRef.current]
        if (morseElapsedRef.current >= duration) {
          morseElapsedRef.current -= duration
          morseIndexRef.current++
          if (morseIndexRef.current >= seq.length) {
            morseIndexRef.current = 0
            morseRestartRef.current = 5000
          }
        }
        shouldDrip = isOn
      }
    } else {
      shouldDrip = true
    }

    // Trigger exactly one drop at the trailing edge of each morse "on" segment
    if (!shouldDrip && prevShouldDripRef.current) {
      droppingRef.current = true
      dropYRef.current = TIP_Y
    }
    prevShouldDripRef.current = shouldDrip

    if (droppingRef.current) {
      dropYRef.current -= DROP_SPEED * delta
      drop.position.set(0, dropYRef.current, HALF_PIPE)
      drop.visible = true

      if (dropYRef.current < BOTTOM_Y) {
        droppingRef.current = false
        drop.visible = false
      }
    } else {
      drop.visible = false
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Horizontal pipe section sticking out from wall */}
      <mesh
        castShadow
        receiveShadow
        geometry={pipeGeometry}
        material={pipeMaterial}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Cap at pipe opening */}
      <mesh
        geometry={capGeometry}
        material={capMaterial}
        position={[0, 0, HALF_PIPE + 0.001]}
      />

      {/* Water drop — position managed in useFrame */}
      <mesh
        ref={dropRef}
        geometry={dropGeometry}
        material={dropMaterial}
        visible={false}
      />

      {/* Puddle on floor */}
      <mesh
        receiveShadow
        geometry={puddleGeometry}
        material={puddleMaterial}
        position={[0, -dropDistance - ELBOW_RADIUS * 4.5, HALF_PIPE]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 0.6, 1]}
      />
    </group>
  )
}

export default DrippingPipe
