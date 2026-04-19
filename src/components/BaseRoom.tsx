import FlickerLight from '../entities/flickerLight'
import { Room } from '../entities/room'
import { Terminal } from '../entities/terminal'

export type RoomProps = {
  roomId: string
  hasTerminal?: boolean
  position?: [number, number, number]
  roomSize?: number
  keypadProp?: { [key: string]: string | number }
  doors?: [number?, number?, number?, number?]
  children?: React.ReactNode
  hideCeiling?: boolean
  variant?: number
  exitDoor?: number
  lockedDoors?: Partial<Record<0 | 1 | 2 | 3, boolean>>
}
export function BaseRoom({
  position,
  roomId,
  hasTerminal = false,
  roomSize = 2,
  keypadProp,
  doors,
  children,
  hideCeiling,
  exitDoor,
  lockedDoors,
}: RoomProps) {
  return (
    <Room
      scale={[roomSize, 1, roomSize]}
      position={position}
      doors={doors as [number?, number?, number?, number?]}
      roomId={roomId}
      keypads={keypadProp as any}
      hideCeiling={hideCeiling}
      exitDoor={exitDoor}
      lockedDoors={lockedDoors}>
      <FlickerLight position={[0, 0, 0]} intensity={20.0} defaultOn />

      {hasTerminal && <Terminal roomId={roomId} />}
      {children}
    </Room>
  )
}
