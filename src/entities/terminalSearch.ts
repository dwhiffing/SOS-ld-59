import { pipeline, cos_sim } from '@huggingface/transformers'
import { getKnowledgeForRoom, type QAEntry } from '../data/terminalKnowledge'

const MODEL = 'Xenova/all-MiniLM-L6-v2'
const SIMILARITY_THRESHOLD = 0.4

type Extractor = Awaited<ReturnType<typeof pipeline<'feature-extraction'>>>
type Embedding = number[]

let extractor: Extractor | null = null
let ready = false

// Per-room embedding cache, built lazily on first query
const roomEmbeddingCache = new Map<
  string,
  { entry: QAEntry; vectors: Embedding[] }[]
>()

export async function initTerminalSearch() {
  extractor = await pipeline('feature-extraction', MODEL, { dtype: 'fp32' })
  ready = true
}

function embedAll(texts: string[]): Promise<Embedding[]> {
  return Promise.all(texts.map(embed))
}

async function embed(text: string): Promise<Embedding> {
  const output = await extractor!(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

async function getEmbeddingsForRoom(roomName: string) {
  if (roomEmbeddingCache.has(roomName)) return roomEmbeddingCache.get(roomName)!

  const knowledge = getKnowledgeForRoom(roomName)
  const embeddings = await Promise.all(
    knowledge.map(async (entry) => ({
      entry,
      vectors: await embedAll(entry.phrases),
    })),
  )
  roomEmbeddingCache.set(roomName, embeddings)
  return embeddings
}

function pickResponse(response: string | string[]): string[] {
  if (Array.isArray(response)) return response
  return [response]
}

type QueryResult = { responses: string[]; entry: QAEntry | null }

export async function queryTerminal(
  input: string,
  roomName: string,
): Promise<QueryResult> {
  const queryVec = await embed(input.toLowerCase().trim())
  const embeddings = await getEmbeddingsForRoom(roomName)

  let bestScore = -1
  let bestEntry: QAEntry | null = null

  for (const { entry, vectors } of embeddings) {
    for (const vec of vectors) {
      const score = cos_sim(queryVec, vec)
      if (score > bestScore) {
        bestScore = score
        bestEntry = entry
      }
    }
  }

  const threshold = bestEntry?.threshold ?? SIMILARITY_THRESHOLD
  if (bestEntry && bestScore >= threshold) {
    return { responses: pickResponse(bestEntry.response), entry: bestEntry }
  }

  const defaultEntry = embeddings.find(({ entry }) => entry.default)?.entry ?? null
  if (defaultEntry) {
    return { responses: pickResponse(defaultEntry.response), entry: defaultEntry }
  }

  return { responses: [], entry: null }
}

export { ready as terminalSearchReady }
