import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { CanvasTexture, type Object3D, SRGBColorSpace } from 'three'

function makeCrateTextures() {
  const size = 256
  const b = Math.floor(size * 0.12) // border plank width
  const g = 2 // groove thickness

  // --- color map ---
  const cc = document.createElement('canvas')
  cc.width = cc.height = size
  const ctx = cc.getContext('2d')!

  // center panel — medium wood
  ctx.fillStyle = '#372711'
  ctx.fillRect(0, 0, size, size)

  // border planks — slightly lighter
  ctx.fillStyle = '#2f1d06'
  ctx.fillRect(0, 0, size, b) // top
  ctx.fillRect(0, size - b, size, b) // bottom
  ctx.fillRect(0, b, b, size - b * 2) // left
  ctx.fillRect(size - b, b, b, size - b * 2) // right

  // grooves — dark gap between planks and panel
  ctx.fillStyle = '#372712'
  ctx.fillRect(b - g, 0, g * 2, size) // left groove
  ctx.fillRect(size - b - g, 0, g * 2, size) // right groove
  ctx.fillRect(0, b - g, size, g * 2) // top groove
  ctx.fillRect(0, size - b - g, size, g * 2) // bottom groove

  // wood grain lines across entire face
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 12; i++) {
    const y = (size / 12) * i + Math.random() * 8
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y + (Math.random() - 0.5) * 4)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const colorMap = new CanvasTexture(cc)
  colorMap.colorSpace = SRGBColorSpace

  // --- bump map ---
  const bc = document.createElement('canvas')
  bc.width = bc.height = size
  const bctx = bc.getContext('2d')!

  bctx.fillStyle = '#888'
  bctx.fillRect(0, 0, size, size)

  // border planks raised
  bctx.fillStyle = '#bbb'
  bctx.fillRect(0, 0, size, b)
  bctx.fillRect(0, size - b, size, b)
  bctx.fillRect(0, b, b, size - b * 2)
  bctx.fillRect(size - b, b, b, size - b * 2)

  // grooves depressed
  bctx.fillStyle = '#222'
  bctx.fillRect(b - g, 0, g * 2, size)
  bctx.fillRect(size - b - g, 0, g * 2, size)
  bctx.fillRect(0, b - g, size, g * 2)
  bctx.fillRect(0, size - b - g, size, g * 2)

  const bumpMap = new CanvasTexture(bc)

  return { colorMap, bumpMap }
}

const { colorMap: _crateColorMap, bumpMap: _crateBumpMap } = makeCrateTextures()

function Crate({
  position,
  s,
}: {
  position: [number, number, number]
  s: number
}) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={[s, s, s]} />
      <meshStandardMaterial
        map={_crateColorMap}
        bumpMap={_crateBumpMap}
        bumpScale={0.06}
        roughness={1}
        metalness={0}
      />
    </mesh>
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
