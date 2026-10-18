import { Physics } from '@react-three/rapier'
import { RootProviders } from '../providers'
import { Store } from './store'

export function DebugLevel() {
  return (
    <RootProviders>
      <Physics gravity={[0, -9.81, 0]}>
        <Store hideCeiling />
      </Physics>
      <ambientLight intensity={1} />
    </RootProviders>
  )
}
