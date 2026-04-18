import { useWorld } from 'koota/react'
import { useEffect, useRef } from 'react'
import { type Object3D } from 'three'
import { Mesh, PhysicsBody } from '../shared/traits'
import { RigidBody } from '@react-three/rapier'
import Door from './door'
import { Plane } from '../components/Plane'

export const doorW = 0.3
export const doorH = 0.57
export const roomHeight = 1

export function Room(props: {
  scale: [number, number, number]
  doors?: [number?, number?, number?, number?]
  position?: [number, number, number]
  roomId?: string
  children?: React.ReactNode
}) {
  const world = useWorld()
  const ref = useRef<Object3D>(null)
  const bodyRef = useRef<any>(null)

  useEffect(() => {
    const entity = world.spawn(
      Mesh(ref.current ?? undefined),
      PhysicsBody({ api: bodyRef }),
    )

    return () => {
      entity.destroy()
    }
  }, [world])

  const [roomWidth, _, roomDepth] = props.scale
  const thick = 0.1
  const halfWidth = roomWidth / 2
  const halfDepth = roomDepth / 2
  const halfHeight = roomHeight / 2
  const halfThick = thick / 2
  const position = (props.position ?? [0, 0, 0]).map((n) => +n.toFixed(1)) as [
    number,
    number,
    number,
  ]

  return (
    <RigidBody ref={bodyRef} type="fixed" colliders={false} position={position}>
      <group ref={ref} position={position}>
        {/* Floor */}
        <Plane
          colliderArgs={[halfWidth, halfThick, halfDepth]}
          meshArgs={[roomWidth, thick, roomDepth]}
          position={[0, -halfThick, 0]}
          texturePath="floor"
          textureScale={1}
        />

        {/* Ceiling (hidden in topdown camera mode) */}
        {/* {cameraMode?.value !== 'topdown' && (
          <Plane
            colliderArgs={[halfWidth, halfThick, halfDepth]}
            meshArgs={[roomWidth, thick, roomDepth]}
            position={[0, roomHeight + halfThick, 0]}
            texturePath="floor"
            textureScale={1}
          />
        )} */}

        {/* Walls with optional centered doorways (controlled by props.doors) */}
        {(() => {
          // Doorway scale (reasonable defaults). Will clamp to room dimensions.

          const doors = {
            north: props.doors?.includes(0),
            south: props.doors?.includes(1),
            east: props.doors?.includes(2),
            west: props.doors?.includes(3),
          }

          // North (+Z) and South (-Z)
          const northZ = halfDepth - halfThick
          const southZ = -halfDepth + halfThick
          const eastX = halfWidth - halfThick
          const westX = -halfWidth + halfThick

          const parts: any[] = []

          // North wall (split handled by Plane when isDoor=true)
          parts.push(
            <Plane
              key={`north`}
              colliderArgs={[halfWidth, halfHeight, thick / 2]}
              meshArgs={[roomWidth, roomHeight, thick]}
              position={[0, halfHeight, northZ]}
              texturePath="wall"
              textureScale={2}
              isDoor={doors.north}
              orientation="horizontal"
            />,
          )

          // South wall
          parts.push(
            <Plane
              key={`south`}
              colliderArgs={[halfWidth, halfHeight, thick / 2]}
              meshArgs={[roomWidth, roomHeight, thick]}
              position={[0, halfHeight, southZ]}
              texturePath="wall"
              textureScale={2}
              isDoor={doors.south}
              orientation="horizontal"
            />,
          )

          // East wall
          parts.push(
            <Plane
              key={`east`}
              colliderArgs={[thick / 2, halfHeight, halfDepth]}
              meshArgs={[thick, roomHeight, roomDepth]}
              position={[eastX, halfHeight, 0]}
              texturePath="wall"
              textureScale={2}
              isDoor={doors.east}
              orientation="vertical"
            />,
          )

          // West wall
          parts.push(
            <Plane
              key={`west`}
              colliderArgs={[thick / 2, halfHeight, halfDepth]}
              meshArgs={[thick, roomHeight, roomDepth]}
              position={[westX, halfHeight, 0]}
              texturePath="wall"
              textureScale={2}
              isDoor={doors.west}
              orientation="vertical"
            />,
          )

          const generateDoorId = (roomId: string, direction: string) =>
            `${roomId}-${direction}`

          const roomId = props.roomId || `room-${position.join('-')}`

          if (doors.north)
            parts.push(
              <Door
                key="door-north"
                position={[0, doorH / 2, northZ]}
                orientation="horizontal"
                doorId={generateDoorId(roomId, 'north')}
              />,
            )
          if (doors.south)
            parts.push(
              <Door
                key="door-south"
                position={[0, doorH / 2, southZ]}
                orientation="horizontal"
                doorId={generateDoorId(roomId, 'south')}
              />,
            )
          if (doors.east)
            parts.push(
              <Door
                key="door-east"
                position={[eastX, doorH / 2, 0]}
                orientation="vertical"
                doorId={generateDoorId(roomId, 'east')}
              />,
            )
          if (doors.west)
            parts.push(
              <Door
                key="door-west"
                position={[westX, doorH / 2, 0]}
                orientation="vertical"
                doorId={generateDoorId(roomId, 'west')}
              />,
            )

          return parts
        })()}

        {props.children}
      </group>
    </RigidBody>
  )
}
