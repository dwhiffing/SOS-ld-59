import { useRef } from 'react'
import { type Object3D } from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const WOOD_COLOR = '#2e2010'

export function Table({
  position = [0, 0, 0],
  size = 0.3,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)

  const w = size * 2
  const h = size * 0.8
  const d = size
  const topT = size * 0.1
  const legW = size * 0.07
  const legH = h - topT

  return (
    <RigidBody type="fixed" colliders={false}>
      <group ref={ref} rotation={rotation} position={position}>
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size * 2, size, size]} />

        {/* Tabletop */}
        <mesh castShadow receiveShadow position={[0, h - topT / 2, 0]}>
          <boxGeometry args={[w, topT, d]} />
          <meshStandardMaterial
            color={WOOD_COLOR}
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* 4 legs */}
        {([-1, 1] as const).flatMap((x) =>
          ([-1, 1] as const).map((z) => (
            <mesh
              key={`${x}${z}`}
              castShadow
              receiveShadow
              position={[
                x * (w / 2 - legW / 2),
                legH / 2,
                z * (d / 2 - legW / 2),
              ]}>
              <boxGeometry args={[legW, legH, legW]} />
              <meshStandardMaterial
                color={WOOD_COLOR}
                roughness={1}
                metalness={0}
              />
            </mesh>
          )),
        )}
      </group>
    </RigidBody>
  )
}

export default Table
