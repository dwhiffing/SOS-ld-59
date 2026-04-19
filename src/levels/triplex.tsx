import { Physics } from '@react-three/rapier'
import { RootProviders } from '../providers'
import { Room1 } from '../components/Room1'
import { Room2 } from '../components/Room2'

export function DebugLevel() {
  return (
    <RootProviders>
      <Physics gravity={[0, -9.81, 0]}>
        <Room2
          roomId="test"
          hasTerminal={false}
          position={[0, 0, 0]}
          roomSize={2}
          keypadProp={{ 0: '1234', 1: '5678', 2: '9012', 3: '3456' }}
          doors={[0, 1, 2, 3]}
          hideCeiling
        />
      </Physics>
      <ambientLight intensity={1} />
    </RootProviders>
  )
}
