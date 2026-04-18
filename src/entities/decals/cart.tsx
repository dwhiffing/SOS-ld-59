import { useRef } from 'react'
import { type Object3D } from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const METAL_COLOR = '#2a2a2a'
const WHEEL_COLOR = '#1a1a1a'

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

  const w = size * 0.5
  const l = size
  const wheelR = size * 0.07
  const wheelT = size * 0.04
  const legH = size * 0.15
  const basketH = size * 0.35
  const postT = size * 0.04
  const wallT = size * 0.02
  const basketY = legH
  const handleH = size * 0.25

  return (
    <RigidBody type="fixed" colliders={false}>
      <group ref={ref} rotation={rotation} position={position}>
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size / 2, size, size]} />

        {/* Wheels */}
        {([-1, 1] as const).flatMap((x) =>
          ([-1, 1] as const).map((z) => (
            <mesh
              key={`${x}${z}`}
              castShadow
              rotation={[0, 0, Math.PI / 2]}
              position={[
                x * (w / 2 - wheelT / 2),
                wheelR,
                z * (l / 2 - wheelR),
              ]}>
              <cylinderGeometry args={[wheelR, wheelR, wheelT, 10]} />
              <meshStandardMaterial
                color={WHEEL_COLOR}
                roughness={1}
                metalness={0.3}
              />
            </mesh>
          )),
        )}

        {/* Corner posts */}
        {([-1, 1] as const).flatMap((x) =>
          ([-1, 1] as const).map((z) => (
            <mesh
              key={`${x}${z}`}
              castShadow
              position={[
                x * (w / 2 - postT / 2),
                basketY + basketH / 2,
                z * (l / 2 - postT / 2),
              ]}>
              <boxGeometry args={[postT, basketH + legH, postT]} />
              <meshStandardMaterial
                color={METAL_COLOR}
                roughness={0.8}
                metalness={0.6}
              />
            </mesh>
          )),
        )}

        {/* Basket floor */}
        <mesh castShadow position={[0, basketY, 0]}>
          <boxGeometry args={[w, wallT, l]} />
          <meshStandardMaterial
            color={METAL_COLOR}
            roughness={0.8}
            metalness={0.6}
          />
        </mesh>

        {/* Side walls (left/right) */}
        {([-1, 1] as const).map((x) => (
          <mesh
            key={x}
            castShadow
            position={[x * (w / 2 - wallT / 2), basketY + basketH / 2, 0]}>
            <boxGeometry args={[wallT, basketH, l]} />
            <meshStandardMaterial
              color={METAL_COLOR}
              roughness={0.8}
              metalness={0.6}
            />
          </mesh>
        ))}

        {/* Front/back walls */}
        {([-1, 1] as const).map((z) => (
          <mesh
            key={z}
            castShadow
            position={[0, basketY + basketH / 2, z * (l / 2 - wallT / 2)]}>
            <boxGeometry args={[w, basketH, wallT]} />
            <meshStandardMaterial
              color={METAL_COLOR}
              roughness={0.8}
              metalness={0.6}
            />
          </mesh>
        ))}

        {/* Handle */}
        <mesh
          castShadow
          position={[0, basketY + basketH + handleH / 2, -(l / 2 - postT / 2)]}>
          <boxGeometry args={[w, postT, postT]} />
          <meshStandardMaterial
            color={METAL_COLOR}
            roughness={0.8}
            metalness={0.6}
          />
        </mesh>
        {/* Handle posts */}
        {([-1, 1] as const).map((x) => (
          <mesh
            key={x}
            castShadow
            position={[
              x * (w / 2 - postT / 2),
              basketY + basketH + handleH / 2,
              -(l / 2 - postT / 2),
            ]}>
            <boxGeometry args={[postT, handleH, postT]} />
            <meshStandardMaterial
              color={METAL_COLOR}
              roughness={0.8}
              metalness={0.6}
            />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

export default Cart
