import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TypoSyncStore, GameState, AudioState, PerformanceMetrics } from '../types'

import { createGameControlActions, type GameControlActions } from './gameControlStore'
import { createAudioActions, type AudioActions } from './audioStore'
import { createKeystrokeActions, type KeystrokeActions } from './keystrokeStore'
import { createMetricsActions, type MetricsActions } from './metricsStore'
import { createSessionActions, type SessionActions } from './sessionStore'
import { createPerformanceActions, type PerformanceActions } from './performanceStore'
import { createImportExportActions, type ImportExportActions } from './importExportStore'

const STORAGE_KEY = 'typo-sync-store'

const initialGameState: GameState = {
  isActive: false,
  isLoading: false,
  gameStartTime: null,
  score: 0,
  feedback: '',
  feedbackColor: '#ffffff',
  gameLoopActive: false,
  isPaused: false,
  pauseStartTime: null,
  totalPauseTime: 0,

  wpm: 0,
  accuracy: 0,
  streak: 0,
  combo: 0,
  maxStreak: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  incorrectKeystrokes: 0,

  averageReactionTime: 0,
  hitTimings: [],

  sessionStartTime: null,
  sessionEndTime: null,
  sessionDuration: 0,
}

const initialAudioState: AudioState = {
  isAnalyzing: false,
  analysisResult: null,
  keystrokeMap: [],
  hiddenNotes: [],
  audioBuffer: null,
  audioContext: null,
  audioSource: null,
  soundEffects: {
    beat: null,
    base: null,
    hiHat: null,
    tambourine: null,
  },
}

const initialPerformanceMetrics: PerformanceMetrics = {
  averageWPM: 0,
  averageAccuracy: 0,
  bestStreak: 0,
  totalSessions: 0,
  totalPlayTime: 0,
  improvementRate: 0,
  confidenceLevel: 0,
  weakKeys: [],
  strongKeys: [],
}

export interface CombinedActions
  extends GameControlActions,
    AudioActions,
    KeystrokeActions,
    MetricsActions,
    SessionActions,
    PerformanceActions,
    ImportExportActions {}

export const useTypoSyncStore = create<TypoSyncStore & CombinedActions>()(
  persist(
    (set, get) => {
      const gameControlActions = createGameControlActions(set, get)
      const audioActions = createAudioActions(set, get)
      const keystrokeActions = createKeystrokeActions(set, get)
      const metricsActions = createMetricsActions(set, get)
      const sessionActions = createSessionActions(set, get)
      const performanceActions = createPerformanceActions(set, get)
      const importExportActions = createImportExportActions(set, get)

      return {
        // Initial state
        gameState: initialGameState,
        audioState: initialAudioState,
        currentSession: null,
        sessionHistory: [],
        performanceMetrics: initialPerformanceMetrics,
        error: null,

        // Combined actions from all modules
        ...gameControlActions,
        ...audioActions,
        ...keystrokeActions,
        ...metricsActions,
        ...sessionActions,
        ...performanceActions,
        ...importExportActions,

        // Persistence methods
        saveToLocalStorage: () => {
          // Handled by persist middleware
        },

        loadFromLocalStorage: () => {
          // Handled by persist middleware
        },
      }
    },
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
        performanceMetrics: state.performanceMetrics,
      }),
    },
  ),
)
