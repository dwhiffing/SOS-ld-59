import { useEffect, useRef } from 'react'
import { useWorld } from 'koota/react'
import { useFrame } from '@react-three/fiber'
import { type Object3D, type PointLight } from 'three'
import { Mesh } from '../shared/traits'
import { LightSource } from '../shared/lightTraits'
import useGameStore from '../stores/gameStore'
import { roomHeight } from './room'

function buildMorseSequence(morse: string): [boolean, number][] {
  const UNIT = 200
  const seq: [boolean, number][] = []
  for (let i = 0; i < morse.length; i++) {
    const ch = morse[i]
    if (ch === '.') {
      seq.push([true, UNIT])
    } else if (ch === '-') {
      seq.push([true, UNIT * 4])
    }
    seq.push([false, UNIT])
  }
  return seq
}

export function FlickerLight({
  position = [0, 0, 0],
  intensity = 5,
  color = '#936a1e',
  baseDistance = 5,
  defaultOn = false,
  morseCode,
}: {
  intensity?: number
  position?: [number, number, number]
  color?: string
  baseDistance?: number
  defaultOn?: boolean
  morseCode?: string
}) {
  const world = useWorld()
  const ref = useRef<Object3D | null>(null)
  const lightRef = useRef<PointLight | null>(null)
  const entityRef = useRef<any>(null)
  const idRef = useRef<string>(
    `flicker-${Math.random().toString(36).slice(2, 9)}`,
  )
  const toggleRef = useRef(false)

  // Morse playback state
  const morseSeqRef = useRef<[boolean, number][]>([])
  const morseIndexRef = useRef(0)
  const morseElapsedRef = useRef(0)
  const morseRestartRef = useRef(0) // countdown for 3s gap before restart

  useEffect(() => {
    if (morseCode) {
      morseSeqRef.current = buildMorseSequence(morseCode)
      morseIndexRef.current = 0
      morseElapsedRef.current = 0
      morseRestartRef.current = 0
    }
  }, [morseCode])

  const toggleLight = useGameStore((s) => s.toggleLight)
  const on = useGameStore((s) => s.lights[idRef.current] ?? false)
  useEffect(() => {
    if (defaultOn && !toggleRef.current) toggleLight(idRef.current)
    toggleRef.current = true
  }, [])

  useEffect(() => {
    if (!ref.current) return

    const entity = world.spawn(
      Mesh(ref.current ?? undefined),
      LightSource({
        id: idRef.current,
        position: [position[0], roomHeight - 0.2, position[2]],
        isActive: on,
      }),
    )

    entityRef.current = entity

    return () => {
      entity.destroy()
      entityRef.current = null
    }
  }, [world])

  useEffect(() => {
    if (entityRef.current) {
      const lightSource = entityRef.current.get(LightSource)
      if (lightSource) lightSource.isActive = on
    }
  }, [on])

  useFrame((_, delta) => {
    const light = lightRef.current
    if (!light) return

    if (!on) {
      light.intensity = intensity * 0.7
      return
    }

    const seq = morseSeqRef.current
    if (morseCode && seq.length > 0) {
      const deltaMs = delta * 1000

      // Waiting to restart after full sequence
      if (morseRestartRef.current > 0) {
        morseRestartRef.current -= deltaMs
        light.intensity = intensity * 0.7
        return
      }

      morseElapsedRef.current += deltaMs
      const [isOn, duration] = seq[morseIndexRef.current]

      if (morseElapsedRef.current >= duration) {
        morseElapsedRef.current -= duration
        morseIndexRef.current++
        if (morseIndexRef.current >= seq.length) {
          morseIndexRef.current = 0
          morseRestartRef.current = 5000
          light.intensity = intensity * 0.7
          return
        }
      }

      light.intensity = isOn ? intensity : intensity * 0.7
      return
    }

    if (Math.random() < 0.05) light.intensity = intensity + Math.random() * 1.2
  })

  return (
    <group ref={ref} position={[position[0], roomHeight - 0.03, position[2]]}>
      <pointLight
        ref={lightRef}
        castShadow
        receiveShadow
        distance={baseDistance}
        intensity={intensity}
        color={color}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ceiling plate */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.03, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
    </group>
  )
}

export default FlickerLight
