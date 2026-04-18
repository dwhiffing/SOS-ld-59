import { JSX, useState } from 'react'
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

type TiledLayer = {
  name: string
  data: number[]
  width: number
  height: number
}

const SPAWN_TILE = 2

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
  const goalLayer = map.layers.find((l) => l.name === 'Goal Layer')
  if (!goalLayer) return [0, 0.1, 0]

  const { width, height } = goalLayer
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const isSpawn = goalLayer.data[row * width + col] === SPAWN_TILE
      if (isSpawn) return [col * roomSize, 0.1, -row * roomSize]
    }
  }
  return [0, 0.1, 0]
}

export type TiledMapData = {
  width: number
  height: number
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

  const [positions] = useState<Record<string, [number, number, number]>>(() => {
    if (!roomLayer) return {}
    const { data, width, height } = roomLayer
    const init: Record<string, [number, number, number]> = {}
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (TILE_DOORS[data[row * width + col]])
          init[`tiled-${col}-${row}`] = [
            (col * roomSize) / 2,
            0,
            (-row * roomSize) / 2,
          ]
      }
    }
    return init
  })

  if (!roomLayer) return null

  const { data, width, height } = roomLayer

  const rooms: JSX.Element[] = []

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const tileId = data[row * width + col]
      const doors = TILE_DOORS[tileId]
      if (!doors) continue

      const key = `tiled-${col}-${row}`

      rooms.push(
        <Room
          key={key}
          scale={[3, 1, 3]}
          position={positions[key]}
          doors={doors as [number?, number?, number?, number?]}
          roomId={key}>
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
  }

  return <>{rooms}</>
}
