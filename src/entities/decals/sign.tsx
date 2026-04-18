import { useMemo, useRef } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Shape, type Object3D } from 'three'

const WOOD_COLOR = '#504f19'
const ANGLE = 0.218

function makeShape(w: number, h: number) {
  const legW = w * 0.25
  const cutH = h * 0.25
  const hw = w / 1.8

  const topHW = hw * 0.7
  const slope = (hw - topHW) / h // x gained per unit down

  // inner leg x at a given depth
  const innerX = (depth: number) => topHW + slope * depth - legW

  const shape = new Shape()
  shape.moveTo(-topHW, 0)
  shape.lineTo(topHW, 0)
  shape.lineTo(hw, -h)
  shape.lineTo(hw - legW, -h)
  shape.lineTo(innerX(h - cutH), -(h - cutH))
  shape.lineTo(-innerX(h - cutH), -(h - cutH))
  shape.lineTo(-(hw - legW), -h)
  shape.lineTo(-hw, -h)
  shape.closePath()
  return shape
}

function Panel({ w, h, t }: { w: number; h: number; t: number }) {
  const shape = useMemo(() => makeShape(w, h), [w, h])
  const extrudeSettings = useMemo(
    () => ({
      depth: t,
      bevelEnabled: true,
      bevelThickness: t * 0.1,
      bevelSize: t * 0.1,
    }),
    [t],
  )

  return (
    <mesh castShadow receiveShadow position={[0, 0, -t / 2]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={WOOD_COLOR} roughness={0} metalness={0} />
    </mesh>
  )
}

export function Sign({
  position = [0, 0, 0],
  size = 0.1725,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  size?: number
  rotation?: [number, number, number]
}) {
  const ref = useRef<Object3D | null>(null)

  const w = size * 0.65
  const h = size * 1.265
  const t = size * 0.05
  const topY = size * 1.1

  return (
    <RigidBody type="fixed" colliders={false}>
      <group ref={ref} rotation={rotation} position={position}>
        <CuboidCollider scale={[0.5, 0.5, 0.5]} args={[size, size, size]} />

        <group rotation={[-ANGLE, 0, 0]} position={[0, topY, 0]}>
          <Panel w={w} h={h} t={t} />
        </group>

        <group rotation={[ANGLE, 0, 0]} position={[0, topY, 0]}>
          <Panel w={w} h={h} t={t} />
        </group>
      </group>
    </RigidBody>
  )
}

export default Sign
