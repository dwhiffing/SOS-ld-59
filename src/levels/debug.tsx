import { Physics } from '@react-three/rapier'
import {
  getSpawnPosition,
  TiledMap,
  TiledMapData,
} from '../components/TiledMap'
import { Controller } from '../entities/controller'
import { playerPos } from '../entities/controller/system'
import RapierDebug from '../shared/rapierDebug'
import mapData from './1.json'

export function DebugLevel() {
  const spawnPos = getSpawnPosition(mapData as TiledMapData)
  playerPos.x = spawnPos[0]
  playerPos.y = spawnPos[1]
  playerPos.z = spawnPos[2]
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
