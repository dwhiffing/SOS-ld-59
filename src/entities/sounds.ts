const ctx = new AudioContext()

function playDoor(duration: number, thudGain: number, scrapeGain: number) {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * duration)
  const thudStart = Math.floor(len * 0.75)

  const buffer = ctx.createBuffer(1, len, rate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < len; i++) {
    const noise = Math.random() * 2 - 1
    if (i < thudStart) {
      // scraping: steady noise, slight fade in then out
      const t = i / thudStart
      const env = Math.sin(t * Math.PI) * 0.6 + 0.4
      data[i] = noise * env * scrapeGain
    } else {
      // thud: loud burst that decays fast
      const t = (i - thudStart) / (len - thudStart)
      data[i] = noise * Math.pow(1 - t, 4) * thudGain
    }
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  // scrape band: mid frequencies
  const scrapeFilter = ctx.createBiquadFilter()
  scrapeFilter.type = 'bandpass'
  scrapeFilter.frequency.value = 800
  scrapeFilter.Q.value = 0.5

  // thud: low pass
  const thudFilter = ctx.createBiquadFilter()
  thudFilter.type = 'lowpass'
  thudFilter.frequency.value = 150

  // blend both filters via separate gain nodes
  const scrapeOut = ctx.createGain()
  scrapeOut.gain.value = 0.4

  const thudOut = ctx.createGain()
  thudOut.gain.value = 1.0

  const master = ctx.createGain()
  master.gain.value = 1.0

  source.connect(scrapeFilter)
  scrapeFilter.connect(scrapeOut)
  scrapeOut.connect(master)

  source.connect(thudFilter)
  thudFilter.connect(thudOut)
  thudOut.connect(master)

  master.connect(ctx.destination)
  source.start()
}

let lastStepTime = 0
const STEP_INTERVAL_MS = 500

export function tickFootstep(isMoving: boolean, now: number) {
  if (!isMoving || now - lastStepTime < STEP_INTERVAL_MS) return
  lastStepTime = now

  const rate = ctx.sampleRate
  const len = Math.floor(rate * 0.05)
  const buffer = ctx.createBuffer(1, len, rate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6)
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200

  const gain = ctx.createGain()
  gain.gain.value = 0.9

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
}

let staticNode: AudioBufferSourceNode | null = null
let staticGain: GainNode | null = null
const STATIC_MAX = 0.015
const STATIC_FADE = 0.4

export function startStatic() {
  if (staticNode) return
  const rate = ctx.sampleRate
  const len = rate * 2
  const buffer = ctx.createBuffer(1, len, rate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

  staticNode = ctx.createBufferSource()
  staticNode.buffer = buffer
  staticNode.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2000
  filter.Q.value = 0.3

  staticGain = ctx.createGain()
  staticGain.gain.setValueAtTime(0, ctx.currentTime)
  staticGain.gain.linearRampToValueAtTime(
    STATIC_MAX,
    ctx.currentTime + STATIC_FADE,
  )

  staticNode.connect(filter)
  filter.connect(staticGain)
  staticGain.connect(ctx.destination)
  staticNode.start()
}

export function stopStatic() {
  if (!staticNode || !staticGain) return
  const stop = ctx.currentTime + STATIC_FADE
  staticGain.gain.linearRampToValueAtTime(0, stop)
  const node = staticNode
  staticNode = null
  staticGain = null
  setTimeout(() => node.stop(), STATIC_FADE * 1000 + 50)
}

let morseOsc: OscillatorNode | null = null

export function playMorseHi(freq = 600) {
  if (morseOsc) return
  morseOsc = ctx.createOscillator()
  morseOsc.type = 'sine'
  morseOsc.frequency.value = freq

  const gain = ctx.createGain()
  gain.gain.value = 0.2

  morseOsc.connect(gain)
  gain.connect(ctx.destination)
  morseOsc.start()
}

export function playMorseLo() {
  if (!morseOsc) return
  morseOsc.stop()
  morseOsc = null
}

// DTMF row/column frequencies (standard phone keypad)
const DTMF_ROW = [697, 770, 852, 941]
const DTMF_COL = [1209, 1336, 1477]
const DTMF_MAP: Record<string, [number, number]> = {
  '1': [0, 0],
  '2': [0, 1],
  '3': [0, 2],
  '4': [1, 0],
  '5': [1, 1],
  '6': [1, 2],
  '7': [2, 0],
  '8': [2, 1],
  '9': [2, 2],
  '*': [3, 0],
  '0': [3, 1],
  '#': [3, 2],
}

export function playKeypad(digit: string) {
  const pair = DTMF_MAP[digit]
  if (!pair) return
  const [row, col] = pair
  const now = ctx.currentTime
  const dur = 0.15

  for (const freq of [DTMF_ROW[row], DTMF_COL[col]]) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + dur)
  }
}

export function playDoorLockedClick() {
  const now = ctx.currentTime

  // short mechanical click — two quick noise bursts
  for (const [offset, gain] of [
    [0, 0.6],
    [0.04, 0.3],
  ] as const) {
    const rate = ctx.sampleRate
    const len = Math.floor(rate * 0.018)
    const buffer = ctx.createBuffer(1, len, rate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 1.5

    const g = ctx.createGain()
    g.gain.value = gain

    source.connect(filter)
    filter.connect(g)
    g.connect(ctx.destination)
    source.start(now + offset)
  }
}

export function playDoorLocked() {
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'square'
  osc.frequency.setValueAtTime(120, now)
  osc.frequency.setValueAtTime(90, now + 0.08)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.setValueAtTime(0.3, now + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.22)
}

export function playDoorUnlock() {
  const rate = ctx.sampleRate
  const dur = 1.1
  const len = Math.floor(rate * dur)
  const buffer = ctx.createBuffer(1, len, rate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    const t = i / len
    // slow fade in, long sustain, gradual fade out
    const env = Math.min(t * 8, 1) * Math.pow(1 - t, 1.2)
    data[i] = (Math.random() * 2 - 1) * env
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(150, ctx.currentTime)
  filter.frequency.linearRampToValueAtTime(10, ctx.currentTime + dur)
  filter.Q.value = 0.8

  const gain = ctx.createGain()
  gain.gain.value = 1.4

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
}

export function playDoorOpen() {
  playDoor(0.5, 1.0, 0.5)
}

export function playDoorClose() {
  playDoor(0.6, 1.4, 0.4)
}

export function playGameStart() {
  const now = ctx.currentTime
  // long reverb tail
  const reverb = ctx.createConvolver()
  const rate = ctx.sampleRate
  const rLen = Math.floor(rate * 5)
  const rBuf = ctx.createBuffer(2, rLen, rate)
  for (let c = 0; c < 2; c++) {
    const d = rBuf.getChannelData(c)
    for (let i = 0; i < rLen; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rLen, 1.2)
  }
  reverb.buffer = rBuf
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 1.2
  reverb.connect(reverbGain)
  reverbGain.connect(ctx.destination)

  // slow descending low tones, wide spacing
  const beeps: [number, number][] = [
    [520, 0],
    [465, 0.3],
    [310, 0.5],
  ]
  beeps.forEach(([freq, offset]) => {
    const t = now + offset
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 1.8)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.5)

    osc.connect(gain)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + 2.5)
  })
}
