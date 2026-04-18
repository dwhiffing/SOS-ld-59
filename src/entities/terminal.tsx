import { useEffect, useMemo, useRef, useState } from 'react'
import { useTrait, useWorld } from 'koota/react'
import { NearestFilter, type Object3D } from 'three'
import { CanvasTexture, PlaneGeometry } from 'three'

import { Mesh, PhysicsBody } from '../shared/traits'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { AnimatedOutlines } from '../components/AnimatedOutlines'
import { NearestItem } from './controller/traits'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { morse, decodeMorse } from './morseRecorder'
import { BITMAP_HEIGHT, BITMAP_WIDTH } from '../constants'

const FONT_SIZE = 40
const MORSE_HIGH_FRAC = 0.42
const MORSE_LOW_FRAC = 0.58
const LINE_WIDTH = 3
const SIGNAL_PAD = 15
const COLOR_BG = '#000f00'
const COLOR_SIGNAL = '#00dc00'
const COLOR_CURSOR = '#003300'
const COLOR_RESPONSE_SIGNAL = '#dc0000'
const COLOR_RESPONSE_CURSOR = '#660000'

const SCREEN_OFFSET: [number, number, number] = [0.045, 0.172, 0]
const SCREEN_SIZE: [number, number] = [0.13, 0.1]
const SCREEN_CURVE = -0.005

new FontFace('TerminalFont', 'url(/font.ttf)')
  .load()
  .then((f) => document.fonts.add(f))

function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = COLOR_BG
  ctx.fillRect(0, 0, w, h)

  if (morse.phase === 'idle') return

  const HIGH_Y = Math.floor(h * MORSE_HIGH_FRAC)
  const LOW_Y = Math.floor(h * MORSE_LOW_FRAC)
  const displayHead = morse.playhead
  const signalW = w - SIGNAL_PAD * 2
  const toX = (sx: number) => SIGNAL_PAD + sx * (signalW / BITMAP_WIDTH)

  const responding = morse.phase === 'responding' || morse.phase === 'responded'
  ctx.strokeStyle = responding ? COLOR_RESPONSE_SIGNAL : COLOR_SIGNAL
  ctx.lineWidth = LINE_WIDTH
  ctx.beginPath()
  ctx.moveTo(0, LOW_Y + 0.5)
  ctx.lineTo(SIGNAL_PAD, LOW_Y + 0.5)
  let prevY = (morse.signal[0] === 1 ? HIGH_Y : LOW_Y) + 0.5
  if (prevY !== LOW_Y + 0.5) ctx.lineTo(SIGNAL_PAD, prevY)
  for (let x = 1; x < displayHead; x++) {
    const y = (morse.signal[x] === 1 ? HIGH_Y : LOW_Y) + 0.5
    if (y !== prevY) {
      ctx.lineTo(toX(x), prevY)
      ctx.lineTo(toX(x), y)
      prevY = y
    }
  }
  ctx.lineTo(toX(displayHead), prevY)
  if (morse.phase === 'done') {
    if (prevY !== LOW_Y + 0.5) ctx.lineTo(toX(displayHead), LOW_Y + 0.5)
    ctx.lineTo(w, LOW_Y + 0.5)
  }
  ctx.stroke()

  if (
    (morse.phase === 'recording' || morse.phase === 'responding') &&
    displayHead < BITMAP_WIDTH
  ) {
    ctx.strokeStyle = responding ? COLOR_RESPONSE_CURSOR : COLOR_CURSOR
    ctx.beginPath()
    ctx.moveTo(toX(displayHead), 0)
    ctx.lineTo(toX(displayHead), h)
    ctx.stroke()
  }

  ctx.fillStyle = responding ? COLOR_RESPONSE_SIGNAL : COLOR_SIGNAL
  ctx.font = `${FONT_SIZE}px TerminalFont`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  const charY = HIGH_Y - 4
  for (const { char, x0, x1 } of decodeMorse(morse.signal, displayHead)) {
    ctx.fillText(char, toX((x0 + x1) / 2), charY)
  }
}

function useCurvedGeometry(width: number, height: number, curve: number) {
  return useMemo(() => {
    const geo = new PlaneGeometry(width, height, 16, 8)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / (width / 2)
      const y = pos.getY(i) / (height / 2)
      pos.setZ(i, -curve * (1 - x * x) * (1 - y * y * 0.3))
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [width, height, curve])
}

export function Terminal({
  position = [0, 0, 0] as [number, number, number],
  size = [0.15, 0.45, 0.15] as [number, number, number],
}: {
  position?: [number, number, number]
  size?: [number, number, number]
}) {
  const world = useWorld()
  const ref = useRef<Object3D | null>(null)
  const bodyRef = useRef<any>(null)
  const nearest = useTrait(world, NearestItem)
  const { nodes, materials } = useGLTF('/terminal.glb')
  const screenGeometry = useCurvedGeometry(
    SCREEN_SIZE[0],
    SCREEN_SIZE[1],
    SCREEN_CURVE,
  )

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tex, setTex] = useState<CanvasTexture | null>(null)
  const lastPlayheadRef = useRef(-1)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = BITMAP_WIDTH
    canvas.height = BITMAP_HEIGHT
    canvasRef.current = canvas
    const texture = new CanvasTexture(canvas)
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    setTex(texture)
    return () => texture.dispose()
  }, [])

  useFrame(() => {
    const canvas = canvasRef.current
    if (!canvas || !tex) return
    const ctx = canvas.getContext('2d')!

    if (morse.phase !== 'idle') {
      if (morse.playhead !== lastPlayheadRef.current) {
        lastPlayheadRef.current = morse.playhead
        draw(ctx, BITMAP_WIDTH, BITMAP_HEIGHT)
        tex.needsUpdate = true
      }
    } else if (lastPlayheadRef.current !== -1) {
      lastPlayheadRef.current = -1
      draw(ctx, BITMAP_WIDTH, BITMAP_HEIGHT)
      tex.needsUpdate = true
    }
  })

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
        <mesh ref={ref} name="terminal" visible={false}>
          <boxGeometry args={size} />
        </mesh>
        <group
          position={[0, -0.2, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={[0.23, 0.23, 0.23]}>
          <mesh
            castShadow
            geometry={_nodes.Object_2.geometry}
            material={materials.Computer}>
            <AnimatedOutlines
              thickness={1}
              opacity={nearest?.mesh === ref.current ? 1 : 0}
            />
          </mesh>
          <mesh
            castShadow
            geometry={_nodes.Object_7.geometry}
            material={materials.Stand_LowPoly}>
            <AnimatedOutlines
              thickness={1}
              opacity={nearest?.mesh === ref.current ? 1 : 0}
            />
          </mesh>
        </group>

        {tex && (
          <mesh
            geometry={screenGeometry}
            position={SCREEN_OFFSET}
            rotation={[0, Math.PI / 2, 0]}>
            <meshBasicMaterial map={tex} />
          </mesh>
        )}
      </group>
    </RigidBody>
  )
}

export default Terminal
