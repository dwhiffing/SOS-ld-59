import { BITMAP_WIDTH, MORSE_DURATION } from '../constants'

export type MorsePhase =
  | 'idle'
  | 'recording'
  | 'done'
  | 'responding'
  | 'responded'

export const morse = {
  phase: 'idle' as MorsePhase,
  startTime: 0,
  signal: new Uint8Array(BITMAP_WIDTH) as Uint8Array<ArrayBufferLike>,
  playhead: 0,
  doneTime: 0,
  lastInputTime: 0,
  ffStart: 0, // time fast-forward began (0 = not fast-forwarding)
  ffBase: 0, // playhead position when fast-forward began
  keyHeld: false,
  justStarted: false, // suppress hi note on the press that triggered recording
  responseSignal: null as Uint8Array<ArrayBufferLike> | null, // set async before startResponse fires
  terminalRoomId: '',
  terminalRoomName: '',
  pendingSideEffect: null as (() => void) | null,
  responseSignalEnd: 0, // pixel index where signal content ends
  responseQueue: [] as string[], // remaining messages to play after current
}

const RESPONSE_PAUSE_MS = 1000
const DOT_MS = 75
const DASH_MS = 200
const ELEM_GAP_MS = 100
const LETTER_GAP_MS = 500

const CHAR_TO_MORSE: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '?': '..--..',
}

const RESPONSE_LEAD_PX = 20 // blank pixels before signal starts

export function encodeResponse(text: string): Uint8Array<ArrayBuffer> {
  const msPerPixel = MORSE_DURATION / BITMAP_WIDTH
  const signal = new Uint8Array(new ArrayBuffer(BITMAP_WIDTH))
  let pixel = RESPONSE_LEAD_PX

  const fill = (val: 0 | 1, ms: number) => {
    const count = Math.round(ms / msPerPixel)
    for (let i = 0; i < count && pixel < BITMAP_WIDTH; i++)
      signal[pixel++] = val
  }

  if (!text) return signal

  const chars = text.toUpperCase().split('')
  for (let ci = 0; ci < chars.length; ci++) {
    const code = CHAR_TO_MORSE[chars[ci]]
    if (!code) continue
    if (ci > 0) fill(0, LETTER_GAP_MS)
    for (let ei = 0; ei < code.length; ei++) {
      if (ei > 0) fill(0, ELEM_GAP_MS)
      fill(1, code[ei] === '-' ? DASH_MS : DOT_MS)
    }
  }

  let end = 0
  for (let i = signal.length - 1; i >= 0; i--) {
    if (signal[i] !== 0) {
      end = i + 1
      break
    }
  }
  morse.responseSignalEnd = end

  return signal
}

export const HELLO_SIGNAL = encodeResponse('HELLO')
export { RESPONSE_PAUSE_MS }

// samples; tune relative to tap speed. 400ms at 50ms/sample = 8
const DOT_DASH_THRESHOLD = Math.round((200 / MORSE_DURATION) * BITMAP_WIDTH)
const LETTER_GAP_THRESHOLD = Math.round((500 / MORSE_DURATION) * BITMAP_WIDTH)

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

  if (elements.length > 0 && head >= BITMAP_WIDTH) {
    results.push({
      char: MORSE_TABLE[elements.join('')] ?? '?',
      x0: letterX0,
      x1: head,
    })
  }

  return results
}
