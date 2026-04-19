import { create } from 'zustand'

export interface KeypadData {
  code: string
  input: string
  doorId?: string
}

export interface GameState {
  lights: Record<string, boolean>
  lockedDoors: Record<string, boolean>
  openDoors: Record<string, boolean>
  keypads: Record<string, KeypadData>
  scene: 'menu' | 'game'
  setScene: (scene: 'menu' | 'game') => void
  resetGame: () => void
  toggleLight: (id: string) => void
  initDoor: (doorId: string, locked: boolean) => void
  unlockDoor: (doorId: string) => void
  openDoor: (doorId: string, force?: boolean) => void
  closeDoor: (doorId: string) => void
  isDoorOpen: (doorId: string) => boolean
  isDoorUnlocked: (doorId: string) => boolean
  initKeypad: (id: string, code: string, doorId?: string) => void
  submitKeypadDigit: (id: string, digit: string) => void
  resetKeypadInput: (id: string) => void
}

export const initialState = {
  lights: {},
  lockedDoors: {} as Record<string, boolean>,
  openDoors: {},
  keypads: {} as Record<string, KeypadData>,
  scene: 'game' as 'menu' | 'game',
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  initDoor: (doorId: string, locked: boolean) => {
    if (locked)
      set((s) => ({ lockedDoors: { ...s.lockedDoors, [doorId]: true } }))
  },
  unlockDoor: (doorId: string) => {
    set((s) => ({ lockedDoors: { ...s.lockedDoors, [doorId]: false } }))
  },
  openDoor: (doorId: string, force = false) => {
    if (get().lockedDoors[doorId] && !force) return
    set((s) => ({ openDoors: { ...s.openDoors, [doorId]: true } }))
  },
  closeDoor: (doorId: string) =>
    set((s) => ({ openDoors: { ...s.openDoors, [doorId]: false } })),
  isDoorOpen: (doorId: string) => !!get().openDoors[doorId],
  isDoorUnlocked: (doorId: string) => !get().lockedDoors[doorId],
  initKeypad: (id: string, code: string, doorId?: string) => {
    if (get().keypads[id]) {
      if (doorId)
        set((s) => ({ lockedDoors: { ...s.lockedDoors, [doorId]: true } }))
      return
    }
    set((s) => ({
      keypads: { ...s.keypads, [id]: { code, input: '', doorId } },
      lockedDoors: doorId
        ? { ...s.lockedDoors, [doorId]: true }
        : s.lockedDoors,
    }))
  },
  submitKeypadDigit: (id: string, digit: string) => {
    const kp = get().keypads[id]
    const isUnlocked = kp?.doorId
      ? get().lockedDoors[kp.doorId] === false
      : false
    if (!kp || isUnlocked || kp.input.length >= 4) return
    const newInput = kp.input + digit
    if (newInput === kp.code) {
      if (kp.doorId) get().unlockDoor(kp.doorId)
      set((s) => ({
        keypads: { ...s.keypads, [id]: { ...kp, input: newInput } },
      }))
    } else {
      set((s) => ({
        keypads: { ...s.keypads, [id]: { ...kp, input: newInput } },
      }))
    }
  },
  resetKeypadInput: (id: string) => {
    const kp = get().keypads[id]
    if (!kp) return
    set((s) => ({ keypads: { ...s.keypads, [id]: { ...kp, input: '' } } }))
  },
  setScene: (scene: 'menu' | 'game') => set(() => ({ scene })),
  resetGame: () => set(() => initialState),
  toggleLight: (id: string) => {
    const state = get()
    if (state.lights[id]) {
      set((s) => ({ lights: { ...s.lights, [id]: false } }))
      return
    }
    set((s) => ({ lights: { ...s.lights, [id]: true } }))
  },
}))

export default useGameStore
