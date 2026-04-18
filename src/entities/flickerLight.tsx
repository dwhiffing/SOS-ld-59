import { useEffect, useRef } from 'react'
import { useWorld } from 'koota/react'
import { useFrame } from '@react-three/fiber'
import { type Object3D, type PointLight } from 'three'
import { Mesh } from '../shared/traits'
import { LightSource } from '../shared/lightTraits'
import useGameStore from '../stores/gameStore'
import { roomHeight } from './room'

export function FlickerLight({
  position = [0, 0, 0],
  intensity = 5,
  color = '#936a1e',
  baseDistance = 5,
  defaultOn = false,
}: {
  intensity?: number
  position?: [number, number, number]
  color?: string
  baseDistance?: number
  defaultOn?: boolean
}) {
  const world = useWorld()
  const ref = useRef<Object3D | null>(null)
  const lightRef = useRef<PointLight | null>(null)
  const entityRef = useRef<any>(null)
  const idRef = useRef<string>(
    `flicker-${Math.random().toString(36).slice(2, 9)}`,
  )
  const toggleRef = useRef(false)

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

  useFrame(() => {
    const light = lightRef.current
    if (!light) return

    if (!on) {
      light.intensity = 0
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
