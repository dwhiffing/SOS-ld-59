const ctx = new AudioContext()

const sfxMaster = ctx.createGain()
sfxMaster.gain.value = 1
sfxMaster.connect(ctx.destination)

export function setSfxMuted(muted: boolean) {
  sfxMaster.gain.value = muted ? 0 : 1
}

export function resumeAudioContext() {
  if (ctx.state === 'suspended') ctx.resume()
}

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

  master.connect(sfxMaster)
  source.start()
}

let lastStepTime = 0
const STEP_INTERVAL_MS = 500

// Pre-bake footstep buffers and a persistent filter chain to avoid per-step allocations
const STEP_POOL_SIZE = 8
const _stepBuffers: AudioBuffer[] = (() => {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * 0.05)
  return Array.from({ length: STEP_POOL_SIZE }, () => {
    const buf = ctx.createBuffer(1, len, rate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6)
    }
    return buf
  })
})()
let _stepPoolIdx = 0

const _stepFilter = ctx.createBiquadFilter()
_stepFilter.type = 'lowpass'
_stepFilter.frequency.value = 200
const _stepGain = ctx.createGain()
_stepGain.gain.value = 0.9
_stepFilter.connect(_stepGain)
_stepGain.connect(sfxMaster)

export function tickFootstep(isMoving: boolean, now: number) {
  if (!isMoving || now - lastStepTime < STEP_INTERVAL_MS) return
  lastStepTime = now

  const source = ctx.createBufferSource()
  source.buffer = _stepBuffers[_stepPoolIdx % STEP_POOL_SIZE]
  _stepPoolIdx++
  source.connect(_stepFilter)
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
  staticGain.connect(sfxMaster)
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
  gain.connect(sfxMaster)
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
    gain.connect(sfxMaster)
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
    g.connect(sfxMaster)
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
  gain.connect(sfxMaster)
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
  gain.connect(sfxMaster)
  source.start()
}

export function playRecordClear() {
  const now = ctx.currentTime
  for (const [offset, freq] of [[0, 640], [0.07, 380]] as const) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now + offset)
    gain.gain.linearRampToValueAtTime(0.18, now + offset + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07)
    osc.connect(gain)
    gain.connect(sfxMaster)
    osc.start(now + offset)
    osc.stop(now + offset + 0.07)
  }
}

export function playRecordStart() {
  const now = ctx.currentTime
  for (const [offset, freq] of [[0, 480], [0.07, 640]] as const) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now + offset)
    gain.gain.linearRampToValueAtTime(0.18, now + offset + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07)
    osc.connect(gain)
    gain.connect(sfxMaster)
    osc.start(now + offset)
    osc.stop(now + offset + 0.07)
  }
}

export function playDoorOpen() {
  playDoor(0.5, 1.0, 0.5)
}

export function playDoorClose() {
  playDoor(0.6, 1.4, 0.4)
}

export function playGameStart() {
  const now = ctx.currentTime
  const freq = 600
  const dot = 0.05
  const dash = 0.15
  const gap = 0.04
  const charGap = 0.1

  // ... --- ...  (SOS)
  const S = [dot, dot, dot]
  const O = [dash, dash, dash]
  const chars = [S, O, S]
  let t = now
  chars.forEach((char, ci) => {
    char.forEach((dur, si) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.35, t + 0.005)
      gain.gain.setValueAtTime(0.35, t + dur - 0.005)
      gain.gain.linearRampToValueAtTime(0, t + dur)

      osc.connect(gain)
      gain.connect(sfxMaster)
      osc.start(t)
      osc.stop(t + dur)

      t += dur + (si < char.length - 1 ? gap : 0)
    })
    if (ci < chars.length - 1) t += charGap
  })
}
