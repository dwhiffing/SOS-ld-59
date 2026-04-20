export interface QAEntry {
  phrases: string[]
  response: string | string[] // string = single message; array = play in sequence; side effect fires after last
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
    phrases: ['where', 'what place', 'location', 'place'],
    response: 'UNDERGROUND',
  },
]

export const ROOM_KNOWLEDGE: Record<string, QAEntry[]> = {
  default: [],
  '1': [
    {
      phrases: ['SOS'],
      response: 'HELLO',
      sideEffect: (roomId) => {
        const store = useGameStore.getState()
        console.log(roomId, getRoomDoorIds(roomId))
        getRoomDoorIds(roomId).forEach((id) => store.unlockDoor(id))
      },
    },
  ],
  '2': [
    {
      phrases: ['SOS', 'DOOR', 'HELP'],
      response: 'OPEN DOOR?',
    },
    {
      phrases: ['OPEN', 'YES'],
      response: ['MY NAME IS', 'QUINCY'],
      sideEffect: (roomId) => {
        const store = useGameStore.getState()
        getRoomDoorIds(roomId).forEach((id) => store.unlockDoor(id))
      },
    },
  ],
  '3': [
    {
      phrases: ['SOS', 'DOOR', 'HELP'],
      response: 'WHAT IS HERE?',
    },
    {
      phrases: ['BED'],
      response: 'GOOD',
      sideEffect: (roomId) => {
        let things = useGameStore.getState().things
        useGameStore.setState({ things: { ...things, bed: true } })
        things = useGameStore.getState().things
        if (things.bed && things.chair && things.table) {
          const store = useGameStore.getState()
          getRoomDoorIds(roomId).forEach((id) => store.unlockDoor(id))
        }
      },
    },
    {
      phrases: ['CHAIR'],
      response: 'GOOD',
      sideEffect: (roomId) => {
        let things = useGameStore.getState().things
        useGameStore.setState({ things: { ...things, chair: true } })
        things = useGameStore.getState().things
        if (things.bed && things.chair && things.table) {
          const store = useGameStore.getState()
          getRoomDoorIds(roomId).forEach((id) => store.unlockDoor(id))
        }
      },
    },
    {
      phrases: ['TABLE'],
      response: 'GOOD',
      sideEffect: (roomId) => {
        let things = useGameStore.getState().things
        useGameStore.setState({ things: { ...things, table: true } })
        things = useGameStore.getState().things
        if (things.bed && things.chair && things.table) {
          const store = useGameStore.getState()
          getRoomDoorIds(roomId).forEach((id) => store.unlockDoor(id))
        }
      },
    },
  ],
  '4': [
    {
      phrases: ['SOS', 'DOOR', 'HELP'],
      response: 'CODE SECRET DIGITS DESCEND',
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
