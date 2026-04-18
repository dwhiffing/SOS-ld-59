import { type World } from 'koota'
import { Controllable, NearestItem } from './traits'
import { Mesh, PhysicsBody } from '../../shared/traits'
import { Vector3, Quaternion, Raycaster } from 'three'
import useGameStore from '../../stores/gameStore'

let keys = new Set<string>()
let justPressed = new Set<string>()
let initialized = false
let _lastCamAngle: Quaternion = new Quaternion(0, 0, 0, 0)

function initKeyboardListeners() {
  if (initialized) return
  initialized = true

  if (typeof window === 'undefined') return

  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase())
    justPressed.add(e.key.toLowerCase())
  })

  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase())
  })
}

/**
 * System that reads WASD (and arrow keys) and sets Velocity for controllable entities.
 */
export const controllerInputSystem = (world: World, _delta: number) => {
  initKeyboardListeners()

  const entities = world.query(Controllable)

  const forwardKey = keys.has('w') || keys.has('arrowup') ? 1 : 0
  const backKey = keys.has('s') || keys.has('arrowdown') ? 1 : 0
  const leftKey = keys.has('a') || keys.has('arrowleft') ? 1 : 0
  const rightKey = keys.has('d') || keys.has('arrowright') ? 1 : 0

  for (const entity of entities) {
    const mesh = entity.get(Mesh) as any
    const cam = mesh.getObjectByName?.('playerCamera', true)
    const playerPos = new Vector3()
    cam?.getWorldPosition(playerPos)

    if (justPressed.has(' ')) {
      const nearest = world.get(NearestItem) as any
      const gs = useGameStore.getState()

      const nearestName = nearest?.mesh?.name ?? ''

      if (nearestName === 'key') {
        nearest.mesh.parent.position.set(-99, -99, -99)
        world.set(NearestItem, { entity: null, mesh: null })
        gs.addKey()
      } else if (nearestName === 'door') {
        const id = nearest?.mesh?.userData?.doorId
        if (!id) break

        const openSingleDoor = (doorId: string) => {
          if (gs.keyCount > 0) {
            gs.unlockDoor(doorId)
            gs.removeKey()
          }
          useGameStore.getState().openDoor(doorId)
        }

        openSingleDoor(id)

        const dPos = new Vector3()
        nearest?.mesh.getWorldPosition?.(dPos)
        const door = world.entities
          .flatMap((e) => e.get(Mesh)?.getObjectsByProperty?.('name', 'door'))
          .filter(
            (d) => d && d.userData.doorId !== nearest?.mesh.userData.doorId,
          )
          .sort((a, b) => {
            const aPos = new Vector3()
            a?.getWorldPosition?.(aPos)
            const bPos = new Vector3()
            b?.getWorldPosition?.(bPos)
            return aPos.distanceTo(dPos) - bPos.distanceTo(dPos)
          })[0]

        if (door) openSingleDoor(door.userData.doorId)
      }
    }

    let speed = 1

    let forwardVec: Vector3
    let rightVec: Vector3

    const quat1 = new Quaternion()
    mesh.getObjectByProperty?.()
    cam?.getWorldQuaternion?.(quat1)

    forwardVec = new Vector3(0, 0, -1).applyQuaternion(quat1)
    rightVec = new Vector3().copy(forwardVec).cross(new Vector3(0, 1, 0))

    const move = new Vector3()
      .addScaledVector(forwardVec, forwardKey - backKey)
      .addScaledVector(rightVec, rightKey - leftKey)
    if (move.lengthSq() > 0) move.normalize()
    move.multiplyScalar(speed)

    const phys = entity.get(PhysicsBody)?.api as any
    phys.current.setLinvel({ x: move.x, y: 0, z: move.z }, true)

    const quat = new Quaternion()
    cam.getWorldQuaternion?.(quat)
    let angle = 0

    const dot = Math.abs(_lastCamAngle.dot(quat))
    const clamped = Math.max(-1, Math.min(1, dot))
    angle = Math.acos(clamped)
    _lastCamAngle = quat
    if (angle > 0.0005 || move.lengthSq() > 0) {
      computeAndSetNearest(world, cam)
    }
  }

  justPressed = new Set([])
}

export default controllerInputSystem

const computeAndSetNearest = (world: World, camera: any) => {
  let best: { entity: any; mesh: any; distance: number } | null = null
  const raycaster = getRaycaster(camera)
  const maxDist = Math.sqrt(0.5)

  const names = ['terminal', 'key', 'door']

  for (const e of world.entities) {
    const mesh = e.get(Mesh) as any
    if (!mesh) continue

    for (const name of names) {
      const objs = mesh.getObjectsByProperty?.('name', name)
      for (const obj of objs) {
        if (!obj) continue
        const intersects = raycaster.intersectObject(obj, true)
        if (intersects.length > 0) {
          const dist = intersects[0].distance
          if (dist < maxDist && (best === null || dist < best.distance)) {
            best = { entity: e, mesh: obj, distance: dist }
          }
        }
      }
    }
  }

  const current = world.get(NearestItem)
  const newNearest = best
    ? { entity: best.entity, mesh: best.mesh }
    : { entity: null, mesh: null }

  const changed =
    current?.entity !== newNearest.entity || current?.mesh !== newNearest.mesh

  if (changed) world.set(NearestItem, newNearest)
}

const getRaycaster = (cam: any) => {
  const origin = new Vector3()
  cam?.getWorldPosition?.(origin)
  const dir = new Vector3()
  cam?.getWorldDirection?.(dir)

  const ray = new Raycaster(origin, dir)
  return ray
}
