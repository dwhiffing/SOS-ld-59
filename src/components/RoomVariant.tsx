import { RoomProps } from './BaseRoom'
import { Room1 } from './Room1'
import { Room2 } from './Room2'

const ROOM_VARIANTS = [Room1, Room2]

export function RoomVariant(props: RoomProps) {
  const Component = ROOM_VARIANTS[props.variant ?? 0] ?? Room1
  return <Component {...props} />
}
