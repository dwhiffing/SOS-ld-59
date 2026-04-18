import { useEffect, useRef } from 'react'
import { useTrait, useWorld } from 'koota/react'
import { type Object3D } from 'three'
import { Mesh } from '../shared/traits'
import { AnimatedOutlines } from '../components/AnimatedOutlines'
import { NearestItem } from './controller/traits'
import { useGLTF } from '@react-three/drei'

export function Key({
  position = [0, 0, 0],
  size = 0.12,
}: {
  position?: [number, number, number]
  size?: number
}) {
  const world = useWorld()
  const ref = useRef<Object3D | null>(null)
  const nearest = useTrait(world, NearestItem)
  const { nodes, materials } = useGLTF('/key.glb')

  useEffect(() => {
    if (!ref.current) return

    const entity = world.spawn(Mesh(ref.current ?? undefined))

    return () => {
      entity.destroy()
    }
  }, [world])

  return (
    <group
      ref={ref}
      dispose={null}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <mesh name="key" visible={false}>
        <boxGeometry args={[size, size * 0.4, size * 0.2]} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.Object_2.geometry}
        material={materials.blinn6SG}
        rotation={[0, 0, -Math.PI / 3]}
        scale={[0.0001, 0.0001, 0.0001]}
      >
        <AnimatedOutlines
          opacity={ref.current?.children[0] === nearest?.mesh ? 1 : 0}
        />
      </mesh>
    </group>
  )
}

export default Key
