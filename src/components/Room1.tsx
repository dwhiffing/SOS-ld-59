import Shelf from '../entities/decals/shelf'
import Crates from '../entities/decals/crates'
import { Barrel } from '../entities/decals/barrel'
import { Sign } from '../entities/decals/sign'
import { BaseRoom, RoomProps } from './BaseRoom'

export function Room1(props: RoomProps) {
  return (
    <BaseRoom {...props}>
      <Shelf position={[0.62, 0.3, 0.36]} />
      <Sign position={[-0.47, 0, 0.39]} rotation={[0, -0.9075712110370515, 0]} />
      <Shelf position={[-0.61, 0.3, 0.56]} rotation={[0, -0.58, 0]} />
      <Crates position={[0.55, 0, -0.53]} />
      <Barrel position={[0.79, 0, 0.8]} />
      <Barrel position={[0.52, 0, 0.66]} /><Barrel position={[-0.55, 0, -0.77]} /><Barrel position={[-0.72, 0, -0.56]} />
      <Barrel position={[0.32, 0, 0.78]} />
    </BaseRoom>
  )
}
