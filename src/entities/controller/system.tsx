import { type World } from 'koota'
import { Quaternion, Raycaster, Vector3 } from 'three'
import { BITMAP_WIDTH, MORSE_DURATION } from '../../constants'
import { Mesh, PhysicsBody } from '../../shared/traits'
import useGameStore from '../../stores/gameStore'
import { HELLO_SIGNAL, morse, RESPONSE_PAUSE_MS } from '../morseRecorder'
import { Controllable, NearestItem } from './traits'

let keys = new Set<string>()
let justPressed = new Set<string>()
let initialized = false
let _lastCamAngle: Quaternion = new Quaternion(0, 0, 0, 0)
const AUTO_SUBMIT_MS = 1500
const FF_SPEED = 10

function initKeyboardListeners() {
  if (initialized) return
  initialized = true

  if (typeof window === 'undefined') return

  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase())
    if (!e.repeat) justPressed.add(e.key.toLowerCase())
  })

  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase())
  })
}

export const controllerInputSystem = (world: World, _delta: number) => {
  initKeyboardListeners()

  const now = performance.now()

  updateMorseState(now)

  if (justPressed.has(' ') && morse.phase !== 'responding') {
    const nearest = world.get(NearestItem) as any
    const nearestName = nearest?.mesh?.name ?? ''
    if (nearestName === 'keypad-btn') {
      useKeypad(nearest)
    } else if (nearestName === 'terminal') {
      startRecording(now)
    } else if (nearestName === 'door') {
      useDoor(world, nearest)
    }
  }

  moveEntities(world)

  justPressed = new Set([])
}

export default controllerInputSystem

// --- Morse state machine ---

function playheadAt(start: number, now: number, speed = 1) {
  return Math.min(
    Math.floor(((speed * (now - start)) / MORSE_DURATION) * BITMAP_WIDTH),
    BITMAP_WIDTH,
  )
}

function updateMorseState(now: number) {
  if (morse.phase === 'recording') {
    if (justPressed.has('r')) {
      cancelRecording()
    } else {
      advanceRecording(now)
    }
  } else if (morse.phase === 'done') {
    if (now - morse.doneTime >= RESPONSE_PAUSE_MS) {
      startResponse(now)
    }
  } else if (morse.phase === 'responding') {
    if (justPressed.has('r')) {
      cancelRecording()
    } else {
      advanceResponse(now)
    }
  }
}

function startRecording(now: number) {
  if (morse.phase === 'recording') return
  morse.phase = 'recording'
  morse.signal = new Uint8Array(BITMAP_WIDTH)
  morse.playhead = 0
  morse.startTime = now
  morse.lastInputTime = now
  morse.ffStart = 0
}

function cancelRecording() {
  morse.phase = 'idle'
  morse.keyHeld = false
  morse.signal = new Uint8Array(BITMAP_WIDTH)
  morse.playhead = 0
  morse.startTime = 0
  morse.ffStart = 0
}

function startResponse(now: number) {
  morse.phase = 'responding'
  morse.signal = HELLO_SIGNAL
  morse.playhead = 0
  morse.startTime = now
  morse.ffStart = 0
}

function advanceRecording(now: number) {
  const isHigh = keys.has(' ')
  morse.keyHeld = isHigh
  if (isHigh) morse.lastInputTime = now

  const silent = !morse.ffStart && now - morse.lastInputTime >= AUTO_SUBMIT_MS
  if (silent) {
    morse.ffStart = now
    morse.ffBase = morse.playhead
  }

  const newPlayhead = morse.ffStart
    ? Math.min(
        morse.ffBase +
          Math.floor(
            FF_SPEED * ((now - morse.ffStart) / MORSE_DURATION) * BITMAP_WIDTH,
          ),
        BITMAP_WIDTH,
      )
    : playheadAt(morse.startTime, now)

  for (let x = morse.playhead; x < newPlayhead; x++) {
    morse.signal[x] = isHigh ? 1 : 0
  }
  morse.playhead = newPlayhead
  if (newPlayhead >= BITMAP_WIDTH) {
    morse.phase = 'done'
    morse.doneTime = now
  }
}

function advanceResponse(now: number) {
  const newPlayhead = playheadAt(morse.startTime, now, 2)

  if (newPlayhead !== morse.playhead) morse.playhead = newPlayhead
  if (newPlayhead >= BITMAP_WIDTH) {
    morse.phase = 'responded'
  }
}

function useKeypad(nearest: any) {
  const id = nearest?.mesh?.userData?.keypadId
  const digit = nearest?.mesh?.userData?.digit
  if (!id || !digit) return
  useGameStore.getState().submitKeypadDigit(id, digit)
}

function useDoor(world: World, nearest: any) {
  const id = nearest?.mesh?.userData?.doorId
  if (!id) return

  useGameStore.getState().openDoor(id)

  const dPos = new Vector3()
  nearest?.mesh.getWorldPosition?.(dPos)
  const door = world.entities
    .flatMap((e) => e.get(Mesh)?.getObjectsByProperty?.('name', 'door'))
    .filter((d) => d && d.userData.doorId !== nearest?.mesh.userData.doorId)
    .sort((a, b) => {
      const aPos = new Vector3()
      a?.getWorldPosition?.(aPos)
      const bPos = new Vector3()
      b?.getWorldPosition?.(bPos)
      return aPos.distanceTo(dPos) - bPos.distanceTo(dPos)
    })[0]

  if (door) useGameStore.getState().openDoor(door.userData.doorId, true)
}

function moveEntities(world: World) {
  const forwardKey = keys.has('w') || keys.has('arrowup') ? 1 : 0
  const backKey = keys.has('s') || keys.has('arrowdown') ? 1 : 0
  const leftKey = keys.has('a') || keys.has('arrowleft') ? 1 : 0
  const rightKey = keys.has('d') || keys.has('arrowright') ? 1 : 0

  for (const entity of world.query(Controllable)) {
    const mesh = entity.get(Mesh) as any
    const cam = mesh.getObjectByName?.('playerCamera', true)

    const quat = new Quaternion()
    cam?.getWorldQuaternion?.(quat)

    const forwardVec = new Vector3(0, 0, -1).applyQuaternion(quat)
    const rightVec = new Vector3().copy(forwardVec).cross(new Vector3(0, 1, 0))

    const move = new Vector3()
      .addScaledVector(forwardVec, forwardKey - backKey)
      .addScaledVector(rightVec, rightKey - leftKey)
    if (move.lengthSq() > 0) move.normalize()

    const phys = entity.get(PhysicsBody)?.api as any
    const speed = 1.1
    phys.current.setLinvel({ x: move.x * speed, y: 0, z: move.z * speed }, true)

    const dot = Math.abs(_lastCamAngle.dot(quat))
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)))
    _lastCamAngle = quat
    if (angle > 0.0005 || move.lengthSq() > 0) {
      computeAndSetNearest(world, cam)
    }
  }
}

const computeAndSetNearest = (world: World, camera: any) => {
  let best: { entity: any; mesh: any; distance: number } | null = null
  const raycaster = getRaycaster(camera)
  const maxDist = Math.sqrt(0.5)

  for (const e of world.entities) {
    const mesh = e.get(Mesh) as any
    if (!mesh) continue

    for (const name of ['terminal', 'key', 'door', 'keypad-btn']) {
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

  if (
    current?.entity !== newNearest.entity ||
    current?.mesh !== newNearest.mesh
  ) {
    world.set(NearestItem, newNearest)
  }
}

const getRaycaster = (cam: any) => {
  const origin = new Vector3()
  cam?.getWorldPosition?.(origin)
  const dir = new Vector3()
  cam?.getWorldDirection?.(dir)
  return new Raycaster(origin, dir)
}
