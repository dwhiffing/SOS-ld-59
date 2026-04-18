import { useRef } from 'react'
import { type Object3D } from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const WOOD_COLOR = '#2a1e10'
const INSET_COLOR = '#302416'

// Inset panel on each of the 6 faces
const FACES = [
  { pos: [0, 0, 1] as const, rot: [0, 0, 0] as const },
  { pos: [0, 0, -1] as const, rot: [0, Math.PI, 0] as const },
  { pos: [1, 0, 0] as const, rot: [0, Math.PI / 2, 0] as const },
  { pos: [-1, 0, 0] as const, rot: [0, -Math.PI / 2, 0] as const },
  { pos: [0, 1, 0] as const, rot: [-Math.PI / 2, 0, 0] as const },
  { pos: [0, -1, 0] as const, rot: [Math.PI / 2, 0, 0] as const },
]

function Crate({
  position,
  s,
}: {
  position: [number, number, number]
  s: number
}) {
  const b = s * 0.12
  const inner = s - b * 2
  const t = s * 0.02
  const d = s * 0.5 + t * 0.5

  // planks in face-local XY space
  const planks: [number, number, number, number][] = [
    [0, s * 0.5 - b * 0.5, s, b],
    [0, -(s * 0.5 - b * 0.5), s, b],
    [-(s * 0.5 - b * 0.5), 0, b, inner],
    [s * 0.5 - b * 0.5, 0, b, inner],
  ]

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={1} metalness={0} />
      </mesh>
      {FACES.map(({ pos, rot }, i) => (
        <group
          key={i}
          position={[pos[0] * d, pos[1] * d, pos[2] * d]}
          rotation={rot}>
          {planks.map(([x, y, w, h], j) => (
            <mesh key={j} position={[x, y, 0]}>
              <boxGeometry args={[w, h, t]} />
              <meshStandardMaterial
                color={INSET_COLOR}
                roughness={1}
                metalness={0}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

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
  const s = size * 0.55

  return (
    <RigidBody type="fixed" colliders={false}>
      <group
        ref={ref}
        rotation={[rotation[0], rotation[1], rotation[2]]}
        position={position}>
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size, size, size]} />
        <group rotation={[0, 0.3, 0]}>
          <Crate position={[-s * 0.5, s * 0.5, -s * 0.5]} s={s} />
        </group>
        <group rotation={[0, -0.5, 0]}>
          <Crate position={[s * 0.5, s * 0.5, s * 0.5]} s={s} />
        </group>
        <group rotation={[0, 0.8, 0]}>
          <Crate position={[0, s * 1.55, 0]} s={s} />
        </group>
      </group>
    </RigidBody>
  )
}

export default Crates
