import { useRef } from 'react'
import { type Object3D } from 'three'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

export function Crates({
  position = [0, 0, 0],
  size = 0.4,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)
  const { nodes } = useGLTF('/crates.glb')

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={[0 + rotation[0], 0 + rotation[1], 0 + rotation[2]]}
        position={position}
      >
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size, size, size]} />
        <mesh
          castShadow
          receiveShadow
          scale={[0.15, 0.15, 0.15]}
          // @ts-ignore
          geometry={nodes.Object_2.geometry}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color={'#3a2c1d'}
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      </group>
    </RigidBody>
  )
}

export default Crates
