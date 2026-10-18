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
import { Mesh, PhysicsBody } from '../../shared/traits'
import useGameStore from '../../stores/gameStore'
import { setMusicMuted } from '../ambience'
import { playInteract, resumeAudioContext, setSfxMuted, tickFootstep } from '../sounds'
import { Controllable, NearestItem } from './traits'

let keys = new Set<string>()
let justPressed = new Set<string>()
let initialized = false

let _lastCamAngle: Quaternion = new Quaternion()
export const playerPos = { x: 0, y: 0, z: 0 }

// Max distance (from the camera, along the look ray) to interact with something
export const INTERACT_REACH = 0.55

// Object names that can be looked at and interacted with. Each such object
// carries a human readable `userData.label`.
export const INTERACTABLE_NAMES = ['tape', 'shelf', 'counter', 'dropBin']

// Mobile touch state
export const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)
export const mobileCam = { yaw: -Math.PI, pitch: 0 }
let touchMoveForward = false
// Primary touch: interact / tap / double-tap-hold-forward
let activeTouchId: number | null = null
let touchStartX = 0
let touchStartY = 0
let touchDragging = false
let lastTapEndTime = 0
let doubleTapHeld = false
const DRAG_THRESHOLD_PX = 8
const DOUBLE_TAP_MS = 300
const TOUCH_SENSITIVITY = 0.004

function initTouchListeners() {
  window.addEventListener(
    'touchstart',
    (e) => {
      const target = e.target as HTMLElement
      if (target.closest('button, a, .menu')) return
      e.preventDefault()
      resumeAudioContext()
      const now = performance.now()

      for (const touch of e.changedTouches) {
        if (activeTouchId !== null) continue

        activeTouchId = touch.identifier
        touchStartX = touch.clientX
        touchStartY = touch.clientY
        touchDragging = false

        // Double tap + hold → move forward
        if (now - lastTapEndTime < DOUBLE_TAP_MS) {
          doubleTapHeld = true
          touchMoveForward = true
          continue
        }

        // Single touch: potential interact hold
        keys.add(' ')
      }
    },
    { passive: false },
  )

  window.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault()

      for (const touch of e.changedTouches) {
        if (touch.identifier !== activeTouchId) continue

        const dx = touch.clientX - touchStartX
        const dy = touch.clientY - touchStartY

        if (
          !touchDragging &&
          Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX
        ) {
          touchDragging = true
          keys.delete(' ')
        }

        // Single-finger drag → camera look (always, including while moving forward)
        if (touchDragging) {
          mobileCam.yaw -= dx * TOUCH_SENSITIVITY
          mobileCam.pitch -= dy * TOUCH_SENSITIVITY
          mobileCam.pitch = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, mobileCam.pitch),
          )
          touchStartX = touch.clientX
          touchStartY = touch.clientY
        }
      }
    },
    { passive: false },
  )

  window.addEventListener(
    'touchend',
    (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier !== activeTouchId) continue

        activeTouchId = null

        if (doubleTapHeld) {
          doubleTapHeld = false
          touchMoveForward = false
          continue
        }

        if (!touchDragging) {
          justPressed.add(' ')
          lastTapEndTime = performance.now()
        }

        keys.delete(' ')
        touchDragging = false
      }
    },
    { passive: false },
  )

  window.addEventListener(
    'touchcancel',
    () => {
      activeTouchId = null
      doubleTapHeld = false
      touchMoveForward = false
      touchDragging = false
      keys.delete(' ')
    },
    { passive: false },
  )
}

function initKeyboardListeners() {
  if (initialized) return
  initialized = true

  if (typeof window === 'undefined') return

  if (isTouchDevice) {
    initTouchListeners()
    return
  }

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

  if (justPressed.has('m')) {
    useGameStore.getState().cycleSoundMode()
    const mode = useGameStore.getState().soundMode
    setMusicMuted(mode === 'muteMusic' || mode === 'muteAll')
    setSfxMuted(mode === 'muteAll')
  }

  if (justPressed.has(' ')) {
    const nearest = world.get(NearestItem) as any
    if (nearest?.mesh) interact(nearest.mesh)
  }

  moveEntities(world, now)

  justPressed = new Set([])
}

export default controllerInputSystem

// Placeholder: real tape/shelf/customer behaviour comes in later steps
function interact(mesh: any) {
  playInteract()
  useGameStore.getState().interact(mesh.userData?.label ?? mesh.name)
}

function moveEntities(world: World, now: number) {
  const forwardKey =
    keys.has('w') || keys.has('arrowup') || touchMoveForward ? 1 : 0
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
    const speed = isTouchDevice ? 0.7 : 1.05
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

const computeAndSetNearest = (world: World, camera: any) => {
  let best: { entity: any; mesh: any; distance: number } | null = null
  const raycaster = getRaycaster(camera)

  for (const e of world.entities) {
    const mesh = e.get(Mesh) as any
    if (!mesh) continue

    for (const name of INTERACTABLE_NAMES) {
      const objs = mesh.getObjectsByProperty?.('name', name) ?? []
      for (const obj of objs) {
        if (!obj?.visible) continue
        const intersects = raycaster.intersectObject(obj, true)
        if (intersects.length === 0) continue
        const dist = intersects[0].distance
        if (dist > INTERACT_REACH) continue
        if (best === null || dist < best.distance) {
          best = { entity: e, mesh: obj, distance: dist }
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
    useGameStore
      .getState()
      .setLookingAt(best ? (best.mesh.userData?.label ?? best.mesh.name) : null)
  }
}

const getRaycaster = (cam: any) => {
  cam?.getWorldPosition?.(_rayOrigin)
  cam?.getWorldDirection?.(_rayDir)
  _raycaster.set(_rayOrigin, _rayDir)
  return _raycaster
}
