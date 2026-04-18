import { useRef } from 'react'
import { type Object3D } from 'three'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

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
  const { nodes, materials } = useGLTF('/shelf.glb')

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={[0 + rotation[0], 0 + rotation[1], 0 + rotation[2]]}
        position={position}
      >
        <CuboidCollider
          scale={[0.5, 0.5, 0.5]}
          args={[size * 2, size * 3, size]}
        />
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          geometry={nodes.Cloner_1__0.geometry}
          material={materials['Scene_-_Root']}
          scale={[0.003, 0.003, 0.003]}
          position={[0, -0.15, 0]}
        />
      </group>
    </RigidBody>
  )
}

export default Shelf
