import Bed from '../entities/decals/bed'
import { Sign } from '../entities/decals/sign'
import { Cart } from '../entities/decals/cart'
import Table from '../entities/decals/table'
import Chair from '../entities/decals/chair'
import { BaseRoom, RoomProps } from './BaseRoom'
import Crates from '../entities/decals/crates'

export function Room2(props: RoomProps) {
  return (
    <BaseRoom {...props}>
      <Table position={[-0.48, 0, -0.56]} />
      <Chair position={[-0.79, 0, -1.01]} />

      <Sign position={[-0.55, 0, -0.25]} />
      <Cart position={[0.6, 0, -0.31]} rotation={[3.14, -0.23, 3.14]} />
      <Bed position={[-0.65, 0.1, 0.67]} rotation={[0, Math.PI / 2, 0]} />
      <Crates position={[0.53, 0, 0.48]} rotation={[0, 1.553343034274955, 0]} />
    </BaseRoom>
  )
}
