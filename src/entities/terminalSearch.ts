import { getKnowledgeForRoom, type QAEntry } from '../data/terminalKnowledge'

function pickResponse(response: string | string[]): string[] {
  if (Array.isArray(response)) return response
  return [response]
}

type QueryResult = { responses: string[]; entry: QAEntry | null }

export function queryTerminal(input: string, roomName: string): QueryResult {
  const query = input.toUpperCase().trim()
  const knowledge = getKnowledgeForRoom(roomName)

  // Find an entry whose phrases include the query (or the query contains a phrase)
  const match = knowledge.find(
    (e) =>
      !e.default &&
      e.phrases.some(
        (p) => p.toUpperCase() === query || query.includes(p.toUpperCase()),
      ),
  )

  if (match) return { responses: pickResponse(match.response), entry: match }

  const defaultEntry = knowledge.find((e) => e.default) ?? null
  if (defaultEntry)
    return {
      responses: pickResponse(defaultEntry.response),
      entry: defaultEntry,
    }

  return { responses: [], entry: null }
}
