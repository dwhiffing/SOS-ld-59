import { useRef } from 'react'
import { type Object3D } from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const WOOD_COLOR = '#333130'

export function Shelf({
  position = [0, 0, 0],
  size = 0.2,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)

  const w = size * 2 // total width
  const h = size * 3 // total height
  const d = size // depth
  const pt = size * 0.06 // panel thickness

  const numShelves = 5
  const shelfSpacing = h / numShelves

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={[rotation[0], rotation[1], rotation[2]]}
        position={position}>
        <CuboidCollider
          scale={[0.5, 0.5, 0.5]}
          args={[size * 2, size * 3, size]}
        />

        {/* Corner pillars */}
        {([-1, 1] as const).flatMap((x) =>
          ([-1, 1] as const).map((z) => (
            <mesh
              key={`${x}${z}`}
              castShadow
              receiveShadow
              position={[x * (w / 2 - pt / 2), 0, z * (d / 2 - pt / 2)]}>
              <boxGeometry args={[pt, h, pt]} />
              <meshStandardMaterial
                color={WOOD_COLOR}
                roughness={1}
                metalness={0}
              />
            </mesh>
          )),
        )}

        {/* Horizontal shelves */}
        {Array.from({ length: numShelves }).map((_, i) => (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[0, (i + 1) * shelfSpacing - h / 2, 0]}>
            <boxGeometry args={[w, pt, d]} />
            <meshStandardMaterial
              color={WOOD_COLOR}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

export default Shelf
