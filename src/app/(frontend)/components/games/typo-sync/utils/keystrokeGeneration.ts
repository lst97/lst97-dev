import type {
  MelodyNote,
  UnifiedEvent,
  Keystroke,
  HiddenNote,
  KeystrokeGenerationResult,
  KeystrokeConfig,
} from '../types'
import { generateWordForKeystroke } from './wordGeneration'

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
    const targetLength = Math.min(wordBuffer.length, 12)
    const word = generateWordForKeystroke(targetLength)

    wordBuffer.forEach((mel, i) => {
      if (i < word.length) {
        keystrokes.push({
          key: word[i],
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
  let beatCounter = 0 // Track beat count for [Enter] placement
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
      beatCounter++
      // Use EVERY_NTH_BEAT_ENTER configuration for more predictable [Enter] placement
      const delimKey =
        beatCounter % KEYSTROKE_CONFIG.EVERY_NTH_BEAT_ENTER === 0 ? '[Enter]' : '[Space]'
      keystrokes.push({
        key: delimKey,
        startTime: beat.startTime,
        duration: KEYSTROKE_CONFIG.BEAT_DURATION,
        state: 'upcoming',
        type: 'beat',
      })
      lastWasDelimiter = true

      console.log(
        `📝 Generated delimiter: ${delimKey} at ${beat.startTime.toFixed(2)}s (beat #${beatCounter})`,
      )
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
 * Add hidden notes directly to the keystroke map
 * Hidden notes are placed at beat timestamps that are NOT too close to existing keystrokes
 * Keys have higher priority - hidden notes will not replace or conflict with keys
 */
function addHiddenNotesToKeystrokeMap(
  keystrokeMap: Keystroke[], 
  beatTimestamps: number[]
): Keystroke[] {
  const CONFLICT_THRESHOLD = 0.15 // 150ms - hidden notes must be this far from any key

  // Get all existing keystroke times (melody and beat keys)
  const existingKeystrokeTimes = keystrokeMap.map((k) => k.startTime)

  // Filter beat timestamps to find valid positions for hidden notes
  const validHiddenNoteTimes = beatTimestamps.filter((beatTime) => {
    // Check if this beat is too close to any existing keystroke
    const tooCloseToKeystroke = existingKeystrokeTimes.some(
      (keystrokeTime) => Math.abs(beatTime - keystrokeTime) < CONFLICT_THRESHOLD,
    )

    return !tooCloseToKeystroke
  })

  // Create hidden note keystrokes
  const hiddenNoteKeystrokes: Keystroke[] = validHiddenNoteTimes.map((t) => ({
    key: '[Space]',
    startTime: t,
    duration: 0.1,
    state: 'upcoming',
    type: 'hidden',
  }))

  // Merge hidden notes with existing keystrokes and sort by time
  const unifiedKeystrokeMap = [...keystrokeMap, ...hiddenNoteKeystrokes].sort(
    (a, b) => a.startTime - b.startTime
  )

  console.log(
    `🟣 Added ${hiddenNoteKeystrokes.length} hidden notes to keystroke map (filtered out ${beatTimestamps.length - validHiddenNoteTimes.length} beats too close to keys)`,
  )
  console.log(`📊 Total unified keystroke map: ${unifiedKeystrokeMap.length} items`)
  console.log(`📊 Breakdown: ${keystrokeMap.length} keys + ${hiddenNoteKeystrokes.length} hidden notes`)
  
  return unifiedKeystrokeMap
}

/**
 * Optimized version of the complete keystroke map generation with unified keystroke map
 * Returns a single keystrokeMap containing both regular keys and hidden notes
 */
export function generateCompleteKeystrokeMapOptimized(
  bpm: number,
  beatTimestamps: number[],
  melodyMap: MelodyNote[],
): KeystrokeGenerationResult {
  console.log('🗺️ Starting unified keystroke map generation:', {
    bpm,
    beatCount: beatTimestamps.length,
    melodyCount: melodyMap.length,
  })

  // Step 1: create unified events for melody and beat processing
  const unifiedEvents = createUnifiedEvents(beatTimestamps, melodyMap)
  console.log(`📊 Created ${unifiedEvents.length} unified events`)

  // Step 2: generate regular keystrokes (melody + beat delimiters)
  const regularKeystrokes = generateKeystrokeMapLinear(unifiedEvents)
  console.log(`⌨️ Generated ${regularKeystrokes.length} regular keystrokes`)

  // Step 3: add hidden notes to create unified keystroke map
  // Keys have priority - hidden notes won't be placed too close to existing keys
  const unifiedKeystrokeMap = addHiddenNotesToKeystrokeMap(regularKeystrokes, beatTimestamps)
  
  console.log(`✅ Final unified keystroke map: ${unifiedKeystrokeMap.length} total items`)
  console.log(`📊 Types: melody=${unifiedKeystrokeMap.filter(k => k.type === 'melody').length}, beat=${unifiedKeystrokeMap.filter(k => k.type === 'beat').length}, hidden=${unifiedKeystrokeMap.filter(k => k.type === 'hidden').length}`)

  // Return unified keystroke map with empty hiddenNotes array (legacy compatibility)
  return { 
    keystrokeMap: unifiedKeystrokeMap, 
    hiddenNotes: [] // No longer used - all notes are in keystrokeMap
  }
}

// Default export uses the optimized linear version
export const generateCompleteKeystrokeMap = generateCompleteKeystrokeMapOptimized
