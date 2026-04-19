import { Physics } from '@react-three/rapier'
import { RootProviders } from '../providers'
import { Map } from '../components/Map'

export function DebugLevel() {
  return (
    <RootProviders>
      <Physics gravity={[0, -9.81, 0]}>
        <Map hideCeiling />
      </Physics>
      <ambientLight intensity={1} />
    </RootProviders>
  )
}
