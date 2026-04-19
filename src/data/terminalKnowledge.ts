export interface QAEntry {
  phrases: string[]
  response: string // keep short — it gets encoded as morse
  threshold?: number // overrides global SIMILARITY_THRESHOLD if set
  sideEffect?: (roomId: string) => void
}

import useGameStore from '../stores/gameStore'

const DIRECTIONS = ['north', 'south', 'east', 'west']
function getRoomDoorIds(roomId: string) {
  return DIRECTIONS.map((d) => `${roomId}-${d}`)
}

export const KNOWLEDGE_BASE: QAEntry[] = [
  {
    phrases: ['where', 'what place', 'location', 'place'],
    response: 'SECTOR 7',
  },
  {
    phrases: ['who', 'what you', 'identify', 'name'],
    response: 'UNIT 4',
  },
  {
    phrases: ['help', 'what do', 'instructions', 'proceed'],
    response: 'FIND KEY',
  },
  {
    phrases: ['escape', 'exit', 'way out'],
    response: 'NORTH DOOR',
  },
  {
    phrases: ['open'],
    response: 'OKAY',
    sideEffect: (roomId) => {
      const store = useGameStore.getState()
      getRoomDoorIds(roomId).forEach((id) => store.unlockDoor(id))
    },
  },
]

export const FALLBACK_RESPONSE = 'NO DATA'
