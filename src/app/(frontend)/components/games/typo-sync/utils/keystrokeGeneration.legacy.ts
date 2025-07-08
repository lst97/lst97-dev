import type {
  MelodyNote,
  UnifiedEvent,
  Keystroke,
  HiddenNote,
  KeystrokeGenerationResult,
  KeystrokeConfig,
} from '../types'
import { mockWords } from './mockWords'

/**
 * Configuration constants (same as main generator)
 */
export const KEYSTROKE_CONFIG: KeystrokeConfig = {
  CONFLICT_THRESHOLD: 0.05,
  BEAT_DURATION: 0.1,
  SYMBOL_CHANCE: 0.2,
  SYMBOLS: ['.', ','],
  EVERY_NTH_BEAT_ENTER: 8,
}

/**
 * Create unified events list from beats & melody
 */
function createUnifiedEvents(beatTimestamps: number[], melodyMap: MelodyNote[]): UnifiedEvent[] {
  const unified: UnifiedEvent[] = []
  beatTimestamps.forEach((t) =>
    unified.push({ type: 'beat', startTime: t, duration: KEYSTROKE_CONFIG.BEAT_DURATION }),
  )
  melodyMap.forEach((note) =>
    unified.push({
      type: 'pitch',
      startTime: note.start_time,
      duration: note.duration,
      pitch: note.pitch,
    }),
  )
  return unified
}

/**
 * Legacy inner generator – unchanged
 */
function generateKeystrokeMapWithWordSpacingLegacy(unifiedEvents: UnifiedEvent[]): Keystroke[] {
  const pitchEvents = unifiedEvents
    .filter((e) => e.type === 'pitch')
    .sort((a, b) => a.startTime - b.startTime)
  const beatEvents = unifiedEvents
    .filter((e) => e.type === 'beat')
    .sort((a, b) => a.startTime - b.startTime)

  const keystrokeMap: Keystroke[] = []

  // 1. Insert beats as delimiters (10% Enter)
  beatEvents.forEach((beat) => {
    const delimiterKey = Math.random() < 0.1 ? '[Enter]' : '[Space]'
    keystrokeMap.push({
      key: delimiterKey,
      startTime: beat.startTime,
      duration: beat.duration,
      state: 'upcoming',
      type: 'beat',
    })
  })

  // 2. Insert melody placeholders
  pitchEvents.forEach((pitch) => {
    keystrokeMap.push({
      key: 'm',
      startTime: pitch.startTime,
      duration: 0.05,
      state: 'upcoming',
      type: 'melody',
    })
  })

  // 3. Sort by time
  keystrokeMap.sort((a, b) => a.startTime - b.startTime)

  // 4. Remove beat–melody conflicts
  const filtered = keystrokeMap.filter((ev, idx, arr) => {
    if (ev.type !== 'beat') return true
    const prev = arr[idx - 1]
    const next = arr[idx + 1]
    let conflict = false
    if (
      prev &&
      prev.type === 'melody' &&
      Math.abs(ev.startTime - prev.startTime) < KEYSTROKE_CONFIG.CONFLICT_THRESHOLD
    )
      conflict = true
    if (
      next &&
      next.type === 'melody' &&
      Math.abs(ev.startTime - next.startTime) < KEYSTROKE_CONFIG.CONFLICT_THRESHOLD
    )
      conflict = true
    return !conflict
  })

  // 5. Remove consecutive delimiters & build words
  const final: Keystroke[] = []
  let lastDelimiter = false
  let currentMelody: Keystroke[] = []

  const flushWord = () => {
    if (!currentMelody.length) return
    const len = currentMelody.length
    const wordList = mockWords[len] || mockWords[Math.min(len, 12)]
    const pick = wordList[Math.floor(Math.random() * wordList.length)]
    currentMelody.forEach((mel, i) => {
      if (i < pick.length) {
        final.push({
          key: pick[i],
          startTime: mel.startTime,
          duration: 0.05,
          state: 'upcoming',
          type: 'melody',
        })
      }
    })
    currentMelody = []
  }

  filtered.forEach((ev) => {
    if (ev.type === 'melody') {
      currentMelody.push(ev)
      lastDelimiter = false
    } else if (!lastDelimiter) {
      flushWord()
      final.push(ev)
      lastDelimiter = true
    }
  })
  flushWord()

  final.sort((a, b) => a.startTime - b.startTime)
  return final
}

/**
 * Hidden notes helper – duplicated here for self-containment
 */
function generateHiddenNotes(beatTimestamps: number[], map: Keystroke[]): HiddenNote[] {
  const delimiterTimes = new Set(
    map.filter((k) => k.type === 'beat').map((k) => k.startTime.toFixed(4)),
  )
  return beatTimestamps
    .filter((t) => !delimiterTimes.has(t.toFixed(4)))
    .map((t) => ({
      key: '[Space]',
      startTime: t,
      duration: 0.1,
      state: 'upcoming',
      type: 'hidden',
    }))
}

/**
 * Public legacy generator
 */
export function generateCompleteKeystrokeMapLegacy(
  bpm: number,
  beatTimestamps: number[],
  melodyMap: MelodyNote[],
): KeystrokeGenerationResult {
  const unified = createUnifiedEvents(beatTimestamps, melodyMap)
  const keystrokeMap = generateKeystrokeMapWithWordSpacingLegacy(unified)
  const hiddenNotes = generateHiddenNotes(beatTimestamps, keystrokeMap)
  return { keystrokeMap, hiddenNotes }
}
