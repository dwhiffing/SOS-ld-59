import { CuboidCollider } from '@react-three/rapier'
import { type ReactNode } from 'react'

// Solid placeholder box with a matching collider. Must live inside a RigidBody.
export function Block({
  size,
  position = [0, 0, 0],
  color = '#888',
  collider = true,
  emissive,
  name,
  userData,
  children,
}: {
  size: [number, number, number]
  position?: [number, number, number]
  color?: string
  collider?: boolean
  emissive?: string
  name?: string
  userData?: Record<string, unknown>
  children?: ReactNode
}) {
  const [w, h, d] = size
  return (
    <>
      {collider && <CuboidCollider args={[w / 2, h / 2, d / 2]} position={position} />}
      <mesh
        castShadow
        receiveShadow
        position={position}
        name={name}
        userData={userData}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          emissive={emissive ?? '#000'}
          emissiveIntensity={emissive ? 1 : 0}
        />
        {children}
      </mesh>
    </>
  )
}

export default Block
