import { useRef } from 'react'
import { MeshStandardMaterial, type Object3D } from 'three'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

export function Sign({
  position = [0, 0, 0],
  size = 0.3,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)
  const { nodes, materials } = useGLTF('/sign.glb')

  const original = materials.material_0
  const mat = original.clone() as MeshStandardMaterial
  mat.color.multiplyScalar(0.15)

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
          // @ts-ignore
          geometry={nodes.Object_6.geometry}
          material={mat}
          position={[0, -0.015, 0]}
          scale={[0.25, 0.25, 0.25]}
          rotation={[-0.218, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          geometry={nodes.Object_8.geometry}
          material={mat}
          scale={[0.25, 0.25, 0.25]}
          position={[0, -0.015, 0]}
          rotation={[0.218, 0, 0]}
        />
      </group>
    </RigidBody>
  )
}

export default Sign
