// Core game data types from backend analysis
export interface MelodyNote {
  pitch: string
  start_time: number
  duration: number
}

export interface AnalysisInfo {
  total_beats: number
  total_subdivisions: number
  consolidated_notes: number
  filtered_notes: number
  min_note_duration: number
  subdivision_factor: number
}

export interface AnalysisResult {
  bpm: number
  beat_timestamps: number[]
  melody_map: MelodyNote[]
  analysis_info: AnalysisInfo
}

// Backend API response types
export interface AnalyzeResponse {
  task_id: string
  backend: 'celery' | 'in-memory'
}

export interface SuccessResponse {
  state: 'SUCCESS'
  result: AnalysisResult
}

export interface StatusResponse {
  state: 'PENDING' | 'PROCESSING'
  status: string
}

export interface FailureResponse {
  state: 'FAILURE'
  status: string
}

export type TaskResultResponse = SuccessResponse | StatusResponse | FailureResponse

// Game keystroke types
export interface Keystroke {
  key: string
  startTime: number
  duration: number
  state: 'upcoming' | 'hit' | 'missed' | 'typo'
  type: 'beat' | 'melody' | 'hidden'
  id?: string
}

export interface HiddenNote {
  key: string
  startTime: number
  duration: number
  state: 'upcoming' | 'hit'
  type: 'hidden'
  id?: string
}

// Game configuration
export interface GameConfig {
  NOTE_SPEED_PPS: number
  HIT_ZONE_X: number
  NOTE_FONT: string
  COLORS: {
    UPCOMING: string
    HIT: string
    MISSED: string
    TYPO: string
    HIT_ZONE: string
  }
  TIMING_WINDOWS: {
    SYNC: number
    LATE_EARLY: number
  }
  SCORING: {
    SYNC: number
    LATE_EARLY: number
    TYPO: number
    OFF: number
  }
}

export interface KeystrokeConfig {
  CONFLICT_THRESHOLD: number
  BEAT_DURATION: number
  SYMBOL_CHANCE: number
  SYMBOLS: string[]
  EVERY_NTH_BEAT_ENTER: number
}

// Game state types
export interface GameState {
  isActive: boolean
  isLoading: boolean
  gameStartTime: number | null
  score: number
  feedback: string
  feedbackColor: string
  gameLoopActive: boolean
}

export interface AudioState {
  isAnalyzing: boolean
  analysisResult: AnalysisResult | null
  keystrokeMap: Keystroke[]
  hiddenNotes: HiddenNote[]
  audioBuffer: AudioBuffer | null
  audioContext: AudioContext | null
  soundEffects: {
    base: AudioBuffer | null
    hiHat: AudioBuffer | null
    tambourine: AudioBuffer | null
  }
}

// Hit result types
export type HitResult = 'SYNC' | 'LATE' | 'EARLY' | 'TYPO' | 'OFF'

// Event types
export interface UnifiedEvent {
  type: 'beat' | 'pitch'
  startTime: number
  duration: number
  pitch?: string
}

// Word generation
export interface MockWords {
  [length: number]: string[]
}

// Three.js game renderer props
export interface ThreeGameRendererProps {
  keystrokeMap: Keystroke[]
  gameState: GameState
  gameConfig?: GameConfig
  analysisResult?: AnalysisResult | null
  onKeystrokeUpdate?: (keystroke: Keystroke) => void
}

// Game controls props
export interface GameControlsProps {
  onFileUpload: (file: File) => void
  onGenerateKeystrokeMap: () => void
  onPlayWithMetronome: () => void
  onPlayMelody: () => void
  isAnalyzing: boolean
  canGenerateMap: boolean
  canPlay: boolean
}

// Game stats props
export interface GameStatsProps {
  score: number
  feedback: string
  feedbackColor: string
  keystrokeMap: Keystroke[]
  hiddenNotes: HiddenNote[]
}

// Audio analysis hook return type
export interface AudioAnalysisHook {
  analyzeAudio: (file: File) => Promise<void>
  generateKeystrokeMap: () => void
  audioState: AudioState
  isAnalyzing: boolean
  error: string | null
  resetAnalysis: () => void
}

// Game loop hook return type
export interface GameLoopHook {
  startGame: (
    audioBuffer: AudioBuffer,
    keystrokeMap: Keystroke[],
    hiddenNotes: HiddenNote[],
  ) => void
  stopGame: () => void
  gameState: GameState
  handleKeyPress: (key: string) => void
  currentKeystrokeMap: Keystroke[]
  currentHiddenNotes: HiddenNote[]
  keystrokeUpdateTrigger: number
}

// Keystroke generation result
export interface KeystrokeGenerationResult {
  keystrokeMap: Keystroke[]
  hiddenNotes: HiddenNote[]
}

// Test comparison result for algorithm optimization
export interface AlgorithmComparisonResult {
  legacy: KeystrokeGenerationResult
  optimized: KeystrokeGenerationResult
  similarity: number
  differences: Array<{
    index: number
    legacy: Keystroke | HiddenNote
    optimized: Keystroke | HiddenNote
    reason: string
  }>
}
