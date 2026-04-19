import { useMemo } from 'react'
import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three'
import { roomHeight } from './room'

interface GraffitiProps {
  texts: Partial<Record<0 | 1 | 2 | 3, string>>
  halfWidth: number
  halfDepth: number
  thick: number
}

const WALL_CONFIGS: Record<
  number,
  {
    pos: (hw: number, hd: number, t: number) => [number, number, number]
    rot: [number, number, number]
  }
> = {
  0: {
    pos: (_hw, hd, t) => [0, roomHeight * 0.45, hd - t - 0.001],
    rot: [0, Math.PI, 0],
  },
  1: {
    pos: (_hw, hd, t) => [0, roomHeight * 0.45, -hd + t + 0.001],
    rot: [0, 0, 0],
  },
  2: {
    pos: (hw, _hd, t) => [hw - t - 0.001, roomHeight * 0.45, 0],
    rot: [0, -Math.PI / 2, 0],
  },
  3: {
    pos: (hw, _hd, t) => [-hw + t + 0.001, roomHeight * 0.45, 0],
    rot: [0, Math.PI / 2, 0],
  },
}

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function drawWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  cx: number,
  cy: number,
  angle: number,
  rand: () => number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.font = '900 32px monospace'
  ctx.letterSpacing = `${Math.round(4 + rand() * 10)}px`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.lineWidth = 10
  ctx.strokeStyle = '#705034'
  ctx.globalAlpha = 0.1
  ctx.strokeText(word, 0, 0)

  for (const [dx, dy] of [
    [-2, -2],
    [2, -2],
    [-2, 2],
    [2, 2],
  ] as const) {
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#7b5d43'
    ctx.fillText(word, dx, dy)
  }

  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#ba9270'
  ctx.fillText(word, 0, 0)

  ctx.restore()
}

function makeGraffitiTexture(text: string): CanvasTexture {
  const words = text.toUpperCase().split(' ').filter(Boolean)
  const W = 512
  const H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = seededRand(seed)

  if (words.length === 1) {
    drawWord(ctx, words[0], W / 2, H / 2, (rand() - 0.5) * 0.15, rand)
  } else {
    const slotW = (W * 0.95) / words.length
    const startX = W / 2 - (slotW * words.length) / 2
    for (let i = 0; i < words.length; i++) {
      const cx = startX + slotW * i + slotW / 2 + (rand() - 0.5) * slotW * 0.05
      const cy = H / 2 + (rand() - 0.5) * H * 0.12
      const angle = (rand() - 0.5) * 0.1
      drawWord(ctx, words[i], cx, cy, angle, rand)
    }
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.magFilter = NearestFilter
  tex.minFilter = NearestFilter
  return tex
}

export function Graffiti({
  texts,
  halfWidth,
  halfDepth,
  thick,
}: GraffitiProps) {
  const entries = Object.entries(texts) as [string, string][]

  return (
    <>
      {entries.map(([dirStr, text]) => {
        const dir = Number(dirStr) as 0 | 1 | 2 | 3
        const config = WALL_CONFIGS[dir]
        if (!config || !text) return null
        const pos = config.pos(halfWidth, halfDepth, thick)
        return (
          <GraffitiPlane
            key={dir}
            text={text}
            position={pos}
            rotation={config.rot}
          />
        )
      })}
    </>
  )
}

function GraffitiPlane({
  text,
  position,
  rotation,
}: {
  text: string
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const tex = useMemo(() => makeGraffitiTexture(text), [text])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[1.2, 0.28]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.05} />
    </mesh>
  )
}
