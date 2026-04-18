import Shelf from '../entities/decals/shelf'
import Bed from '../entities/decals/bed'
import Crates from '../entities/decals/crates'
import { Barrel } from '../entities/decals/barrel'
import { Sign } from '../entities/decals/sign'
import { Cart } from '../entities/decals/cart'
import Table from '../entities/decals/table'
import Chair from '../entities/decals/chair'
import { BaseRoom, RoomProps } from './BaseRoom'

export function Room1(props: RoomProps) {
  return (
    <BaseRoom {...props}>
      <Table position={[-0.48, 0, -0.56]} />
      <Chair position={[-0.79, 0, -1.01]} />

      <Shelf position={[0.6, 0.3, 0.71]} />
      <Crates position={[0.58, 0, -0.72]} />
      <Barrel position={[-0.76, 0, 0.23]} />
      <Barrel position={[-0.56, 0, 0.38]} />
      <Barrel position={[-0.39, 0, 0.48]} />
      <Barrel position={[0.26, 0, -0.51]} />

      <Sign position={[-0.55, 0, -0.25]} />
      <Cart position={[0.6, 0, -0.31]} rotation={[3.14, -0.23, 3.14]} />
      <Bed position={[-0.65, 0.1, 0.67]} rotation={[0, Math.PI / 2, 0]} />
    </BaseRoom>
  )
}
