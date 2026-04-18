import { create } from 'zustand'

export interface GameState {
  lights: Record<string, boolean>
  keyCount: number
  lockedDoors: Record<string, boolean>
  openDoors: Record<string, boolean>
  scene: 'menu' | 'game'
  setScene: (scene: 'menu' | 'game') => void
  resetGame: () => void

  toggleLight: (id: string) => void
  addKey: () => void
  removeKey: () => void
  unlockDoor: (doorId: string) => void
  openDoor: (doorId: string) => void
  closeDoor: (doorId: string) => void
  isDoorOpen: (doorId: string) => boolean
  isDoorUnlocked: (doorId: string) => boolean
}

const initialState = {
  lights: {},
  keyCount: 0,
  lockedDoors: {
    'start-room-west': true,
  },
  openDoors: {},
  scene: 'game' as 'menu' | 'game',
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  addKey: () => set((s) => ({ keyCount: s.keyCount + 1 })),
  removeKey: () => set((s) => ({ keyCount: Math.max(0, s.keyCount - 1) })),
  unlockDoor: (doorId: string) =>
    set((s) => ({ lockedDoors: { ...s.lockedDoors, [doorId]: false } })),
  openDoor: (doorId: string) => {
    if (get().lockedDoors[doorId]) return
    set((s) => ({ openDoors: { ...s.openDoors, [doorId]: true } }))
  },
  closeDoor: (doorId: string) =>
    set((s) => ({ openDoors: { ...s.openDoors, [doorId]: false } })),
  isDoorOpen: (doorId: string) => !!get().openDoors[doorId],
  isDoorUnlocked: (doorId: string) => !get().lockedDoors[doorId],
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
