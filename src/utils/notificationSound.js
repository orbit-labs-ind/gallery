let audioCtx

/**
 * Clear two-tone notification chime (Web Audio, no asset file).
 */
export function playNotificationChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    if (!audioCtx) audioCtx = new Ctx()
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }

    const now = audioCtx.currentTime

    // Compressor to keep the sound punchy and prevent clipping
    const compressor = audioCtx.createDynamicsCompressor()
    compressor.threshold.value = -6
    compressor.knee.value = 3
    compressor.ratio.value = 4
    compressor.attack.value = 0.001
    compressor.release.value = 0.1
    compressor.connect(audioCtx.destination)

    // Helper to create one tone in the chime
    const addTone = (freq, startTime, duration, peakGain) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'triangle'   // fuller/richer than sine
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.01)   // fast attack
      gain.gain.exponentialRampToValueAtTime(peakGain * 0.6, startTime + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration) // decay

      osc.connect(gain)
      gain.connect(compressor)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    // First tone: higher pitch
    addTone(1047, now, 0.35, 0.55)         // C6
    // Second tone: lower pitch, slightly delayed
    addTone(784, now + 0.12, 0.4, 0.45)   // G5

  } catch {
    /* ignore */
  }
}