import { Physics } from '@react-three/rapier'
import RapierDebug from '../shared/rapierDebug'
import { Controller } from '../entities/controller'

import mapData from './1.json'
import {
  getSpawnPosition,
  TiledMap,
  TiledMapData,
} from '../components/TiledMap'

export function DebugLevel() {
  const spawnPos = getSpawnPosition(mapData as TiledMapData)
  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        <RapierDebug enabled={false} />

        <Controller position={spawnPos} />

        <TiledMap map={mapData as TiledMapData} />
      </Physics>
      <ambientLight intensity={1} />
    </>
  )
}
