import type {
  GameState,
  HiddenNote,
  Keystroke,
  TypoSyncStore,
  ZustandGetter,
  ZustandSetter,
} from '../types'

export interface GameControlActions {
  startGame: (
    audioBuffer: AudioBuffer,
    keystrokeMap: Keystroke[],
    hiddenNotes: HiddenNote[],
  ) => Promise<void>
  stopGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
}

export const createGameControlActions = (
  set: ZustandSetter<TypoSyncStore>,
  get: ZustandGetter<TypoSyncStore>,
): GameControlActions => ({
  startGame: async (audioBuffer, keystrokeMap, hiddenNotes) => {
    const now = performance.now()
    const { audioState } = get()

    try {
      // Reset keystroke map states for replay
      const resetKeystrokeMap = keystrokeMap.map((k) => ({
        ...k,
        state: 'upcoming' as const,
        timingAccuracy: undefined,
        hitTiming: undefined,
      }))

      const resetHiddenNotes = hiddenNotes.map((h) => ({
        ...h,
        state: 'upcoming' as const,
      }))

      // Create audio source and start playback
      if (audioState.audioContext && audioBuffer) {
        try {
          // Resume audio context if it's suspended (required by browser policies)
          if (audioState.audioContext.state === 'suspended') {
            await audioState.audioContext.resume()
          }

          const audioSource = audioState.audioContext.createBufferSource()
          audioSource.buffer = audioBuffer
          audioSource.connect(audioState.audioContext.destination)

          // Set up game end handler
          audioSource.onended = () => {
            const currentTime = performance.now()
            const gameRunTime = currentTime - now

            // Don't stop the game if audio ended too quickly (likely an error)
            if (gameRunTime < 2000) {
              console.warn('⚠️ Audio ended too quickly, continuing game without audio')
              return
            }

            get().stopGame()
          }

          // Add error handler
          audioSource.addEventListener('error', (event: Event) => {
            console.error('🔊 Audio playback error:', event)
            // Don't stop the game on audio error, let it continue without sound
          })

          audioSource.start(0)

          // Store audio source for stopping later
          set((state: TypoSyncStore) => ({
            audioState: {
              ...state.audioState,
              audioSource,
            },
          }))
        } catch (error) {
          console.error('🚨 Failed to start audio playback:', error)
          // Continue with the game even if audio fails
        }
      } else {
        console.warn('🔇 No audio context or buffer available - running in silent mode')
      }

      set((state: TypoSyncStore) => ({
        gameState: {
          ...state.gameState,
          isActive: true,
          isLoading: false,
          gameStartTime: now,
          score: 0,
          feedback: '',
          feedbackColor: '#ffffff',
          gameLoopActive: true,
          isPaused: false,
          pauseStartTime: null,
          totalPauseTime: 0,
          sessionStartTime: now,

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
        },
        audioState: {
          ...state.audioState,
          audioBuffer,
          keystrokeMap: resetKeystrokeMap,
          hiddenNotes: resetHiddenNotes,
        },
      }))

      get().startSession()
      get().startMissDetection()
    } catch (error) {
      console.error('Error starting game:', error)
      get().setError(
        'Failed to start game: ' + (error instanceof Error ? error.message : 'Unknown error'),
      )
    }
  },

  stopGame: () => {
    const { audioState, gameState } = get()

    // Prevent multiple calls to stopGame
    if (!gameState.isActive) {
      return
    }

    if (audioState.audioSource) {
      try {
        audioState.audioSource.stop()
      } catch {
        console.warn('Audio source already stopped or invalid')
      }
    }

    const endTime = Date.now()

    set((state: TypoSyncStore) => ({
      gameState: {
        ...state.gameState,
        isActive: false,
        gameLoopActive: false,
        sessionEndTime: endTime,
        sessionDuration: state.gameState.sessionStartTime
          ? endTime - state.gameState.sessionStartTime
          : 0,
      },
      audioState: {
        ...state.audioState,
        audioSource: null,
      },
    }))

    get().stopMissDetection()
    get().endSession()
    get().saveSession()
  },

  pauseGame: () => {
    const { audioState } = get()
    const pauseTime = performance.now()

    if (audioState.audioContext?.state === 'running') {
      audioState.audioContext.suspend()
    }

    set((state: TypoSyncStore) => ({
      gameState: {
        ...state.gameState,
        isPaused: true,
        pauseStartTime: pauseTime,
      },
    }))

    get().stopMissDetection()
  },

  resumeGame: () => {
    const { audioState, gameState } = get()
    const resumeTime = performance.now()

    if (audioState.audioContext?.state === 'suspended') {
      audioState.audioContext.resume()
    }

    const pauseDuration = gameState.pauseStartTime ? resumeTime - gameState.pauseStartTime : 0

    set((state: TypoSyncStore) => ({
      gameState: {
        ...state.gameState,
        isPaused: false,
        pauseStartTime: null,
        totalPauseTime: state.gameState.totalPauseTime + pauseDuration,
      },
    }))

    get().startMissDetection()
  },

  resetGame: () => {
    get().stopMissDetection()

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

    set((state: TypoSyncStore) => ({
      gameState: initialGameState,
      audioState: {
        ...state.audioState,
        keystrokeMap: [],
        hiddenNotes: [],
      },
    }))
  },
})
