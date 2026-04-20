import { type World } from 'koota'
import { Quaternion, Raycaster, Vector3 } from 'three'

// Reusable objects to avoid per-frame allocations (GC pressure)
const _quat = new Quaternion()
const _forwardVec = new Vector3()
const _rightVec = new Vector3()
const _moveVec = new Vector3()
const _upVec = new Vector3(0, 1, 0)
const _rayOrigin = new Vector3()
const _rayDir = new Vector3()
const _raycaster = new Raycaster()
const _aPos = new Vector3()
const _bPos = new Vector3()
const _dPos = new Vector3()
import { BITMAP_WIDTH, MORSE_DURATION } from '../../constants'
import { Mesh, PhysicsBody } from '../../shared/traits'
import useGameStore from '../../stores/gameStore'
import { setMusicMuted } from '../ambience'
import { keypadsInError } from '../keypad'
import {
  decodeMorse,
  encodeResponse,
  morse,
  RESPONSE_PAUSE_MS,
} from '../morseRecorder'
import {
  playDoorLockedClick,
  playKeypad,
  playMorseHi,
  playMorseLo,
  resumeAudioContext,
  setSfxMuted,
  startStatic,
  stopStatic,
  tickFootstep,
} from '../sounds'
import { queryTerminal, terminalSearchReady } from '../terminalSearch'
import { Controllable, NearestItem } from './traits'

let keys = new Set<string>()
let justPressed = new Set<string>()
let initialized = false

let _lastCamAngle: Quaternion = new Quaternion()
let _lastKeyHeld = false
let _lastSignalVal = 0
const AUTO_SUBMIT_MS = 2000
const FF_SPEED = 15
export const playerPos = { x: 0, y: 0, z: 0 }

function initKeyboardListeners() {
  if (initialized) return
  initialized = true

  if (typeof window === 'undefined') return

  window.addEventListener('keydown', (e) => {
    resumeAudioContext()
    keys.add(e.key.toLowerCase())
    if (!e.repeat) justPressed.add(e.key.toLowerCase())
  })

  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase())
  })

  window.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return
    resumeAudioContext()
    keys.add(' ')
  })

  window.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return
    keys.delete(' ')
  })

  window.addEventListener('click', (e) => {
    if (e.button !== 0) return
    justPressed.add(' ')
  })
}

export const controllerInputSystem = (world: World, _delta: number) => {
  initKeyboardListeners()

  const now = performance.now()

  if (morse.phase === 'recording') {
    const nearest = world.get(NearestItem) as any
    const nearestRoomId = nearest?.mesh?.userData?.roomId
    if (nearestRoomId !== morse.terminalRoomId) {
      cancelRecording(true)
    }
  }

  updateMorseState(now)

  const isActive = morse.phase === 'recording' || morse.phase === 'responding'
  if (isActive) {
    if (morse.phase === 'responding') startStatic()
    if (morse.phase === 'recording') {
      if (morse.keyHeld && !_lastKeyHeld) playMorseHi()
      else if (!morse.keyHeld && _lastKeyHeld) playMorseLo()
      _lastKeyHeld = morse.keyHeld
    } else {
      const sig = morse.signal[morse.playhead] ?? 0
      if (sig === 1 && _lastSignalVal === 0) playMorseHi(480)
      else if (sig === 0 && _lastSignalVal === 1) playMorseLo()
      _lastSignalVal = sig
    }
  } else {
    stopStatic()
    if (_lastKeyHeld || _lastSignalVal) {
      playMorseLo()
      _lastKeyHeld = false
      _lastSignalVal = 0
    }
  }

  if (justPressed.has('m')) {
    useGameStore.getState().cycleSoundMode()
    const mode = useGameStore.getState().soundMode
    setMusicMuted(mode === 'muteMusic' || mode === 'muteAll')
    setSfxMuted(mode === 'muteAll')
  }

  if (justPressed.has(' ')) {
    const nearest = world.get(NearestItem) as any
    const nearestName = nearest?.mesh?.name ?? ''
    if (nearestName === 'keypad-btn') {
      useKeypad(nearest)
    } else if (nearestName === 'terminal') {
      const newRoomId = nearest.mesh.userData.roomId ?? ''
      const isDifferent = newRoomId !== morse.terminalRoomId
      if (
        morse.phase === 'idle' ||
        (isDifferent && morse.phase !== 'recording')
      ) {
        morse.terminalRoomId = newRoomId
        morse.terminalRoomName = nearest.mesh.userData.roomName ?? newRoomId
        startRecording(now)
      }
    } else if (nearestName === 'door') {
      useDoor(world, nearest)
    }
  }

  moveEntities(world, now)

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
      cancelRecording(true)
    } else {
      advanceRecording(now)
    }
  } else if (morse.phase === 'done') {
    if (now - morse.doneTime >= RESPONSE_PAUSE_MS && morse.responseSignal) {
      startResponse(now)
    }
  } else if (morse.phase === 'responding') {
    if (justPressed.has('r')) {
      morse.pendingSideEffect?.()
      morse.pendingSideEffect = null
      cancelRecording(true)
    } else {
      advanceResponse(now)
    }
  } else if (morse.phase === 'responded') {
    cancelRecording(false)
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
  morse.responseSignal = null
}

function cancelRecording(clearRoom = false) {
  morse.phase = 'idle'
  morse.keyHeld = false
  morse.signal = new Uint8Array(BITMAP_WIDTH)
  morse.playhead = 0
  morse.startTime = 0
  morse.ffStart = 0
  if (clearRoom) morse.terminalRoomId = ''
}

function startResponse(now: number) {
  morse.phase = 'responding'
  morse.signal = morse.responseSignal!
  morse.responseSignal = null
  morse.playhead = 0
  morse.startTime = now
  morse.ffStart = 0
  morse.ffBase = 0
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
    resolveResponse(morse.signal, morse.terminalRoomName, morse.terminalRoomId)
  }
}

async function resolveResponse(
  signal: Uint8Array,
  roomName: string,
  roomId: string,
) {
  const letters = decodeMorse(signal, signal.length)
  const query = letters.map((l) => l.char).join('')
  const { responses, entry } = terminalSearchReady
    ? await queryTerminal(query, roomName)
    : { responses: ['LOADING'], entry: null }
  morse.pendingSideEffect = entry?.sideEffect
    ? () => entry.sideEffect!(roomId)
    : null
  morse.responseQueue = responses.slice(1)
  morse.responseSignal = encodeResponse(responses[0])
}

function advanceResponse(now: number) {
  const normalPlayhead = playheadAt(morse.startTime, now, 2)

  if (!morse.ffStart && normalPlayhead >= morse.responseSignalEnd) {
    morse.ffStart = now
    morse.ffBase = normalPlayhead
  }

  const newPlayhead = morse.ffStart
    ? Math.min(
        morse.ffBase +
          Math.floor(
            FF_SPEED * ((now - morse.ffStart) / MORSE_DURATION) * BITMAP_WIDTH,
          ),
        BITMAP_WIDTH,
      )
    : normalPlayhead

  if (newPlayhead !== morse.playhead) morse.playhead = newPlayhead
  if (newPlayhead >= BITMAP_WIDTH) {
    const next = morse.responseQueue.shift()
    if (next) {
      morse.signal = encodeResponse(next)
      morse.playhead = 0
      morse.startTime = performance.now()
      morse.ffStart = 0
      morse.ffBase = 0
    } else {
      morse.phase = 'responded'
      morse.pendingSideEffect?.()
      morse.pendingSideEffect = null
    }
  }
}

function useKeypad(nearest: any) {
  const id = nearest?.mesh?.userData?.keypadId
  const digit = nearest?.mesh?.userData?.digit
  if (!id || !digit) return
  if (keypadsInError.has(id)) return
  playKeypad(digit)
  useGameStore.getState().submitKeypadDigit(id, digit)
}

function useDoor(world: World, nearest: any) {
  const id = nearest?.mesh?.userData?.doorId
  if (!id) return

  useGameStore.getState().openDoor(id)
  if (!useGameStore.getState().isDoorOpen(id)) {
    playDoorLockedClick()
    return
  }
  const store = useGameStore.getState()

  nearest?.mesh.getWorldPosition?.(_dPos)
  const door = world.entities
    .flatMap((e) => e.get(Mesh)?.getObjectsByProperty?.('name', 'door'))
    .filter((d) => d && d.userData.doorId !== nearest?.mesh.userData.doorId)
    .sort((a, b) => {
      a?.getWorldPosition?.(_aPos)
      b?.getWorldPosition?.(_bPos)
      return _aPos.distanceTo(_dPos) - _bPos.distanceTo(_dPos)
    })[0]

  if (door) store.openDoor(door.userData.doorId, true)
}

function moveEntities(world: World, now: number) {
  const forwardKey = keys.has('w') || keys.has('arrowup') ? 1 : 0
  const backKey = keys.has('s') || keys.has('arrowdown') ? 1 : 0
  const leftKey = keys.has('a') || keys.has('arrowleft') ? 1 : 0
  const rightKey = keys.has('d') || keys.has('arrowright') ? 1 : 0

  for (const entity of world.query(Controllable)) {
    const mesh = entity.get(Mesh) as any
    const cam = mesh.getObjectByName?.('playerCamera', true)

    cam?.getWorldQuaternion?.(_quat)

    _forwardVec.set(0, 0, -1).applyQuaternion(_quat)
    _rightVec.copy(_forwardVec).cross(_upVec)

    _moveVec
      .set(0, 0, 0)
      .addScaledVector(_forwardVec, forwardKey - backKey)
      .addScaledVector(_rightVec, rightKey - leftKey)
    if (_moveVec.lengthSq() > 0) _moveVec.normalize()

    const phys = entity.get(PhysicsBody)?.api as any
    const speed = 1.05
    phys.current.setLinvel(
      { x: _moveVec.x * speed, y: 0, z: _moveVec.z * speed },
      true,
    )
    tickFootstep(_moveVec.lengthSq() > 0, now)

    const translation = phys?.current?.translation?.()
    if (translation) {
      playerPos.x = translation.x
      playerPos.y = translation.y
      playerPos.z = translation.z
    }

    const dot = Math.abs(_lastCamAngle.dot(_quat))
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)))
    _lastCamAngle.copy(_quat)
    if (angle > 0.0005 || _moveVec.lengthSq() > 0) {
      computeAndSetNearest(world, cam)
    }
  }
}

const MAX_INTERACT_DIST = Math.sqrt(0.5)

const computeAndSetNearest = (world: World, camera: any) => {
  let best: { entity: any; mesh: any; distance: number } | null = null
  const raycaster = getRaycaster(camera)
  const maxDist = MAX_INTERACT_DIST

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
  cam?.getWorldPosition?.(_rayOrigin)
  cam?.getWorldDirection?.(_rayDir)
  _raycaster.set(_rayOrigin, _rayDir)
  return _raycaster
}
