import { useRef } from 'react'
import { type Object3D } from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const WOOD_COLOR = '#2e2010'

export function Chair({
  position = [0, 0, 0],
  size = 0.2,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)

  const w = size * 0.75
  const d = size * 0.75
  const legW = size * 0.07
  const seatH = size * 0.75
  const seatT = size * 0.08
  const backH = size * 0.8
  const backT = size * 0.06

  return (
    <RigidBody type="fixed" colliders={false}>
      <group ref={ref} rotation={rotation} position={position}>
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size, size * 2, size]} />

        {/* Front legs */}
        {([-1, 1] as const).map((x) => (
          <mesh
            key={x}
            castShadow
            receiveShadow
            position={[x * (w / 2 - legW / 2), seatH / 2, d / 2 - legW / 2]}>
            <boxGeometry args={[legW, seatH, legW]} />
            <meshStandardMaterial
              color={WOOD_COLOR}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}

        {/* Back legs — extend up to form backrest posts */}
        {([-1, 1] as const).map((x) => (
          <mesh
            key={x}
            castShadow
            receiveShadow
            position={[
              x * (w / 2 - legW / 2),
              (seatH + backH) / 2,
              -(d / 2 - legW / 2),
            ]}>
            <boxGeometry args={[legW, seatH + backH, legW]} />
            <meshStandardMaterial
              color={WOOD_COLOR}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}

        {/* Seat */}
        <mesh castShadow receiveShadow position={[0, seatH, 0]}>
          <boxGeometry args={[w, seatT, d]} />
          <meshStandardMaterial
            color={WOOD_COLOR}
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* Backrest */}
        <mesh
          castShadow
          receiveShadow
          position={[0, seatH + backH * 0.7, -(d / 2 - backT / 2)]}>
          <boxGeometry args={[w, backH * 0.4, backT]} />
          <meshStandardMaterial
            color={WOOD_COLOR}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>
    </RigidBody>
  )
}

export default Chair
