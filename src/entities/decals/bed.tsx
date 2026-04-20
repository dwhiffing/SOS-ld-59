import { useRef } from 'react'
import { type Object3D } from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const FRAME_COLOR = '#2e2010'
const MATTRESS_COLOR = '#393932'
const PILLOW_COLOR = '#5a4a62'

export function Bed({
  position = [0, 0, 0],
  size = 0.28,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)

  const w = size * 1.2
  const l = size * 2.3
  const legH = size * 0.4
  const frameH = size * 0.08
  const frameT = size * 0.06
  const mattressH = size * 0.15

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={rotation}
        position={[position[0], position[1] - size * 0.5, position[2]]}>
        <CuboidCollider
          scale={[0.5, 0.5, 0.5]}
          args={[size, size * 1, size * 1.5]}
        />

        {/* Legs */}
        {([-1, 1] as const).flatMap((x) =>
          ([-1, 1] as const).map((z) => (
            <mesh
              key={`${x}${z}`}
              castShadow
              receiveShadow
              position={[
                x * (w / 2 - frameT / 2),
                legH / 2,
                z * (l / 2 - frameT / 2),
              ]}>
              <boxGeometry args={[frameT, legH, frameT]} />
              <meshStandardMaterial
                color={FRAME_COLOR}
                roughness={1}
                metalness={0}
              />
            </mesh>
          )),
        )}

        {/* Side rails (sit on top of legs) */}
        {([-1, 1] as const).map((x) => (
          <mesh
            key={x}
            castShadow
            receiveShadow
            position={[x * (w / 2 - frameT / 2), legH + frameH / 2, 0]}>
            <boxGeometry args={[frameT, frameH, l]} />
            <meshStandardMaterial
              color={FRAME_COLOR}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}

        {/* End rails */}
        {([1] as const).map((z) => (
          <mesh
            key={z}
            castShadow
            receiveShadow
            position={[0, legH + frameH / 2, z * (l / 2 - frameT / 2)]}>
            <boxGeometry args={[w, frameH, frameT]} />
            <meshStandardMaterial
              color={FRAME_COLOR}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}

        {/* Headboard — low flat panel */}
        <mesh
          castShadow
          receiveShadow
          position={[0, legH + frameH + size * 0.25, -(l / 2 - frameT / 2)]}>
          <boxGeometry args={[w, size * 0.5, frameT]} />
          <meshStandardMaterial
            color={FRAME_COLOR}
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* Mattress */}
        <mesh
          castShadow
          receiveShadow
          position={[0, legH + frameH + mattressH / 2, 0]}>
          <boxGeometry args={[w - frameT, mattressH, l - frameT]} />
          <meshStandardMaterial
            color={MATTRESS_COLOR}
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* Pillow */}
        <mesh
          castShadow
          receiveShadow
          position={[
            0,
            legH + frameH + mattressH + size * 0.04,
            -(l / 2 - size * 0.35),
          ]}>
          <boxGeometry args={[w * 0.55, size * 0.07, size * 0.28]} />
          <meshStandardMaterial
            color={PILLOW_COLOR}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>
    </RigidBody>
  )
}

export default Bed
