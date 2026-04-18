import { Physics } from '@react-three/rapier'
import RapierDebug from '../shared/rapierDebug'
import { Controller } from '../entities/controller'

import mapData from '../../public/1.json'
import { getSpawnPosition, TiledMap } from '../components/TiledMap'

export function DebugLevel() {
  const spawnPos = getSpawnPosition(mapData)
  console.log(spawnPos)
  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        <RapierDebug enabled={false} />

        <Controller position={spawnPos} />

        <TiledMap map={mapData} roomSize={3} />
      </Physics>
      <ambientLight intensity={10} />
    </>
  )
}
