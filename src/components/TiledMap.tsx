import { JSX, useMemo, useState } from 'react'
import { RoomVariant } from './RoomVariant'

type TiledProperty = { name: string; type: string; value: number | string }

type TiledObject = {
  gid: number
  x: number
  y: number
  width: number
  height: number
  name: string
  id: number
  properties?: TiledProperty[]
}

type TiledLayer = {
  name: string
  type: 'tilelayer' | 'objectgroup'
  // tile layer fields
  data?: number[]
  width?: number
  height?: number
  // object layer fields
  objects?: TiledObject[]
}

// Maps Room Layer tile ID → door directions (0=north, 1=south, 2=east, 3=west)
const TILE_DOORS: Record<number, number[]> = {
  4: [2, 3], // east + west
  5: [0, 1], // north + south
  6: [1, 2], // south + east
  7: [1, 3], // south + west
  8: [0, 3], // north + west
  9: [0, 2], // north + east
  10: [0, 1, 2, 3], // all four
  12: [1, 2, 3], // all but north
  13: [0, 1, 3], // all but east
  14: [0, 2, 3], // all but south
  15: [0, 1, 2], // all but west
  16: [1], // dead-end south
  17: [3], // dead-end west
  18: [0], // dead-end north
  19: [2], // dead-end east
}

export function getSpawnPosition(
  map: TiledMapData,
  roomSize = 2,
): [number, number, number] {
  const roomLayer = map.layers.find((l) => l.name === 'Room Layer')
  const startObj = roomLayer?.objects?.find((o) => o.name === 'start')
  if (!startObj) return [0, 0.1, 0]
  const tileW = map.tilewidth ?? 16
  const col = startObj.x / tileW
  const row = startObj.y / tileW - 1
  return [col * roomSize + 0.2, 0.1, -row * roomSize]
}

export type TiledMapData = {
  width: number
  height: number
  tilewidth: number
  tileheight: number
  layers: TiledLayer[]
}

export function TiledMap({
  map,
  roomSize = 2,
}: {
  map: TiledMapData
  roomSize?: number
}) {
  const roomLayer = map.layers.find((l) => l.name === 'Room Layer')

  const tileW = map.tilewidth

  const roomObjects = useMemo(
    () =>
      (roomLayer?.objects ?? []).flatMap((obj) => {
        const doors = TILE_DOORS[obj.gid]
        if (!doors) return []
        const col = obj.x / tileW
        const row = obj.y / tileW - 1
        const getProp = (name: string) =>
          obj.properties?.find((p) => p.name === name)?.value
        const keypads: Record<number, string> = {}
        for (const dir of [0, 1, 2, 3]) {
          const code = getProp(`keypad${dir}Code`)
          if (code != null && code !== -1)
            keypads[dir] = String(code).padStart(4, '0')
        }
        const variantValue = getProp('variant')
        const exitDoorValue = getProp('exitDoor')
        return [
          {
            obj,
            doors,
            col,
            row,
            key: `tiled-${col}-${row}`,
            keypads,
            hasTerminal: !!getProp('hasTerminal'),
            variant: variantValue != null ? Number(variantValue) : 0,
            exitDoor: exitDoorValue != null ? Number(exitDoorValue) : undefined,
          },
        ]
      }),
    [roomLayer, tileW],
  )

  const [positions] = useState<Record<string, [number, number, number]>>(() => {
    const init: Record<string, [number, number, number]> = {}
    for (const { col, row, key } of roomObjects) {
      init[key] = [(col * roomSize) / 2, 0, (-row * roomSize) / 2]
    }
    return init
  })

  if (!roomLayer) return null

  const rooms: JSX.Element[] = []

  for (const { doors, key, keypads, hasTerminal, variant, exitDoor } of roomObjects) {
    const keypadProp =
      Object.keys(keypads).length > 0
        ? Object.fromEntries(
            Object.entries(keypads).map(([dir, code]) => [
              dir,
              { code, id: `${key}-keypad-${dir}` },
            ]),
          )
        : undefined
    rooms.push(
      <RoomVariant
        key={key}
        position={positions[key]}
        doors={doors as [number?, number?, number?, number?]}
        roomId={key}
        keypadProp={keypadProp as any}
        hasTerminal={hasTerminal}
        variant={variant}
        exitDoor={exitDoor}
      />,
    )
  }

  return <>{rooms}</>
}
