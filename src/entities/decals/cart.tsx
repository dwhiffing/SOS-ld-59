import { useRef } from 'react'
import { MeshStandardMaterial, type Object3D } from 'three'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

export function Cart({
  position = [0, 0, 0],
  size = 0.3,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)
  const { nodes, materials } = useGLTF('/cart.glb')

  const original = materials.material_0
  const mat = original.clone() as MeshStandardMaterial
  mat.color.multiplyScalar(0.25)
  mat.metalness = 0
  mat.roughness = 1

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={[0 + rotation[0], 0 + rotation[1], 0 + rotation[2]]}
        position={position}
      >
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size / 2, size, size]} />
        <mesh
          castShadow
          receiveShadow
          scale={[0.25, 0.25, 0.25]}
          position={[0, -0.005, 0]}
          // @ts-ignore
          geometry={nodes.Object_6.geometry}
          material={mat}
          // rotation={[-Math.PI / 2, 0, 0]}
        ></mesh>
      </group>
    </RigidBody>
  )
}

export default Cart
