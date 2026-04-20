import { useFrame } from '@react-three/fiber'
import React, { useEffect, useRef, useState } from 'react'
import { type Group } from 'three'
import { playerPos } from '../entities/controller/system'
import FlickerLight from '../entities/flickerLight'
import { enqueueMountCallback } from '../entities/mountScheduler'
import { Room } from '../entities/room'
import { Terminal } from '../entities/terminal'

export type RoomProps = {
  roomId: string
  roomName?: string
  hasTerminal?: boolean
  position?: [number, number, number]
  roomSize?: number
  keypadProp?: { [key: string]: string | number }
  doors?: [number?, number?, number?, number?]
  children?: React.ReactNode
  hideCeiling?: boolean
  exitDoor?: number
  lockedDoors?: Partial<Record<0 | 1 | 2 | 3, boolean>>
  graffiti?: Partial<Record<0 | 1 | 2 | 3, string>>
}

const VISIBILITY_THRESHOLD = 2.0
function checkNear(position: [number, number, number]) {
  const dx = playerPos.x - position[0] * 2
  const dz = playerPos.z - position[2] * 2
  return dx * dx + dz * dz < VISIBILITY_THRESHOLD * VISIBILITY_THRESHOLD
}

export function BaseRoom({
  position = [0, 0, 0],
  roomId,
  roomName,
  hasTerminal = false,
  roomSize = 2,
  keypadProp,
  doors,
  children,
  hideCeiling,
  exitDoor,
  lockedDoors,
}: RoomProps) {
  const groupRef = useRef<Group>(null)
  const isNearRef = useRef(checkNear(position))
  const [mountedCount, setMountedCount] = useState(0)

  // Snapshot children array once at mount — Room1/Room2 children are always stable
  const childArrayRef = useRef(React.Children.toArray(children))

  // Fixed items before the children: FlickerLight, optional Terminal
  const fixedCount = 1 + (hasTerminal ? 1 : 0)
  const totalItems = fixedCount + childArrayRef.current.length

  useEffect(() => {
    // Enqueue one callback per item — scheduler processes one per frame
    const cleanups = Array.from({ length: totalItems }, () =>
      enqueueMountCallback(() => setMountedCount((c) => c + 1)),
    )
    return () => cleanups.forEach((c) => c())
  }, [])

  useFrame(() => {
    const next = checkNear(position)
    if (next !== isNearRef.current) {
      isNearRef.current = next
      if (groupRef.current) groupRef.current.visible = next
    }
  })

  return (
    <Room
      scale={[roomSize, 1, roomSize]}
      position={position}
      doors={doors as [number?, number?, number?, number?]}
      roomId={roomId}
      keypads={
        keypadProp
          ? Object.fromEntries(
              Object.entries(keypadProp).map(([dir, code]) => [
                dir,
                { code: String(code), id: `${roomId}-keypad-${dir}` },
              ]),
            )
          : undefined
      }
      hideCeiling={hideCeiling}
      exitDoor={exitDoor}
      lockedDoors={lockedDoors}
      visibleRef={isNearRef}>
      <group ref={groupRef} visible={isNearRef.current}>
        {mountedCount >= 1 && (
          <FlickerLight
            position={[0, 0, 0]}
            intensity={20.0}
            defaultOn
            // morseCode="...---"
          />
        )}
        {mountedCount >= 2 && hasTerminal && (
          <Terminal roomId={roomId} roomName={roomName} />
        )}
        {childArrayRef.current.slice(0, mountedCount - fixedCount)}
      </group>
    </Room>
  )
}
