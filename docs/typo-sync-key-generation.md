# TypoSync Keystroke Map Generation

## Overview

TypoSync converts raw musical information (beats & melodic notes) into a stream of **typing keystrokes** that feel like natural sentences. The generation process occurs in the backend (FastAPI + Librosa) but the same data-flow is mirrored in the front-end utils for tests & visualization.

```bash
Audio File  ─┬─► Beat Detector  ─┐
            │                  │
            │                  ├─►  Unified Event List ─┐
            └─► Melody Tracker ─┘                        │
                                                      ▼
                                         Keystroke Map Generator
                                                      ▼
                                        Typo / Hidden Notes Augmenter
                                                      ▼
                                              Final Map JSON
```

* **Beat Detector** – extracts `beat_timestamps[]` (seconds)
* **Melody Tracker** – extracts `melody_map[]` with `{ pitch, start_time, duration }`
* **Unified Event List** – merges both arrays, tagging each event as `beat` or `pitch`.
* **Keystroke Map Generator** – assigns actual characters & delimiters following the rules below.
* **Augmenter** – creates *hidden* bonus notes from unused beats and tags typos.

---

## Detailed Steps

### 1. Configuration Constants (`keystrokeGeneration.ts`)

```typescript
export const KEYSTROKE_CONFIG: KeystrokeConfig = {
  CONFLICT_THRESHOLD: 0.05, // 50ms conflict threshold
  BEAT_DURATION: 0.1, // Default beat duration
  SYMBOL_CHANCE: 0.2, // 20% chance to add symbols
  SYMBOLS: ['.', ','], // Available symbols
  EVERY_NTH_BEAT_ENTER: 8, // Every 8th beat becomes Enter
}
```

### 2. Create Unified Events

The `createUnifiedEvents` function takes `beatTimestamps` and `melodyMap` and merges them into a single `unifiedEvents` array. Each event is an object with a `type` ('beat' or 'pitch'), `startTime`, and `duration`.

### 3. Generate Keystroke Map (Linear Time)

The core logic resides in `generateKeystrokeMapLinear`, which processes the unified events in linear time using a two-pointer sweep. This is a significant optimization over the previous sorting-based approach.

1. **Separate and Sort**: Pitch and beat events are separated and sorted by `startTime`.
2. **Two-Pointer Sweep**: The algorithm iterates through beat events and uses a second pointer (`melodyIdx`) to process pitch events that occur before the current beat.
3. **Word Buffering**: Pitch events are collected into a `wordBuffer`.
4. **Conflict Resolution**: Before placing a delimiter (a space or enter key) for a beat, it checks for conflicts with nearby pitch events. If a conflict exists (i.e., a pitch event is too close to the beat), the beat is skipped and later turned into a "hidden note".
5. **Delimiter Placement**: If there's no conflict, the buffered word is "flushed" (converted to characters from a random word), and a delimiter is placed. The `lastWasDelimiter` flag prevents consecutive delimiters.
6. **Flush Remaining Words**: After all beats are processed, any remaining pitches in the `wordBuffer` are flushed.

This approach avoids multiple sorting passes and intermediate array creation, making it much more efficient.

#### Visual Example of Two-Pointer Sweep

Let's consider a simplified example with `P` for Pitch events and `B` for Beat events, sorted by `startTime`:

`Pitch Events: [P1, P2, P3, P4]`
`Beat Events:  [B1, B2, B3, B4]`

**Initial State:**
`melodyIdx = 0`
`wordBuffer = []`
`keystrokes = []`

**Iteration 1 (Processing B1):**

* `P1` is before `B1 - CONFLICT_THRESHOLD`. `wordBuffer` becomes `[P1]`. `melodyIdx` is now 1.
* Check conflict for `B1` with `P2`. Assume no conflict.
* `flushWord()`: `wordBuffer` (`[P1]`) is flushed. A random word of length 1 (e.g., "a") is chosen. `keystrokes` becomes `[ {key: 'a', type: 'melody', ...} ]`.
* A delimiter (e.g., `[Space]`) is added for `B1`. `keystrokes` becomes `[ {key: 'a', ...}, {key: '[Space]', type: 'beat', ...} ]`.

**Iteration 2 (Processing B2):**

* `P2` is before `B2 - CONFLICT_THRESHOLD`. `wordBuffer` becomes `[P2]`. `melodyIdx` is now 2.
* Check conflict for `B2` with `P3`. Assume no conflict.
* `flushWord()`: `wordBuffer` (`[P2]`) is flushed. A random word of length 1 (e.g., "b") is chosen. `keystrokes` becomes `[ ..., {key: 'b', ...} ]`.
* A delimiter (e.g., `[Space]`) is added for `B2`. `keystrokes` becomes `[ ..., {key: 'b', ...}, {key: '[Space]', type: 'beat', ...} ]`.

...and so on. This process continues, efficiently interleaving melody notes and beat delimiters while handling conflicts and word generation in a single pass.

### 4. Hidden Notes Generation

Any `beatTimestamps` that were not used to create delimiters (due to conflicts or being filtered out) are converted into `hiddenNotes`. These are optional bonus targets for the player.

### 5. Final Output

The `generateCompleteKeystrokeMapOptimized` function orchestrates this process, returning a `KeystrokeGenerationResult` object containing the final `keystrokeMap` and `hiddenNotes`.

---

## Data Structures

```ts
type KeystrokeState = 'upcoming' | 'hit' | 'missed' | 'typo'

type KeystrokeType  = 'beat' | 'melody' | 'delimiter' | 'hidden'

interface Keystroke {
  key: string              // e.g. 'a', '[Space]', '[Enter]'
  startTime: number        // seconds relative to song start
  duration: number         // mostly visual, 0.05-0.10 s
  state: KeystrokeState
  type: KeystrokeType
}
```

---

## Front-End Flow

1. **Audio Upload ➜ Analysis** (`useAudioAnalysis` hook)
    * Calls backend `/analyze` → receives `beat_timestamps`, `melody_map`.
2. **Generate Map** – `audioAnalysis.generateKeystrokeMap()` runs the algorithm above in the browser for instant preview & testing.
3. **Play Game** – `useGameLoop.startGame()` starts Web Audio playback and feeds the map to `<ThreeGameRenderer>`.
4. **Renderer** uses `keystroke.startTime` vs `gameTime` to position notes and handles hit / miss updates.

---

## Complexity Analysis

### Legacy `generateKeystrokeMapWithWordSpacingLegacy` (O((P+B) log (P+B)))

* **Sorting**: Multiple sorts on combined arrays of pitches (P) and beats (B). The dominant cost is `O((P+B) log (P+B))`.
* **Memory**: Creates several intermediate arrays, leading to higher memory usage.
* **Passes**: Multiple passes over the data to filter, group, and insert.

### Optimized `generateKeystrokeMapLinear` (O(P log P + B log B))

* **Sorting**: Sorts pitch and beat events separately at the beginning: `O(P log P + B log B)`.
* **Generation**: The main keystroke generation is a single linear pass: `O(P + B)`.
* **Overall Complexity**: The initial sorting is the bottleneck, so the total complexity is `O(P log P + B log B)`. This is asymptotically better than the legacy approach.
* **Memory**: Significantly lower memory usage due to the single-pass generation and fewer intermediate arrays.
* **Practical Impact**: The optimized version is faster and more memory-efficient, especially for songs with a large number of notes and beats. This results in a quicker loading time and a smoother user experience.
