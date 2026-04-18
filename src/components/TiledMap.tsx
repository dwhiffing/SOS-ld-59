import { JSX, useMemo, useState } from 'react'
import FlickerLight from '../entities/flickerLight'
import { Room } from '../entities/room'
import { Terminal } from '../entities/terminal'
import Shelf from '../entities/decals/shelf'
import Bed from '../entities/decals/bed'
import Crates from '../entities/decals/crates'
import { Barrel } from '../entities/decals/barrel'
import { Sign } from '../entities/decals/sign'
import { Cart } from '../entities/decals/cart'
import Table from '../entities/decals/table'
import Chair from '../entities/decals/chair'

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
  roomSize = 3,
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
  roomSize = 3,
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
        const keypadCode = getProp('keypadCode')
        const keypadDoor = getProp('keypadDoor')
        return [
          {
            obj,
            doors,
            col,
            row,
            key: `tiled-${col}-${row}`,
            keypadCode,
            keypadDoor,
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

  for (const { doors, key, keypadCode, keypadDoor } of roomObjects) {
    rooms.push(
      <Room
        key={key}
        scale={[3, 1, 3]}
        position={positions[key]}
        doors={doors as [number?, number?, number?, number?]}
        roomId={key}
        keypads={
          keypadCode != null && keypadDoor != null
            ? {
                [keypadDoor as 0 | 1 | 2 | 3]: {
                  code: String(keypadCode).padStart(4, '0'),
                  id: `${key}-keypad`,
                },
              }
            : undefined
        }>
        <FlickerLight position={[0, 0, 0]} intensity={20.0} defaultOn />

        <Terminal position={[0, 0.2, 0]} />
        <Table position={[-0.79, 0, -0.81]} />
        <Chair position={[-0.79, 0, -1.01]} />

        <Shelf position={[1.04, 0.3, 1.16]} />
        <Crates position={[1.08, 0, -1.07]} />
        <Barrel position={[-1.25, 0, 1.24]} />
        <Barrel position={[-1.0, 0, 1.22]} />
        <Barrel position={[-1.16, 0, 0.98]} />
        <Barrel position={[0.65, 0, -1.21]} />

        <Sign position={[-0.67, 0, -0.54]} />
        <Cart position={[0.6, 0, -0.31]} rotation={[3.14, -0.23, 3.14]} />
        <Bed position={[-0.65, 0.1, 0.67]} />
      </Room>,
    )
  }

  return <>{rooms}</>
}
