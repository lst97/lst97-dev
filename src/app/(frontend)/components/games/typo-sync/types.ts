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
  lyrics?: string
}

// Backend API response types
export interface AnalyzeResponse {
  task_id: string
  backend: 'celery' | 'in-memory'
  cache_hit: boolean
  queue_position?: number
  estimated_wait_time_minutes?: number
}

export interface SuccessResponse {
  state: 'SUCCESS'
  result: AnalysisResult
}

export interface StatusResponse {
  state: 'PENDING' | 'PROCESSING'
  status: string
  queue_position?: number
  estimated_wait_time_minutes?: number
}

export interface FailureResponse {
  state: 'FAILURE' | 'ERROR' | 'NOT_FOUND'
  status: string
}

export type TaskResultResponse = SuccessResponse | StatusResponse | FailureResponse

// Priority levels for audio analysis
export type Priority = 'high' | 'normal' | 'batch'

// Game keystroke types
export interface Keystroke {
  key: string
  startTime: number
  duration: number
  state: 'upcoming' | 'hit' | 'missed' | 'typo'
  type: 'beat' | 'melody' | 'hidden'
  id?: string
  timingAccuracy?: 'sync' | 'early' | 'late' | 'miss' // For animation effects
  hitTiming?: number // Actual timing difference for animation intensity
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
    SYNC: string
    LATE: string
    EARLY: string
    OFF: string
  }
  TIMING_WINDOWS: {
    SYNC: number
    LATE_EARLY: number
    HIT: number
    TYPO: number
    IGNORE: number
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

//  Game state types
export interface GameState {
  isActive: boolean
  isLoading: boolean
  gameStartTime: number | null
  score: number
  feedback: string
  feedbackColor: string
  gameLoopActive: boolean
  isPaused: boolean
  pauseStartTime: number | null
  totalPauseTime: number

  // Enhanced metrics
  wpm: number
  accuracy: number
  streak: number
  combo: number
  maxStreak: number
  totalKeystrokes: number
  correctKeystrokes: number
  incorrectKeystrokes: number

  // Timing data
  averageReactionTime: number
  hitTimings: number[] // Array of timing differences for histogram

  // Session data
  sessionStartTime: number | null
  sessionEndTime: number | null
  sessionDuration: number
}

export interface AudioState {
  isAnalyzing: boolean
  analysisResult: AnalysisResult | null
  keystrokeMap: Keystroke[]
  hiddenNotes: HiddenNote[]
  audioBuffer: AudioBuffer | null
  audioContext: AudioContext | null
  audioSource: AudioBufferSourceNode | null
  soundEffects: SoundEffects
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
export interface GameRendererProps {
  keystrokeMap: Keystroke[]
  gameState: GameState
  gameConfig?: GameConfig
  analysisResult?: AnalysisResult | null
  onKeystrokeUpdate?: (keystroke: Keystroke) => void
  onPlayAgain?: () => void
  onStopGame?: () => void
}

// Game controls props
export interface GameControlsProps {
  onFileUpload: (file: File, turnstileToken?: string) => void
  onRegenerateKeystrokeMap: () => void
  onStartGame: () => void
  onPauseGame: () => void
  onResumeGame: () => void
  onStopGame: () => void
  isAnalyzing: boolean
  hasKeystrokeMap: boolean
  canPlay: boolean
  gameState: {
    isActive: boolean
    isPaused: boolean
  }
  uploadedFileName: string
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

// Enhanced session and statistics types
export interface SessionStats {
  id: string
  startTime: number
  endTime: number
  duration: number
  score: number
  wpm: number
  accuracy: number
  streak: number
  maxStreak: number
  totalKeystrokes: number
  correctKeystrokes: number
  incorrectKeystrokes: number
  averageReactionTime: number
  hitTimings: number[]
  songName?: string
  difficulty?: string
}

export interface PerformanceMetrics {
  averageWPM: number
  averageAccuracy: number
  bestStreak: number
  totalSessions: number
  totalPlayTime: number
  improvementRate: number
  confidenceLevel: number
  weakKeys: string[]
  strongKeys: string[]
}

export interface TimingHistogram {
  earlyHits: number
  syncHits: number
  lateHits: number
  totalHits: number
  averageTiming: number
  standardDeviation: number
}

// Import Zustand types for proper typing
import type { StateCreator } from 'zustand'

// Zustand store state setter and getter types
export type ZustandSetter<T> = Parameters<StateCreator<T>>[0]
export type ZustandGetter<T> = Parameters<StateCreator<T>>[1]

// Sound effects interface
export interface SoundEffects {
  base: AudioBuffer | null
  hiHat: AudioBuffer | null
  tambourine: AudioBuffer | null
  beat: AudioBuffer | null
}

// Zustand store types
export interface TypoSyncStore {
  // Game state
  gameState: GameState
  audioState: AudioState

  // Session management
  currentSession: SessionStats | null
  sessionHistory: SessionStats[]
  performanceMetrics: PerformanceMetrics

  // Error handling
  error: string | null
  setError: (error: string | null) => void

  // Actions
  startGame: (
    audioBuffer: AudioBuffer,
    keystrokeMap: Keystroke[],
    hiddenNotes: HiddenNote[],
  ) => Promise<void>
  stopGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void

  // Audio analysis actions
  analyzeAudio: (file: File) => Promise<void>
  generateKeystrokeMap: () => void
  setAnalyzing: (isAnalyzing: boolean) => void
  setAnalysisResult: (result: AnalysisResult | null) => void
  setKeystrokeMap: (keystrokeMap: Keystroke[]) => void
  setHiddenNotes: (hiddenNotes: HiddenNote[]) => void
  setAudioBuffer: (audioBuffer: AudioBuffer | null) => void
  setAudioContext: (audioContext: AudioContext | null) => void

  // Keystroke handling
  handleKeyPress: (key: string, currentTime: number) => void
  updateKeystrokeState: (keystroke: Keystroke, newState: Keystroke['state']) => void
  updateKeystrokeStateWithTiming: (
    keystroke: Keystroke,
    newState: Keystroke['state'],
    timingAccuracy: 'sync' | 'early' | 'late' | 'miss',
    hitTiming: number,
  ) => void

  // Statistics actions
  calculateWPM: () => void
  calculateAccuracy: () => void
  updateStreak: (isCorrect: boolean) => void
  addHitTiming: (timing: number) => void

  // Session actions
  startSession: () => void
  endSession: () => void
  saveSession: () => void
  loadSessionHistory: () => void

  // Performance tracking
  updatePerformanceMetrics: () => void
  calculateConfidenceLevel: () => number
  getTimingHistogram: () => TimingHistogram

  // Sound effects
  playKeystrokeSound: (key: string) => void
  playHiddenNoteSound: () => void
  loadSoundEffects: () => Promise<void>

  // Miss detection
  startMissDetection: () => void
  stopMissDetection: () => void
  checkForMissedKeystrokes: () => void

  // Import/Export functionality
  importBeatMap: (beatMapData: unknown) => void
  importKeystrokeMap: (keystrokeMapData: unknown) => void
  exportGameMap: () => GameMapExport | null
  importGameMap: (
    gameMapData: GameMapExport,
    currentMusicFile?: File,
  ) => Promise<GameMapValidationResult>

  // Persistence
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

// Map Import/Export Types
export interface GameMapExport {
  version: string
  exportedAt: string
  musicHash: string
  musicName: string
  musicDuration: number
  bpm: number
  beat_timestamps: number[]
  melody_map: MelodyNote[]
  keystroke_map?: Keystroke[]
  hidden_notes?: HiddenNote[]
  analysis_info: AnalysisInfo
  lyrics?: string
  checksum: string
}

// Raw imported game map data (before validation)
export interface RawGameMapData {
  version?: unknown
  exportedAt?: unknown
  musicHash?: unknown
  musicName?: unknown
  musicDuration?: unknown
  bpm?: unknown
  beat_timestamps?: unknown
  melody_map?: unknown
  keystroke_map?: unknown
  hidden_notes?: unknown
  analysis_info?: unknown
  lyrics?: unknown
  checksum?: unknown
  [key: string]: unknown
}

export interface GameMapValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  hashMatch: boolean
  timestampErrors: string[]
}

export interface CloudProcessingState {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

// Extended GameControlsProps to include new functionality
export interface ExtendedGameControlsProps extends GameControlsProps {
  onExportMap: () => void
  onImportMap: (file: File) => void
  cloudProcessingEnabled: boolean
  onCloudProcessingToggle: (enabled: boolean) => void
  isAudioLoadedForPreAnalyzed: boolean
  mapFileName?: string
  isDemoLoading?: boolean
  priority?: Priority
  onPriorityChange?: (priority: Priority) => void
}
