import { useEffect, useRef } from 'react'
import { useTrait, useWorld } from 'koota/react'
import { type Object3D } from 'three'
import { Mesh, PhysicsBody } from '../shared/traits'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { AnimatedOutlines } from '../components/AnimatedOutlines'
import { NearestItem } from './controller/traits'
import { useGLTF } from '@react-three/drei'

export function Map({
  position = [0, 0, 0],
  size = [0.15, 0.45, 0.15],
}: {
  position?: [number, number, number]
  size?: [number, number, number]
}) {
  const world = useWorld()
  const ref = useRef<Object3D | null>(null)
  const bodyRef = useRef<any>(null)
  const nearest = useTrait(world, NearestItem)
  const { nodes, materials } = useGLTF('/terminal.glb')

  useEffect(() => {
    if (!ref.current) return

    const entity = world.spawn(
      Mesh(ref.current ?? undefined),
      PhysicsBody({ api: bodyRef }),
    )

    return () => {
      entity.destroy()
    }
  }, [world])
  const _nodes = nodes as any

  return (
    <RigidBody ref={bodyRef} type="fixed" mass={1} colliders={false}>
      <CuboidCollider scale={[0.5, 0.5, 0.5]} args={size} position={position} />

      <group position={position}>
        <mesh ref={ref} name="map" visible={false}>
          <boxGeometry args={size} />
        </mesh>
        <group
          position={[0, -0.2, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={[0.23, 0.23, 0.23]}
        >
          <mesh
            castShadow
            geometry={_nodes.Object_2.geometry}
            material={materials.Computer}
          >
            <AnimatedOutlines
              thickness={1}
              opacity={nearest?.mesh === ref.current ? 1 : 0}
            />
          </mesh>

          <mesh
            geometry={_nodes.Object_5.geometry}
            material={materials.Screen_Glass}
          />

          <mesh
            castShadow
            geometry={_nodes.Object_7.geometry}
            material={materials.Stand_LowPoly}
          >
            <AnimatedOutlines
              thickness={1}
              opacity={nearest?.mesh === ref.current ? 1 : 0}
            />
          </mesh>
        </group>
      </group>
    </RigidBody>
  )
}

export default Map
