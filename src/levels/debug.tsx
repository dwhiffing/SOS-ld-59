import { Physics } from '@react-three/rapier'
import { Controller } from '../entities/controller'
import { playerPos } from '../entities/controller/system'
import RapierDebug from '../shared/rapierDebug'
import { Store } from './store'

// Start just inside the entrance, looking into the store
const spawnPos: [number, number, number] = [0.6, 0.1, -1.4]
playerPos.x = spawnPos[0]
playerPos.y = spawnPos[1]
playerPos.z = spawnPos[2]

export function DebugLevel() {
  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        <RapierDebug enabled={false} />
        <Controller position={spawnPos} />
        <Store />
      </Physics>
      <ambientLight intensity={0.6} />
    </>
  )
}
