import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useTraitEffect, useWorld } from 'koota/react'
import { CanvasTexture, NearestFilter, type Object3D } from 'three'
import { Mesh } from '../shared/traits'
import { useGameStore } from '../stores/gameStore'
import { NearestItem } from './controller/traits'

const W = 128
const H = 160

const COLS = 3
const BUTTON_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

// [col, row] for each button — 0 is centered on the bottom row
const BUTTON_GRID: [number, number][] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
  [1, 3],
]

const PAD_X = 8
const PAD_Y = 48
const BTN_W = (W - PAD_X * 2) / COLS
const BTN_H = 22
const BTN_GAP = 3
const DISPLAY_H = 36

const SIZE: [number, number, number] = [0.08, 0.1, 0.02]
const SCREEN_W = SIZE[0] * 0.9
const SCREEN_H = SIZE[1] * 0.9
const BTN_3D_W = ((BTN_W - BTN_GAP * 2) / W) * SCREEN_W
const BTN_3D_H = (BTN_H / H) * SCREEN_H
const BTN_Z = SIZE[2] / 2 + 0.003

// Precomputed at module load — static layout never changes
const BTN_POSITIONS: [number, number, number][] = BUTTON_GRID.map(
  ([col, row]) => {
    const cx = PAD_X + col * BTN_W + BTN_GAP + (BTN_W - BTN_GAP * 2) / 2
    const cy = PAD_Y + row * (BTN_H + BTN_GAP) + BTN_H / 2
    return [(cx / W - 0.5) * SCREEN_W, (0.5 - cy / H) * SCREEN_H, BTN_Z]
  },
)

function drawKeypad(
  ctx: CanvasRenderingContext2D,
  input: string,
  isUnlocked: boolean,
  isError: boolean,
  hoveredIndex: number,
) {
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = isError ? '#1a0000' : '#001a00'
  ctx.fillRect(PAD_X, 8, W - PAD_X * 2, DISPLAY_H)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (isUnlocked) {
    ctx.fillStyle = '#00ff44'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('UNLOCKED', W / 2, 8 + DISPLAY_H / 2)
  } else if (isError) {
    ctx.fillStyle = '#ff4444'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('DENIED', W / 2, 8 + DISPLAY_H / 2)
  } else {
    ctx.font = 'bold 20px monospace'
    const slotW = (W - PAD_X * 2) / 4
    const sy = 8 + DISPLAY_H / 2
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i < input.length ? '#00ff44' : '#004400'
      ctx.fillText(
        i < input.length ? '●' : '○',
        PAD_X + i * slotW + slotW / 2,
        sy,
      )
    }
  }

  ctx.font = 'bold 13px monospace'
  for (let i = 0; i < BUTTON_LABELS.length; i++) {
    const [col, row] = BUTTON_GRID[i]
    const bx = PAD_X + col * BTN_W + BTN_GAP
    const by = PAD_Y + row * (BTN_H + BTN_GAP)
    const bw = BTN_W - BTN_GAP * 2
    const isHovered = i === hoveredIndex

    ctx.fillStyle = isHovered ? '#2a4a2a' : '#1a2a1a'
    ctx.fillRect(bx, by, bw, BTN_H)

    ctx.strokeStyle = isHovered ? '#88ff88' : '#336633'
    ctx.lineWidth = isHovered ? 2 : 1
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, BTN_H - 1)

    ctx.fillStyle = isHovered ? '#aaffaa' : '#44cc44'
    ctx.fillText(BUTTON_LABELS[i], bx + bw / 2, by + BTN_H / 2)
  }
}

interface KeypadProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  keypadId: string
  code: string
  doorId?: string
}

export function Keypad({
  position,
  rotation = [0, 0, 0],
  keypadId,
  code,
  doorId,
}: KeypadProps) {
  const world = useWorld()
  const groupRef = useRef<Object3D | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tex, setTex] = useState<CanvasTexture | null>(null)
  const lastDrawKeyRef = useRef('')
  const hoveredIndexRef = useRef(-1)

  const isErrorRef = useRef(false)

  const initKeypad = useGameStore((s) => s.initKeypad)
  const resetKeypadInput = useGameStore((s) => s.resetKeypadInput)
  const keypad = useGameStore((s) => s.keypads[keypadId])
  const isUnlocked = useGameStore((s) =>
    doorId ? s.lockedDoors[doorId] === false : false,
  )

  useEffect(() => {
    initKeypad(keypadId, code, doorId)
  }, [keypadId, code, doorId, initKeypad])

  // Detect wrong code: input filled to 4 but not unlocked
  useEffect(() => {
    if (!keypad || isUnlocked || keypad.input.length < 4) return
    isErrorRef.current = true
    const timer = setTimeout(() => {
      isErrorRef.current = false
      resetKeypadInput(keypadId)
    }, 1000)
    return () => clearTimeout(timer)
  }, [keypad?.input, isUnlocked, keypadId, resetKeypadInput])

  useTraitEffect(world, NearestItem, (nearest) => {
    const mesh = nearest?.mesh as any
    const isThisKeypad = mesh?.userData?.keypadId === keypadId
    hoveredIndexRef.current = isThisKeypad
      ? (mesh?.userData?.btnIndex ?? -1)
      : -1
  })

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    canvasRef.current = canvas
    const texture = new CanvasTexture(canvas)
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    setTex(texture)

    const ctx = canvas.getContext('2d')!
    drawKeypad(ctx, '', false, false, -1)
    texture.needsUpdate = true

    return () => texture.dispose()
  }, [])

  useFrame(() => {
    if (!canvasRef.current || !tex) return
    const input = keypad?.input ?? ''
    const isError = isErrorRef.current
    const drawKey = `${input}|${isUnlocked}|${isError}|${hoveredIndexRef.current}`
    if (drawKey === lastDrawKeyRef.current) return
    lastDrawKeyRef.current = drawKey
    const ctx = canvasRef.current.getContext('2d')!
    drawKeypad(ctx, input, isUnlocked, isError, hoveredIndexRef.current)
    tex.needsUpdate = true
  })

  useEffect(() => {
    if (!groupRef.current) return
    const entity = world.spawn(Mesh(groupRef.current))
    return () => entity.destroy()
  }, [world])

  return (
    <RigidBody type="fixed" colliders={false}>
      <group position={position} rotation={rotation} ref={groupRef}>
        <CuboidCollider args={SIZE} scale={0.5} />

        <mesh>
          <boxGeometry args={SIZE} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.3}
          />
        </mesh>

        {tex && (
          <mesh position={[0, 0, SIZE[2] / 2 + 0.001]}>
            <planeGeometry args={[SCREEN_W, SCREEN_H]} />
            <meshBasicMaterial map={tex} />
          </mesh>
        )}

        {BUTTON_LABELS.map((label, i) => (
          <mesh
            key={i}
            name="keypad-btn"
            userData={{ keypadId, digit: label, btnIndex: i }}
            visible={false}
            position={BTN_POSITIONS[i]}>
            <planeGeometry args={[BTN_3D_W, BTN_3D_H]} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

export default Keypad
