import { useRef } from 'react'
import { MeshStandardMaterial, type Object3D } from 'three'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

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
  const { nodes, materials } = useGLTF('/chair.glb')

  const original = materials.M_Wood
  const mat = original.clone() as MeshStandardMaterial
  mat.color.multiplyScalar(0.15)

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={[0 + rotation[0], 0 + rotation[1], 0 + rotation[2]]}
        position={position}
      >
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size, size * 2, size]} />
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          geometry={nodes.Chair_M_Wood_0.geometry}
          material={mat}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.4}
        />
      </group>
    </RigidBody>
  )
}

export default Chair
