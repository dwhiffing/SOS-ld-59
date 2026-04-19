const ctx = new AudioContext()

const master = ctx.createGain()
master.gain.value = 0
master.connect(ctx.destination)

// Reverb via convolution with noise impulse
function makeReverb(duration = 3, decay = 2): ConvolverNode {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * duration)
  const buffer = ctx.createBuffer(2, len, rate)
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  const reverb = ctx.createConvolver()
  reverb.buffer = buffer
  return reverb
}

const reverb = makeReverb(4, 2.5)
const reverbGain = ctx.createGain()
reverbGain.gain.value = 0.7
reverb.connect(reverbGain)
reverbGain.connect(master)

// Low drone — two detuned oscillators
function startDrone() {
  const freqs = [55, 55.3, 110.1]
  for (const freq of freqs) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.value = 0.08

    // slow tremolo
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07 + Math.random() * 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.03
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    lfo.start()

    osc.connect(gain)
    gain.connect(reverb)
    gain.connect(master)
    osc.start()
  }
}

// Drip/drop percussive hits
const DROP_PITCHES = [220, 277, 330, 370, 440, 494]

function scheduleDrops(startTime: number, endTime: number) {
  let t = startTime
  while (t < endTime) {
    const pitch = DROP_PITCHES[Math.floor(Math.random() * DROP_PITCHES.length)]
    const vel = 0.06 + Math.random() * 0.08
    const dur = 0.08 + Math.random() * 0.05

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(pitch, t)
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, t + dur)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(vel, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur)

    osc.connect(gain)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + dur)

    // irregular rhythm: groups of slow drips with occasional fast bursts
    const gap = Math.random() < 0.1
      ? 0.1 + Math.random() * 0.2   // burst
      : 0.8 + Math.random() * 2.5   // slow drip
    t += gap
  }
}

// Low rhythmic thud — like a distant heartbeat
function scheduleThud(startTime: number, endTime: number) {
  const bpm = 52
  const beat = 60 / bpm
  let t = startTime
  let beat_n = 0
  while (t < endTime) {
    // accent on beat 1, softer on beat 3
    const accent = beat_n % 4 === 0 ? 1.0 : beat_n % 4 === 2 ? 0.5 : 0
    if (accent > 0) {
      const rate = ctx.sampleRate
      const len = Math.floor(rate * 0.18)
      const buffer = ctx.createBuffer(1, len, rate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 5)
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 90

      const gain = ctx.createGain()
      gain.gain.value = accent * 0.5

      source.connect(filter)
      filter.connect(gain)
      gain.connect(reverb)
      gain.connect(master)
      source.start(t)
    }
    t += beat
    beat_n++
  }
}

// Wind-like filtered noise pad
function startWind() {
  const rate = ctx.sampleRate
  const len = rate * 4
  const buffer = ctx.createBuffer(1, len, rate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 180
  filter.Q.value = 0.4

  const gain = ctx.createGain()
  gain.gain.value = 0.06

  // slow filter sweep
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.03
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 60
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  source.connect(filter)
  filter.connect(gain)
  gain.connect(reverb)
  gain.connect(master)
  source.start()
}

let running = false

function scheduleCycle() {
  if (!running) return
  const now = ctx.currentTime
  const dur = 16
  scheduleDrops(now, now + dur + 2)
  scheduleThud(now, now + dur + 2)
  setTimeout(scheduleCycle, dur * 1000)
}

export function startAmbience() {
  if (running) return
  running = true
  startDrone()
  startWind()
  scheduleCycle()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(1, ctx.currentTime + 4)
}

export function stopAmbience() {
  if (!running) return
  running = false
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
}
