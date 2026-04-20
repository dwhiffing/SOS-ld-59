import { useWorld } from 'koota/react'
import { useEffect, useRef } from 'react'
import { type Object3D } from 'three'
import { Mesh, PhysicsBody } from '../../shared/traits'
import { Controllable, NearestItem } from './traits'
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { isTouchDevice, mobileCam } from './system'

export function Controller({
  position = [0, 0, 0],
}: {
  position?: [x: number, y: number, z: number]
}) {
  const world = useWorld()
  const bodyRef = useRef<any>(null)
  const perspCamRef = useRef<any>(null)
  const ref = useRef<Object3D>(null)
  const [x, y, z] = position

  useEffect(() => {
    if (!ref.current) return

    const entity = world.spawn(
      Controllable,
      Mesh(ref.current ?? undefined),
      PhysicsBody({ api: bodyRef }),
    )

    if (!world.has(NearestItem)) world.add(NearestItem())

    return () => void entity.destroy()
  }, [world, x, y, z])

  useFrame(() => {
    if (!isTouchDevice || !perspCamRef.current) return
    perspCamRef.current.rotation.order = 'YXZ'
    perspCamRef.current.rotation.y = mobileCam.yaw
    perspCamRef.current.rotation.x = mobileCam.pitch
  })

  return (
    <group ref={ref}>
      <RigidBody
        colliders={false}
        lockRotations
        ref={bodyRef}
        type="dynamic"
        position={position}
        mass={1}>
        <CapsuleCollider args={[0.1, 0.125]} />
        <PerspectiveCamera
          ref={perspCamRef}
          makeDefault
          name="playerCamera"
          fov={isTouchDevice ? 90 : 75}
          position={[0, 0.18, 0]}
          zoom={1.6}
          rotation={[0, -Math.PI, 0]}
        />
        {!isTouchDevice && (
          <PointerLockControls enabled camera={perspCamRef.current} />
        )}
      </RigidBody>
    </group>
  )
}
