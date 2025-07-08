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
 * Configuration constants for keystroke map generation
 */
export const KEYSTROKE_CONFIG: KeystrokeConfig = {
  CONFLICT_THRESHOLD: 0.05, // 50ms conflict threshold
  BEAT_DURATION: 0.1, // Default beat duration
  SYMBOL_CHANCE: 0.2, // 20% chance to add symbols
  SYMBOLS: ['.', ','], // Available symbols
  EVERY_NTH_BEAT_ENTER: 8, // Every 8th beat becomes Enter
}

/**
 * Step 1: Create unified event array from beats and melody
 */
function createUnifiedEvents(beatTimestamps: number[], melodyMap: MelodyNote[]): UnifiedEvent[] {
  const unifiedEvents: UnifiedEvent[] = []

  // Process beat timestamps
  beatTimestamps.forEach((timestamp) => {
    unifiedEvents.push({
      type: 'beat',
      startTime: timestamp,
      duration: KEYSTROKE_CONFIG.BEAT_DURATION,
    })
  })

  // Process melody map
  melodyMap.forEach((note) => {
    unifiedEvents.push({
      type: 'pitch',
      startTime: note.start_time,
      duration: note.duration,
      pitch: note.pitch,
    })
  })

  return unifiedEvents
}

/**
 * Generate keystroke map in O(P + B) using two-pointer sweep.
 */
function generateKeystrokeMapLinear(unifiedEvents: UnifiedEvent[]): Keystroke[] {
  const pitchEvents = unifiedEvents
    .filter((e) => e.type === 'pitch')
    .sort((a, b) => a.startTime - b.startTime)
  const beatEvents = unifiedEvents
    .filter((e) => e.type === 'beat')
    .sort((a, b) => a.startTime - b.startTime)

  const keystrokes: Keystroke[] = []
  let melodyIdx = 0
  let wordBuffer: UnifiedEvent[] = []
  let lastWasDelimiter = false
  const flushWord = () => {
    if (!wordBuffer.length) return
    const len = Math.min(wordBuffer.length, 12)
    const wordList = mockWords[len] || mockWords[12]
    const pick = wordList[Math.floor(Math.random() * wordList.length)]
    wordBuffer.forEach((mel, i) => {
      if (i < pick.length) {
        keystrokes.push({
          key: pick[i],
          startTime: mel.startTime,
          duration: 0.05,
          state: 'upcoming',
          type: 'melody',
        })
        lastWasDelimiter = false // After a character, allow delimiter again
      }
    })
    wordBuffer = []
  }

  const T = KEYSTROKE_CONFIG.CONFLICT_THRESHOLD
  for (const beat of beatEvents) {
    // Advance melodyIdx to events that are before current beat - T
    while (
      melodyIdx < pitchEvents.length &&
      pitchEvents[melodyIdx].startTime < beat.startTime - T
    ) {
      wordBuffer.push(pitchEvents[melodyIdx])
      melodyIdx++
    }

    // Check conflict with the immediate next melody event (if exists)
    const conflict =
      melodyIdx < pitchEvents.length &&
      Math.abs(pitchEvents[melodyIdx].startTime - beat.startTime) < T

    if (conflict) {
      // Skip this beat – convert to delimiter later via hidden note logic
      continue
    }

    // Emit buffered word before inserting delimiter
    flushWord()

    // Only emit delimiter if lastWasDelimiter is false
    if (!lastWasDelimiter) {
      const delimKey = Math.random() < 0.1 ? '[Enter]' : '[Space]'
      keystrokes.push({
        key: delimKey,
        startTime: beat.startTime,
        duration: KEYSTROKE_CONFIG.BEAT_DURATION,
        state: 'upcoming',
        type: 'beat',
      })
      lastWasDelimiter = true
    }
    // If lastWasDelimiter is true, skip this delimiter
  }

  // Push any remaining melody events
  while (melodyIdx < pitchEvents.length) {
    wordBuffer.push(pitchEvents[melodyIdx++])
  }
  flushWord()

  // keystrokes are emitted in chronological order – no final sort needed
  return keystrokes
}

/**
 * Generate hidden notes from unused beat timestamps
 */
function generateHiddenNotes(beatTimestamps: number[], keystrokeMap: Keystroke[]): HiddenNote[] {
  // Get delimiter times from the keystroke map
  const delimiterTimes = new Set(
    keystrokeMap.filter((k) => k.type === 'beat').map((k) => k.startTime.toFixed(4)), // Use toFixed for float comparison
  )

  // Generate hidden notes from unused beat timestamps
  const hiddenNotes: HiddenNote[] = beatTimestamps
    .filter((t) => !delimiterTimes.has(t.toFixed(4)))
    .map((t) => ({
      key: '[Space]',
      startTime: t,
      duration: 0.1,
      state: 'upcoming',
      type: 'hidden',
    }))

  console.log(`Generated ${hiddenNotes.length} hidden notes`)
  return hiddenNotes
}

/**
 * Optimized version of the complete keystroke map generation
 * Improved performance while maintaining the same output quality
 */
export function generateCompleteKeystrokeMapOptimized(
  bpm: number,
  beatTimestamps: number[],
  melodyMap: MelodyNote[],
): KeystrokeGenerationResult {
  // Step 1: create unified events
  const unifiedEvents = createUnifiedEvents(beatTimestamps, melodyMap)
  // Step 2: linear generator
  const keystrokeMap = generateKeystrokeMapLinear(unifiedEvents)
  // Step 3: hidden notes (reuse existing helper)
  const hiddenNotes = generateHiddenNotes(beatTimestamps, keystrokeMap)
  return { keystrokeMap, hiddenNotes }
}

// Default export uses the optimized linear version
export const generateCompleteKeystrokeMap = generateCompleteKeystrokeMapOptimized
