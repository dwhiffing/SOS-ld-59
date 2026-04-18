import { useRef } from 'react'
import { type Object3D } from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const BARREL_COLOR = '#322f2d'
const BAND_COLOR = '#2a2a2a'

export function Barrel({
  position = [0, 0, 0],
  size = 0.15,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)

  const r = size * 0.65
  const h = size * 1.8
  const bandH = size * 0.2
  const bandR = r * 1.03

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={[rotation[0], rotation[1], rotation[2]]}
        position={position}>
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size, size, size]} />
        {/* Body */}
        <mesh castShadow receiveShadow position={[0, size * 0.9, 0]}>
          <cylinderGeometry args={[r, r, h, 15]} />
          <meshStandardMaterial
            color={BARREL_COLOR}
            roughness={1}
            metalness={0}
          />
        </mesh>
        {/* Top cap */}
        <mesh position={[0, size * 0.9 + h / 2, 0]}>
          <cylinderGeometry args={[r * 0.9, r, 0.001, 15]} />
          <meshStandardMaterial color="#000" roughness={1} metalness={0} />
        </mesh>

        {/* Metal bands */}
        {[-0.3, 0.3].map((offset, i) => (
          <mesh key={i} position={[0, size * 0.9 + h * offset, 0]}>
            <cylinderGeometry args={[bandR, bandR, bandH, 15]} />
            <meshStandardMaterial
              color={BAND_COLOR}
              roughness={0.6}
              metalness={0.8}
            />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

export default Barrel
