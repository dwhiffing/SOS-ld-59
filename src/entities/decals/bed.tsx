import { useRef } from 'react'
import { type Object3D } from 'three'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

export function Bed({
  position = [0, 0, 0],
  size = 0.2,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)
  const { nodes, materials } = useGLTF('/bed.glb')

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
          scale={[0.03, 0.03, 0.03]}
          position={[0, 0, 0]}
          // @ts-ignore
          geometry={nodes.Object_2.geometry}
          material={materials.lambert2SG}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>
    </RigidBody>
  )
}

export default Bed
