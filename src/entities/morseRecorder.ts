import { BITMAP_WIDTH, MORSE_DURATION } from '../constants'

export type MorsePhase = 'idle' | 'recording' | 'done'

export const morse = {
  phase: 'idle' as MorsePhase,
  startTime: 0,
  signal: new Uint8Array(BITMAP_WIDTH),
  playhead: 0,
}

// samples; tune relative to tap speed. 400ms at 50ms/sample = 8
const DOT_DASH_THRESHOLD = Math.round((200 / MORSE_DURATION) * BITMAP_WIDTH)
const LETTER_GAP_THRESHOLD = Math.round((300 / MORSE_DURATION) * BITMAP_WIDTH)

const MORSE_TABLE: Record<string, string> = {
  '.-': 'A',
  '-...': 'B',
  '-.-.': 'C',
  '-..': 'D',
  '.': 'E',
  '..-.': 'F',
  '--.': 'G',
  '....': 'H',
  '..': 'I',
  '.---': 'J',
  '-.-': 'K',
  '.-..': 'L',
  '--': 'M',
  '-.': 'N',
  '---': 'O',
  '.--.': 'P',
  '--.-': 'Q',
  '.-.': 'R',
  '...': 'S',
  '-': 'T',
  '..-': 'U',
  '...-': 'V',
  '.--': 'W',
  '-..-': 'X',
  '-.--': 'Y',
  '--..': 'Z',
  '-----': '0',
  '.----': '1',
  '..---': '2',
  '...--': '3',
  '....-': '4',
  '.....': '5',
  '-....': '6',
  '--...': '7',
  '---..': '8',
  '----.': '9',
}

export type DecodedLetter = { char: string; x0: number; x1: number }

export function decodeMorse(signal: Uint8Array, head: number): DecodedLetter[] {
  const results: DecodedLetter[] = []
  const elements: string[] = []
  let letterX0 = 0
  let i = 0

  while (i < head) {
    const val = signal[i]
    const start = i
    while (i < head && signal[i] === val) i++
    const len = i - start

    if (val === 1) {
      if (elements.length === 0) letterX0 = start
      elements.push(len >= DOT_DASH_THRESHOLD ? '-' : '.')
    } else if (len >= LETTER_GAP_THRESHOLD && elements.length > 0) {
      results.push({
        char: MORSE_TABLE[elements.join('')] ?? '?',
        x0: letterX0,
        x1: start,
      })
      elements.length = 0
    }
  }

  return results
}
