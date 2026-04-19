import { BaseRoom } from '../components/BaseRoom'
import { CornerBoulder } from '../entities/Boulders'
import Barrel from '../entities/decals/barrel'
import Bed from '../entities/decals/bed'
import Cart from '../entities/decals/cart'
import Chair from '../entities/decals/chair'
import Crates from '../entities/decals/crates'
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
        roomId="tiled-12-16"
        roomName="start"
        position={[0, 0, 0]}
        doors={[0]}
        hasTerminal={false}
        lockedDoors={{}}
        hideCeiling={hideCeiling}>
        <Shelf position={[0.62, 0.3, 0.36]} />
        <Sign
          position={[-0.47, 0, 0.39]}
          rotation={[0, -0.9075712110370515, 0]}
        />
        <Shelf position={[-0.61, 0.3, 0.56]} rotation={[0, -0.58, 0]} />
        <Crates position={[0.55, 0, -0.53]} />
        <Barrel position={[0.79, 0, 0.8]} />
        <Barrel position={[0.52, 0, 0.66]} />
        <Barrel position={[0.32, 0, 0.78]} />

        <CornerBoulder
          position={[-0.62, 0, -0.64]}
          rotation={[
            -1.6320386899589952e-16, 0.8901179185171124, 1.825988625068656e-16,
          ]}
          scale={[1.02, 0.96, 0.97]}
        />
      </BaseRoom>

      {/* room 1 */}
      <BaseRoom
        roomId="tiled-12-15"
        roomName="1"
        position={[0, 0, 1]}
        doors={[0, 1]}
        hasTerminal
        lockedDoors={{ 0: true }}
        hideCeiling={hideCeiling}>
        <Shelf position={[0.62, 0.3, 0.36]} />
        <Sign
          position={[-0.47, 0, 0.39]}
          rotation={[0, -0.9075712110370515, 0]}
        />
        <Shelf position={[-0.61, 0.3, 0.56]} rotation={[0, -0.58, 0]} />
        <Crates position={[0.55, 0, -0.53]} />
        <Barrel position={[0.79, 0, 0.8]} />
        <Barrel position={[0.52, 0, 0.66]} />
        <Barrel position={[0.32, 0, 0.78]} />
        <Graffiti
          text="... --- ..."
          position={[-0.08, 0.64, 0.89]}
          rotation={[
            3.141592653589793, 7.632783294297952e-17, 3.141592653589793,
          ]}
          scale={[0.53, 0.52, 1]}
        />
        {/* <CornerBoulder
                position={[-0.62, 0, -0.64]}
                rotation={[
                  -1.6320386899589952e-16, 0.8901179185171124, 1.825988625068656e-16,
                ]}
                scale={[2.08, 1.25, 1.66]}
              /> */}
        <DrippingPipe
          position={[0, 0.69, 0.91]}
          rotation={[0, Math.PI, 0]}
          dropDistance={0.5}
          morseCode=".--."
        />
      </BaseRoom>

      {/* room 2 */}
      <BaseRoom
        roomId="tiled-12-14"
        roomName="2"
        position={[0, 0, 2]}
        doors={[0, 1]}
        hasTerminal
        keypadProp={{ 0: { code: '1111', id: 'tiled-12-14-keypad-0' } } as any}
        lockedDoors={{ 2: true }}
        hideCeiling={hideCeiling}>
        <Shelf position={[0.62, 0.3, 0.36]} />
        <Sign
          position={[-0.47, 0, 0.39]}
          rotation={[0, -0.9075712110370515, 0]}
        />
        <Shelf position={[-0.61, 0.3, 0.56]} rotation={[0, -0.58, 0]} />
        <Crates position={[0.55, 0, -0.53]} />
        <Barrel position={[0.79, 0, 0.8]} />
        <Barrel position={[0.52, 0, 0.66]} />
        <Barrel position={[0.32, 0, 0.78]} />
        <Graffiti
          text="... --- ..."
          position={[-0.08, 0.64, 0.89]}
          rotation={[
            3.141592653589793, 7.632783294297952e-17, 3.141592653589793,
          ]}
          scale={[0.53, 0.52, 1]}
        />
        {/* <CornerBoulder
                  position={[-0.62, 0, -0.64]}
                  rotation={[
                    -1.6320386899589952e-16, 0.8901179185171124, 1.825988625068656e-16,
                  ]}
                  scale={[2.08, 1.25, 1.66]}
                /> */}
        <DrippingPipe
          position={[0, 0.69, 0.91]}
          rotation={[0, Math.PI, 0]}
          dropDistance={0.5}
          morseCode=".--."
        />
      </BaseRoom>

      {/* room 3 */}
      <BaseRoom
        roomId="tiled-12-13"
        roomName="3"
        position={[0, 0, 3]}
        doors={[0, 1, 2, 3]}
        hasTerminal
        keypadProp={{ 0: { code: '1111', id: 'tiled-12-13-keypad-0' } } as any}
        lockedDoors={{}}
        hideCeiling={hideCeiling}>
        <Shelf position={[0.62, 0.3, 0.36]} />
        <Sign
          position={[-0.47, 0, 0.39]}
          rotation={[0, -0.9075712110370515, 0]}
        />
        <Shelf position={[-0.61, 0.3, 0.56]} rotation={[0, -0.58, 0]} />
        <Crates position={[0.55, 0, -0.53]} />
        <Barrel position={[0.79, 0, 0.8]} />
        <Barrel position={[0.52, 0, 0.66]} />
        <Barrel position={[0.32, 0, 0.78]} />

        <CornerBoulder
          position={[-0.62, 0, -0.64]}
          rotation={[
            -1.6320386899589952e-16, 0.8901179185171124, 1.825988625068656e-16,
          ]}
          scale={[1.02, 0.96, 0.97]}
        />
      </BaseRoom>

      {/* room 5 - dead-end west */}
      <BaseRoom
        roomId="tiled-13-13"
        roomName="5"
        position={[1, 0, 3]}
        doors={[3]}
        hasTerminal={false}
        lockedDoors={{}}
        hideCeiling={hideCeiling}>
        <Shelf position={[0.62, 0.3, 0.36]} />
        <Sign
          position={[-0.47, 0, 0.39]}
          rotation={[0, -0.9075712110370515, 0]}
        />
        <Shelf position={[-0.61, 0.3, 0.56]} rotation={[0, -0.58, 0]} />
        <Crates position={[0.55, 0, -0.53]} />
        <Barrel position={[0.79, 0, 0.8]} />
        <Barrel position={[0.52, 0, 0.66]} />
        <Barrel position={[0.32, 0, 0.78]} />

        <CornerBoulder
          position={[-0.62, 0, -0.64]}
          rotation={[
            -1.6320386899589952e-16, 0.8901179185171124, 1.825988625068656e-16,
          ]}
          scale={[1.02, 0.96, 0.97]}
        />
      </BaseRoom>

      {/* room 4 - dead-end east */}
      <BaseRoom
        roomId="tiled-11-13"
        roomName="4"
        position={[-1, 0, 3]}
        doors={[2]}
        hasTerminal={false}
        lockedDoors={{}}
        hideCeiling={hideCeiling}>
        <Shelf position={[0.62, 0.3, 0.36]} />
        <Sign
          position={[-0.47, 0, 0.39]}
          rotation={[0, -0.9075712110370515, 0]}
        />
        <Table position={[-0.48, 0, -0.56]} />
        <Chair position={[-0.79, 0, -1.01]} />

        <Sign position={[-0.55, 0, -0.25]} />
        <Cart position={[0.6, 0, -0.31]} rotation={[3.14, -0.23, 3.14]} />
        <Bed position={[-0.65, 0.1, 0.67]} rotation={[0, Math.PI / 2, 0]} />
        <Crates
          position={[0.53, 0, 0.48]}
          rotation={[0, 1.553343034274955, 0]}
        />
      </BaseRoom>

      {/* exit */}
      <BaseRoom
        roomId="tiled-12-12"
        roomName="exit"
        position={[0, 0, 4]}
        doors={[0, 1]}
        hasTerminal={false}
        exitDoor={0}
        lockedDoors={{}}
        hideCeiling={hideCeiling}>
        {/* <Shelf position={[0.62, 0.3, 0.36]} />
        <Sign
          position={[-0.47, 0, 0.39]}
          rotation={[0, -0.9075712110370515, 0]}
        />
        <Shelf position={[-0.61, 0.3, 0.56]} rotation={[0, -0.58, 0]} />
        <Crates position={[0.55, 0, -0.53]} />
        <Barrel position={[0.79, 0, 0.8]} />
        <Barrel position={[0.52, 0, 0.66]} />
        <Barrel position={[0.32, 0, 0.78]} /> */}

        <CornerBoulder
          position={[-0.62, 0, -0.64]}
          rotation={[
            -1.6320386899589952e-16, 0.8901179185171124, 1.825988625068656e-16,
          ]}
          scale={[1.02, 0.96, 0.97]}
        />
      </BaseRoom>
    </>
  )
}
