import { useFrame } from '@react-three/fiber'
import { useWorld } from 'koota/react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { type Group, type Object3D } from 'three'
import { enqueueMountCallback } from '../entities/mountScheduler'
import { Mesh, PhysicsBody } from '../shared/traits'
import { RigidBody } from '@react-three/rapier'
import Door from './door'
import { Plane } from '../components/Plane'

export const doorW = 0.3
export const doorH = 0.57
export const roomHeight = 1

type KeypadInfo = { code: string; id: string }

// Rotation to face into the room for each door direction (0=north,1=south,2=east,3=west)
const DOOR_KEYPAD_ROTATIONS: Record<number, [number, number, number]> = {
  0: [0, Math.PI, 0],
  1: [0, 0, 0],
  2: [0, -Math.PI / 2, 0],
  3: [0, Math.PI / 2, 0],
}
const DOOR_KEYPAD_POSITIONS: Record<number, [number, number, number]> = {
  0: [-0.2, 0, -0.05],
  1: [0.2, 0, 0.05],
  2: [-0.05, 0, 0.2],
  3: [0.05, 0, 0.2],
}

export function Room(props: {
  scale?: [number, number, number]
  doors?: [number?, number?, number?, number?]
  position?: [number, number, number]
  roomId?: string
  children?: React.ReactNode
  keypads?: Partial<Record<0 | 1 | 2 | 3, KeypadInfo>>
  hideCeiling?: boolean
  exitDoor?: number
  lockedDoors?: Partial<Record<0 | 1 | 2 | 3, boolean>>
  visibleRef?: RefObject<boolean>
}) {
  const world = useWorld()
  const ref = useRef<Object3D>(null)
  const bodyRef = useRef<any>(null)
  const wallsRef = useRef<Group>(null)

  useFrame(() => {
    if (props.visibleRef && wallsRef.current) {
      wallsRef.current.visible = props.visibleRef.current
    }
  })

  useEffect(() => {
    const entity = world.spawn(
      Mesh(ref.current ?? undefined),
      PhysicsBody({ api: bodyRef }),
    )

    return () => {
      entity.destroy()
    }
  }, [world])

  const [roomWidth, _, roomDepth] = props.scale ?? [2, 1, 2]
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

  const northZ = halfDepth - halfThick
  const southZ = -halfDepth + halfThick
  const eastX = halfWidth - halfThick
  const westX = -halfWidth + halfThick
  const roomId = props.roomId || `room-${position.join('-')}`
  const hasDoor = {
    north: !!props.doors?.includes(0),
    south: !!props.doors?.includes(1),
    east: !!props.doors?.includes(2),
    west: !!props.doors?.includes(3),
  }
  const makeKeypad = (dir: 0 | 1 | 2 | 3) => {
    const kp = props.keypads?.[dir]
    return kp
      ? {
          ...kp,
          position: DOOR_KEYPAD_POSITIONS[dir],
          rotation: DOOR_KEYPAD_ROTATIONS[dir],
        }
      : undefined
  }

  const parts = useMemo(() => {
    const items: React.ReactNode[] = []
    items.push(
      <Plane
        key="floor"
        colliderArgs={[halfWidth, halfThick, halfDepth]}
        meshArgs={[roomWidth, thick, roomDepth]}
        position={[0, -halfThick, 0]}
        texturePath="floor"
        textureScale={1}
      />,
    )
    if (!props.hideCeiling)
      items.push(
        <Plane
          key="ceiling"
          colliderArgs={[halfWidth, halfThick, halfDepth]}
          meshArgs={[roomWidth, thick, roomDepth]}
          position={[0, roomHeight + halfThick, 0]}
          texturePath="floor"
          textureScale={0.35}
        />,
      )
    items.push(
      <Plane
        key="north"
        colliderArgs={[halfWidth, halfHeight, thick / 2]}
        meshArgs={[roomWidth, roomHeight, thick]}
        position={[0, halfHeight, northZ]}
        texturePath="wall"
        textureScale={2}
        isDoor={hasDoor.north}
        orientation="horizontal"
      />,
      <Plane
        key="south"
        colliderArgs={[halfWidth, halfHeight, thick / 2]}
        meshArgs={[roomWidth, roomHeight, thick]}
        position={[0, halfHeight, southZ]}
        texturePath="wall"
        textureScale={2}
        isDoor={hasDoor.south}
        orientation="horizontal"
      />,
      <Plane
        key="east"
        colliderArgs={[thick / 2, halfHeight, halfDepth]}
        meshArgs={[thick, roomHeight, roomDepth]}
        position={[eastX, halfHeight, 0]}
        texturePath="wall"
        textureScale={2}
        isDoor={hasDoor.east}
        orientation="vertical"
      />,
      <Plane
        key="west"
        colliderArgs={[thick / 2, halfHeight, halfDepth]}
        meshArgs={[thick, roomHeight, roomDepth]}
        position={[westX, halfHeight, 0]}
        texturePath="wall"
        textureScale={2}
        isDoor={hasDoor.west}
        orientation="vertical"
      />,
    )
    if (hasDoor.north)
      items.push(
        <Door
          key="door-north"
          position={[0, doorH / 2, northZ]}
          orientation="horizontal"
          doorId={`${roomId}-north`}
          keypad={makeKeypad(0)}
          isExit={props.exitDoor === 0}
          locked={props.lockedDoors?.[0]}
        />,
      )
    if (hasDoor.south)
      items.push(
        <Door
          key="door-south"
          position={[0, doorH / 2, southZ]}
          orientation="horizontal"
          doorId={`${roomId}-south`}
          keypad={makeKeypad(1)}
          isExit={props.exitDoor === 1}
          locked={props.lockedDoors?.[1]}
        />,
      )
    if (hasDoor.east)
      items.push(
        <Door
          key="door-east"
          position={[eastX, doorH / 2, 0]}
          orientation="vertical"
          doorId={`${roomId}-east`}
          keypad={makeKeypad(2)}
          isExit={props.exitDoor === 2}
          locked={props.lockedDoors?.[2]}
        />,
      )
    if (hasDoor.west)
      items.push(
        <Door
          key="door-west"
          position={[westX, doorH / 2, 0]}
          orientation="vertical"
          doorId={`${roomId}-west`}
          keypad={makeKeypad(3)}
          isExit={props.exitDoor === 3}
          locked={props.lockedDoors?.[3]}
        />,
      )
    return items
  }, [])

  const [mountedCount, setMountedCount] = useState(0)
  // const [mountedCount, setMountedCount] = useState(1000)

  useEffect(() => {
    const cleanups = Array.from({ length: parts.length }, () =>
      enqueueMountCallback(() => setMountedCount((c) => c + 1)),
    )
    return () => cleanups.forEach((c) => c())
  }, [])

  return (
    <RigidBody ref={bodyRef} type="fixed" colliders={false} position={position}>
      <group ref={ref} position={position}>
        <group
          ref={wallsRef}
          visible={props.visibleRef ? props.visibleRef.current : true}>
          {parts.slice(0, mountedCount)}
        </group>
        {props.children}
      </group>
    </RigidBody>
  )
}
