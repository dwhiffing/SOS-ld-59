export interface QAEntry {
  phrases: string[]
  response: string | string[] // array = pick one randomly; keep short — encoded as morse
  threshold?: number // overrides global SIMILARITY_THRESHOLD if set
  sideEffect?: (roomId: string) => void
}

import useGameStore from '../stores/gameStore'

const DIRECTIONS = ['north', 'south', 'east', 'west']
function getRoomDoorIds(roomId: string) {
  return DIRECTIONS.map((d) => `${roomId}-${d}`)
}

export const GENERIC_KNOWLEDGE: QAEntry[] = [
  {
    phrases: ['who', 'what you', 'identify', 'name'],
    response: 'UNIT 4',
  },
  {
    phrases: ['help', 'what do', 'instructions', 'proceed'],
    response: 'FIND KEY',
  },
]

export const ROOM_KNOWLEDGE: Record<string, QAEntry[]> = {
  default: [
    {
      phrases: ['where', 'what place', 'location', 'place'],
      response: 'SECTOR 7',
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
  ],
  '1': [
    {
      phrases: ['e'],
      response: 'YES',
    },
  ],
}

export function getKnowledgeForRoom(roomName: string): QAEntry[] {
  const roomEntries =
    ROOM_KNOWLEDGE[roomName] ?? ROOM_KNOWLEDGE['default'] ?? []
  return [...GENERIC_KNOWLEDGE, ...roomEntries]
}

export const FALLBACK_RESPONSES = [
  'NO DATA',
  'UNKNOWN',
  'ERROR',
  'NOT FOUND',
  'QUERY FAIL',
]
