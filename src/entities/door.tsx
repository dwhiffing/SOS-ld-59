import { useRef, useEffect, useState } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { doorH, doorW } from './room'
import { useGameStore } from '../stores/gameStore'
import { AnimatedOutlines } from '../components/AnimatedOutlines'
import { useTraitEffect, useWorld } from 'koota/react'
import { NearestItem } from './controller/traits'
import { animated, useSpring } from '@react-spring/three'
import { useGLTF } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'
import Keypad from './keypad'

interface DoorProps {
  position: [number, number, number]
  orientation: 'horizontal' | 'vertical'
  thickness?: number
  color?: string
  doorId: string
  keypad?: { code: string; id: string; rotation: [number, number, number] }
}

export const Door: React.FC<DoorProps> = ({
  position,
  orientation,
  thickness = 0.02,
  doorId,
  keypad,
}) => {
  const ref = useRef(null)
  const world = useWorld()
  const [isOutlined, setIsOutlined] = useState(false)
  useTraitEffect(world, NearestItem, (nearest) => {
    setIsOutlined(nearest?.mesh === ref.current)
  })

  const isOpen = useGameStore((s) => s.isDoorOpen(doorId ?? ''))
  const isLocked = useGameStore((s) => s.lockedDoors[doorId ?? ''])
  const { nodes, materials } = useGLTF('/door.glb')

  const args: [number, number, number] =
    orientation === 'horizontal'
      ? [doorW, doorH, thickness]
      : [thickness, doorH, doorW]

  const _args: [number, number, number] = [
    args[0] * 0.95,
    args[1] * 0.95,
    args[2] * 0.95,
  ]

  const spring = useSpring({
    position: isOpen ? [0, doorH, 0] : [0, 0, 0],
    config: { tension: 170, friction: 26 },
  })

  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => useGameStore.getState().closeDoor(doorId), 3000)
  }, [isOpen, doorId])

  const original = materials['02_-_Default']
  const mat = original.clone() as MeshStandardMaterial
  mat.color.multiplyScalar(0.15)
  mat.metalness = 0
  mat.roughness = 1

  return (
    <RigidBody type="fixed" colliders={false}>
      <group position={position}>
        {!isOpen && <CuboidCollider args={_args} scale={0.5} />}
        <mesh
          name={!isOpen ? 'door' : ''}
          userData={{ doorId }}
          visible={false}
          ref={ref}>
          <boxGeometry args={_args} />
        </mesh>

        {keypad && (
          <Keypad
            keypadId={keypad.id}
            code={keypad.code}
            doorId={doorId}
            position={[0.2, 0, -0.05]}
            rotation={keypad.rotation}
          />
        )}

        <animated.group position={spring.position as unknown as any}>
          <mesh
            // castShadow
            // receiveShadow
            // @ts-ignore
            geometry={nodes['Line001_02_-_Default_0'].geometry}
            material={mat}
            position={[0, -0.14, 0]}
            scale={[0.004, 0.004, 0.004]}
            rotation={(() => {
              const id = doorId ?? ''
              let y = 0
              if (id.includes('east')) {
                y = orientation === 'vertical' ? -Math.PI / 2 : 0
              } else if (id.includes('west')) {
                y = orientation === 'vertical' ? Math.PI / 2 : 0
              } else if (id.includes('south')) {
                y = 0
              } else {
                y = Math.PI
              }

              return [0, y, 0]
            })()}>
            <AnimatedOutlines
              color={isLocked ? 'red' : 'white'}
              opacity={isOutlined ? 1 : 0}
            />
          </mesh>
        </animated.group>
      </group>
    </RigidBody>
  )
}

Door.displayName = 'Door'
export default Door
