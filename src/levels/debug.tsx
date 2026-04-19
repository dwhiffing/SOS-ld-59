import { Physics } from '@react-three/rapier'
import { Controller } from '../entities/controller'
import { playerPos } from '../entities/controller/system'
import RapierDebug from '../shared/rapierDebug'
import { Map } from '../components/Map'

const spawnPos: [number, number, number] = [0.2, 0.1, -0]
playerPos.x = spawnPos[0]
playerPos.y = spawnPos[1]
playerPos.z = spawnPos[2]

export function DebugLevel() {
  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        <RapierDebug enabled={false} />
        <Controller position={spawnPos} />
        <Map />
      </Physics>
      {/* <ambientLight intensity={1} /> */}
    </>
  )
}
