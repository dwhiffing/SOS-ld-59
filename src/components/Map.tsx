import { BaseRoom } from '../components/BaseRoom'
import {
  BigRockWithPebbles,
  CornerBoulder,
  RockCluster,
} from '../entities/Boulders'
import Barrel from '../entities/decals/barrel'
import Bed from '../entities/decals/bed'
import Cart from '../entities/decals/cart'
import Chair from '../entities/decals/chair'
import Crates, { Crate } from '../entities/decals/crates'
import Shelf from '../entities/decals/shelf'
import Sign from '../entities/decals/sign'
import Table from '../entities/decals/table'
import DrippingPipe from '../entities/drippingPipe'
import { Graffiti } from '../entities/Graffiti'

export function Map({ hideCeiling = false }) {
  return (
    <>
      {/* start */}
      <BaseRoom
        roomId="tiled-0-0"
        roomName="start"
        position={[0, 0, 0]}
        doors={[0]}
        hasTerminal={false}
        lockedDoors={{}}
        hideCeiling={hideCeiling}>
        <CornerBoulder
          position={[-0.62, 0, -0.64]}
          rotation={[
            -1.6320386899589952e-16, 0.8901179185171124, 1.825988625068656e-16,
          ]}
          scale={[1.02, 0.96, 0.97]}
        />
        <CornerBoulder
          position={[
            -0.923123896415255, -6.19587516135744e-17, 0.493905124358027,
          ]}
          rotation={[3.141592653589793, 0.6457718232379016, -3.141592653589793]}
          scale={[1.48, 1.41, 1.21]}
        />
        <CornerBoulder
          position={[
            0.620956406977153, 1.69682889018729e-16, 0.631516540269551,
          ]}
          rotation={[3.141592653589793, -1.1868238913561442, 3.141592653589793]}
          scale={[1.02, 0.96, 0.97]}
        />
        <CornerBoulder
          position={[0.6, 0, -0.55]}
          rotation={[
            -2.1185124710429202e-16, -1.0646508437165378,
            -1.2952364087692184e-16,
          ]}
          scale={[1.48, 1.41, 1.21]}
        />
      </BaseRoom>

      {/* room 1 */}
      <BaseRoom
        roomId="tiled-0-1"
        roomName="1"
        position={[0, 0, 1]}
        doors={[0, 1]}
        hasTerminal
        lockedDoors={{ 0: true }}
        hideCeiling={hideCeiling}>
        <Shelf position={[0.62, 0.3, 0.36]} />

        <Crates position={[-0.64, 0, 0.62]} />
        <Crates position={[0.55, 0, -0.53]} />
        <Crate
          position={[-0.54, 0.11, 0.53]}
          rotation={[0, -0.3316125578789226, 0]}
        />
        <Crate
          position={[-0.64, 0.11, 0.25]}
          rotation={[0, -1.2042771838760875, 0]}
        />
        <Crate
          position={[-0.26, 0.11, 0.71]}
          rotation={[3.141592653589793, -1.3613568165555767, 3.141592653589793]}
        />
        <Crate
          position={[-0.68, 0.11, -0.66]}
          rotation={[0, 0.31415926535897937, 0]}
        />
        <Barrel position={[0.79, 0, 0.8]} />
        <Barrel position={[0.52, 0, 0.66]} />
        <Barrel position={[0.32, 0, 0.78]} />
        <Graffiti
          text="... --- ..."
          position={[-0.86, 0.45, -0.0199999999999999]}
          rotation={[-1.2246467991473532e-16, 1.5707963267948966, 0]}
          scale={[0.53, 0.52, 1]}
        />
      </BaseRoom>

      {/* room 2 */}
      <BaseRoom
        roomId="tiled-0-2"
        roomName="2"
        position={[0, 0, 2]}
        doors={[0, 1]}
        hasTerminal
        lockedDoors={{ 0: true }}
        hideCeiling={hideCeiling}>
        <RockCluster
          position={[0.85, 0.3, 0.72]}
          scale={[1, 0.39, 1]}
          rotation={[0, -0.03490658503988684, 0]}
        />
        <Sign
          position={[-0.68, 0, 0.61]}
          rotation={[0, -1.1693705988362006, 0]}
        />
        <Cart
          position={[0.63, 0, -0.55]}
          rotation={[0, 0.7155849933176754, 0]}
        />
        <Barrel position={[-0.53, 0, -0.8]} />
        <Barrel position={[-0.75, 0, -0.46]} />
        <Barrel position={[-0.48, 0, -0.54]} />
        <Graffiti
          text="-.. --- --- .-."
          position={[-0.86, 0.45, -0.0199999999999999]}
          rotation={[-1.2246467991473532e-16, 1.5707963267948966, 0]}
          scale={[0.53, 0.52, 1]}
        />
        <DrippingPipe
          position={[-0.67, 0.69, 0.91]}
          rotation={[0, Math.PI, 0]}
          dropDistance={0.5}
          morseCode=".--."
        />
      </BaseRoom>

      {/* room 3 */}
      <BaseRoom
        roomId="tiled-0-3"
        roomName="3"
        position={[0, 0, 3]}
        doors={[0, 1]}
        hasTerminal
        lockedDoors={{ 0: true }}
        hideCeiling={hideCeiling}>
        <CornerBoulder
          position={[-0.64, 0, -0.6]}
          rotation={[
            -2.74174359081059e-16, 1.1868238913561493, 3.0997567389870457e-16,
          ]}
          scale={[1.02, 0.96, 0.97]}
        />
        <BigRockWithPebbles
          position={[0.71, 0, 0.59]}
          rotation={[
            -3.141592653589793, -0.8901179185171131, -3.141592653589793,
          ]}
          scale={[1.02, 0.96, 0.97]}
        />

        <Table
          position={[0.59, 0, -0.52]}
          rotation={[0, -0.8203047484373349, 0]}
        />
        <Chair
          position={[0.45, 0, -0.34]}
          rotation={[
            -3.141592653589793, 0.5235987755982996, -3.141592653589793,
          ]}
        />
        <Bed
          position={[-0.58, 0.1, 0.57]}
          rotation={[
            -3.141592653589793, 0.12217304763960339, -3.141592653589793,
          ]}
        />

        <Graffiti
          text="-... -.-. ._.."
          position={[-0.86, 0.45, 0.37]}
          rotation={[-1.2246467991473532e-16, 1.5707963267948966, 0]}
          scale={[0.53, 0.52, 1]}
        />
      </BaseRoom>

      {/* room 4 */}
      <BaseRoom
        roomId="tiled-0-4"
        roomName="4"
        position={[0, 0, 4]}
        doors={[0, 1, 2, 3]}
        hasTerminal
        lockedDoors={{}}
        keypadProp={{ 0: '1111' }}
        hideCeiling={hideCeiling}></BaseRoom>

      {/* room 5 - dead-end west */}
      <BaseRoom
        roomId="tiled-13-13"
        roomName="5"
        position={[1, 0, 4]}
        doors={[3]}
        hasTerminal={false}
        lockedDoors={{}}
        hideCeiling={hideCeiling}></BaseRoom>

      {/* room 4 - dead-end east */}
      <BaseRoom
        roomId="tiled-11-13"
        roomName="6"
        position={[-1, 0, 4]}
        doors={[2]}
        hasTerminal={false}
        lockedDoors={{}}
        hideCeiling={hideCeiling}></BaseRoom>

      {/* exit */}
      <BaseRoom
        roomId="tiled-12-12"
        roomName="exit"
        position={[0, 0, 5]}
        doors={[0, 1]}
        hasTerminal={false}
        exitDoor={0}
        lockedDoors={{}}
        hideCeiling={hideCeiling}></BaseRoom>
    </>
  )
}
