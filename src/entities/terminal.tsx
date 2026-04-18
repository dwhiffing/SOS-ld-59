import { useEffect, useRef, useState } from 'react'
import { useTrait, useWorld } from 'koota/react'
import { NearestFilter, type Object3D } from 'three'
import { CanvasTexture } from 'three'

import { Mesh, PhysicsBody } from '../shared/traits'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { NearestItem } from './controller/traits'
import { useFrame } from '@react-three/fiber'
import { morse, decodeMorse } from './morseRecorder'
import { BITMAP_HEIGHT, BITMAP_WIDTH } from '../constants'
import { AnimatedTint } from '../components/AnimatedTint'

const TERMINAL_TABLE_HEIGHT = 0.2

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
  if (morse.phase === 'done' || (responding && displayHead >= BITMAP_WIDTH)) {
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

type V3 = [number, number, number]

function bezelStrips(
  w: number,
  h: number,
  d: number,
  bezelSize: number,
  bezelDepth: number,
) {
  const x = -(w / 2 + bezelDepth / 2)
  return [
    {
      pos: [x, h / 2 - bezelSize / 2, 0] as V3,
      args: [bezelDepth, bezelSize, d] as V3,
    },
    {
      pos: [x, -(h / 2 - bezelSize / 2), 0] as V3,
      args: [bezelDepth, bezelSize, d] as V3,
    },
    {
      pos: [x, 0, -(d / 2 - bezelSize / 2)] as V3,
      args: [bezelDepth, h - bezelSize * 2, bezelSize] as V3,
    },
    {
      pos: [x, 0, d / 2 - bezelSize / 2] as V3,
      args: [bezelDepth, h - bezelSize * 2, bezelSize] as V3,
    },
  ]
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tex, setTex] = useState<CanvasTexture | null>(null)
  const lastPlayheadRef = useRef(-1)
  const keyMeshRef = useRef<any>(null)

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
    if (keyMeshRef.current) {
      const pressed = nearest?.mesh === ref.current && morse.keyHeld
      keyMeshRef.current.position.y = pressed ? 0.096 : 0.099
    }

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

  const isNearest = nearest?.mesh === ref.current

  return (
    <RigidBody ref={bodyRef} type="fixed" mass={1} colliders={false}>
      <CuboidCollider scale={[0.5, 0.5, 0.5]} args={size} position={position} />

      <group
        position={[
          position[0],
          position[1] + (TERMINAL_TABLE_HEIGHT - 0.025),
          position[2],
        ]}>
        <mesh ref={ref} name="terminal" visible={false}>
          <boxGeometry args={size} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
          <boxGeometry args={[0.15, 0.05, 0.15]} />
          <meshStandardMaterial color="#111411" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.071 - TERMINAL_TABLE_HEIGHT / 2, 0]}>
          <boxGeometry args={[0.04, TERMINAL_TABLE_HEIGHT, 0.04]} />
          <meshStandardMaterial color="#111411" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.071 - TERMINAL_TABLE_HEIGHT - 0.01, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.1]} />
          <meshStandardMaterial color="#111411" roughness={0.9} />
        </mesh>

        <mesh castShadow receiveShadow position={[0.055, 0.0925, 0]}>
          <boxGeometry args={[0.03, 0.008, 0.055]} />
          <meshStandardMaterial
            color="#111411"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        <mesh castShadow ref={keyMeshRef} position={[0.055, 0.099, 0]}>
          <boxGeometry args={[0.015, 0.003, 0.015]} />
          <meshStandardMaterial
            color="#441411"
            roughness={0.7}
            metalness={0.1}
          />
          <AnimatedTint color="#ff0000" opacity={isNearest ? 1 : 0} />
        </mesh>

        {/* Screen frame — bezelSize: border width, bezelDepth: border protrusion */}
        <group
          position={[-0.0195, 0.092, 0]}
          rotation={[0, 0, -Math.PI / 1.51]}>
          <mesh>
            <boxGeometry args={[0.05, 0.1, 0.15]} />
            <meshStandardMaterial color="#111411" roughness={0.9} />
          </mesh>
          {bezelStrips(0.05, 0.1, 0.15, 0.012, 0.006).map(
            ({ pos, args }, i) => (
              <mesh key={i} position={pos}>
                <boxGeometry args={args} />
                <meshStandardMaterial color="#111411" roughness={0.9} />
              </mesh>
            ),
          )}
        </group>

        {/* Screen canvas */}
        {tex && (
          <mesh
            position={[-0.005, 0.117, 0]}
            rotation={[Math.PI / 2, Math.PI / 1.19, Math.PI / -2]}>
            <planeGeometry args={[0.125, 0.075]} />
            <meshBasicMaterial map={tex} />
          </mesh>
        )}
      </group>
    </RigidBody>
  )
}

export default Terminal
