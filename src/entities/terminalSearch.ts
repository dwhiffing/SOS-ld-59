import { pipeline, cos_sim } from '@huggingface/transformers'
import {
  FALLBACK_RESPONSE,
  KNOWLEDGE_BASE,
  type QAEntry,
} from '../data/terminalKnowledge'

const MODEL = 'Xenova/all-MiniLM-L6-v2'
const SIMILARITY_THRESHOLD = 0.6

type Extractor = Awaited<ReturnType<typeof pipeline<'feature-extraction'>>>
type Embedding = number[]

let extractor: Extractor | null = null
let knowledgeEmbeddings: { entry: QAEntry; vectors: Embedding[] }[] = []
let ready = false

export async function initTerminalSearch() {
  extractor = await pipeline('feature-extraction', MODEL, { dtype: 'fp32' })

  knowledgeEmbeddings = await Promise.all(
    KNOWLEDGE_BASE.map(async (entry) => ({
      entry,
      vectors: await embedAll(entry.phrases),
    })),
  )

  ready = true
}

function embedAll(texts: string[]): Promise<Embedding[]> {
  return Promise.all(texts.map(embed))
}

async function embed(text: string): Promise<Embedding> {
  const output = await extractor!(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

type QueryResult = { response: string; entry: QAEntry | null }

export async function queryTerminal(input: string): Promise<QueryResult> {
  if (!ready || !extractor) return { response: FALLBACK_RESPONSE, entry: null }

  const queryVec = await embed(input.toLowerCase().trim())

  let bestScore = -1
  let bestEntry: QAEntry | null = null

  for (const { entry, vectors } of knowledgeEmbeddings) {
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
    return { response: bestEntry.response, entry: bestEntry }
  }

  return { response: FALLBACK_RESPONSE, entry: null }
}

export { ready as terminalSearchReady }

declare global {
  interface Window {
    askTerminal: (query: string) => Promise<void>
  }
}

window.askTerminal = async (query: string) => {
  const { response } = await queryTerminal(query)
  console.log(`Q: "${query}" → "${response}"`)
}
