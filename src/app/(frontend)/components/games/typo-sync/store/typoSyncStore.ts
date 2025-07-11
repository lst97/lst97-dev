import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioAnalysisService, safeServiceCall } from '../services/audioAnalysisService'
import { generateCompleteKeystrokeMap } from '../utils/keystrokeGeneration'
import type {
  TypoSyncStore,
  GameState,
  AudioState,
  SessionStats,
  PerformanceMetrics,
  TimingHistogram,
  Keystroke,
  HiddenNote,
  AnalysisResult,
} from '../types'

const STORAGE_KEY = 'typo-sync-store'

// Miss detection interval reference
let missDetectionInterval: NodeJS.Timeout | null = null

// Initial state values
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

  // Enhanced metrics
  wpm: 0,
  accuracy: 0,
  streak: 0,
  maxStreak: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  incorrectKeystrokes: 0,

  // Timing data
  averageReactionTime: 0,
  hitTimings: [],

  // Session data
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

export const useTypoSyncStore = create<TypoSyncStore>()(
  persist(
    (set, get) => ({
      // Initial state
      gameState: initialGameState,
      audioState: initialAudioState,
      currentSession: null,
      sessionHistory: [],
      performanceMetrics: initialPerformanceMetrics,
      error: null,

      // Game control actions
      startGame: async (audioBuffer, keystrokeMap, hiddenNotes) => {
        const now = performance.now()
        const { audioState } = get()

        console.log('🎮 startGame called with:', {
          keystrokeMapLength: keystrokeMap.length,
          hiddenNotesLength: hiddenNotes.length,
          hasAudioBuffer: !!audioBuffer,
          firstKeystroke: keystrokeMap[0],
          audioContextExists: !!audioState.audioContext,
        })

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

          console.log('🔄 Reset keystroke map states for replay')

          // Create audio source and start playback
          if (audioState.audioContext && audioBuffer) {
            try {
              // Resume audio context if it's suspended (required by browser policies)
              if (audioState.audioContext.state === 'suspended') {
                console.log('🔊 Resuming suspended audio context')
                await audioState.audioContext.resume()
              }

              const audioSource = audioState.audioContext.createBufferSource()
              audioSource.buffer = audioBuffer
              audioSource.connect(audioState.audioContext.destination)

              // Set up game end handler
              audioSource.onended = () => {
                console.log('🎵 Audio playback ended naturally - duration:', audioBuffer.duration)
                const currentTime = performance.now()
                const gameRunTime = currentTime - now
                console.log('🎮 Game ran for:', gameRunTime, 'ms before audio ended')

                // Don't stop the game if audio ended too quickly (likely an error)
                if (gameRunTime < 2000) {
                  console.warn('⚠️ Audio ended too quickly, continuing game without audio')
                  return
                }

                get().stopGame()
              }

              // Add error handler
              audioSource.addEventListener('error', (event: Event) => {
                console.error('🚨 Audio playback error:', event)
                // Don't stop the game on audio error, let it continue without sound
              })

              audioSource.start(0)

              // Store audio source for stopping later
              set((state) => ({
                audioState: {
                  ...state.audioState,
                  audioSource,
                },
              }))

              console.log('🎵 Audio playback started successfully')
            } catch (error) {
              console.error('🚨 Failed to start audio playback:', error)
              // Continue with the game even if audio fails
            }
          } else {
            console.log('🔇 No audio context or buffer available - running in silent mode')
          }

          set((state) => ({
            gameState: {
              ...state.gameState,
              isActive: true,
              gameStartTime: now,
              sessionStartTime: now,
              streak: 0,
              maxStreak: 0,
              totalKeystrokes: 0,
              correctKeystrokes: 0,
              incorrectKeystrokes: 0,
              hitTimings: [],
              score: 0,
              wpm: 0,
              accuracy: 0,
              feedback: '',
              feedbackColor: '#ffffff',
              gameLoopActive: true,
            },
            audioState: {
              ...state.audioState,
              audioBuffer,
              keystrokeMap: resetKeystrokeMap,
              hiddenNotes: resetHiddenNotes,
            },
          }))

          // Start session tracking
          get().startSession()

          // Start automatic miss detection
          get().startMissDetection()

          console.log('Game started successfully')
        } catch (error) {
          console.error('Error starting game:', error)
          get().setError(
            'Failed to start game: ' + (error instanceof Error ? error.message : 'Unknown error'),
          )
        }
      },

      stopGame: () => {
        const { audioState, gameState } = get()

        console.log('🛑 stopGame called - Game state:', {
          isActive: gameState.isActive,
          gameStartTime: gameState.gameStartTime,
          gameRunTime: gameState.gameStartTime ? performance.now() - gameState.gameStartTime : 0,
          hasAudioSource: !!audioState.audioSource,
          callStack: new Error().stack,
        })

        // Stop audio playback if it's playing
        if (audioState.audioSource) {
          try {
            audioState.audioSource.stop()
            console.log('🛑 Audio playback stopped')
          } catch (error) {
            console.log('Audio source already stopped or invalid')
          }
        }

        set((state) => ({
          gameState: {
            ...state.gameState,
            isActive: false,
            gameLoopActive: false,
            sessionEndTime: Date.now(),
            sessionDuration: state.gameState.sessionStartTime
              ? Date.now() - state.gameState.sessionStartTime
              : 0,
          },
          audioState: {
            ...state.audioState,
            audioSource: null, // Clear the audio source reference
          },
        }))

        // Stop miss detection
        get().stopMissDetection()

        // End session and save
        get().endSession()
        get().saveSession()
      },

      pauseGame: () => {
        const { audioState } = get()

        // Pause audio context
        if (audioState.audioContext) {
          try {
            audioState.audioContext.suspend()
          } catch (error) {
            console.log('Audio context suspension not supported')
          }
        }

        set((state) => ({
          gameState: {
            ...state.gameState,
            isPaused: true,
            pauseStartTime: Date.now(),
          },
        }))

        // Stop miss detection while paused
        get().stopMissDetection()

        console.log('🔄 Game paused')
      },

      resumeGame: () => {
        const { audioState, gameState } = get()

        // Resume audio context
        if (audioState.audioContext) {
          try {
            audioState.audioContext.resume()
          } catch (error) {
            console.log('Audio context resume not supported')
          }
        }

        // Calculate total pause time
        const pauseTime = gameState.pauseStartTime ? Date.now() - gameState.pauseStartTime : 0

        set((state) => ({
          gameState: {
            ...state.gameState,
            isPaused: false,
            pauseStartTime: null,
            totalPauseTime: state.gameState.totalPauseTime + pauseTime,
          },
        }))

        // Resume miss detection
        get().startMissDetection()

        console.log('▶️ Game resumed')
      },

      resetGame: () => {
        set({
          gameState: initialGameState,
          audioState: { ...initialAudioState },
          currentSession: null,
        })
      },

      // Audio analysis actions
      setAnalyzing: (isAnalyzing) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            isAnalyzing,
          },
        }))
      },

      setAnalysisResult: (result) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            analysisResult: result,
          },
        }))
      },

      setKeystrokeMap: (keystrokeMap) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            keystrokeMap,
          },
        }))
      },

      setHiddenNotes: (hiddenNotes) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            hiddenNotes,
          },
        }))
      },

      setAudioBuffer: (audioBuffer) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            audioBuffer,
          },
        }))
      },

      setAudioContext: (audioContext) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            audioContext,
          },
        }))
      },

      setError: (error) => {
        set({ error })
      },

      // Audio analysis
      analyzeAudio: async (file: File) => {
        const { setAnalyzing, setError, setAnalysisResult, setAudioBuffer, setAudioContext } = get()

        setAnalyzing(true)
        setError(null)

        try {
          // Create audio context if not exists
          let audioContext = get().audioState.audioContext
          if (!audioContext) {
            audioContext = await audioAnalysisService.createAudioContext()
            setAudioContext(audioContext)
          }

          // Load audio buffer for playback
          const audioBuffer = await audioAnalysisService.loadAudioBuffer(file, audioContext)
          setAudioBuffer(audioBuffer)

          // Load sound effects
          const soundEffects = await audioAnalysisService.loadSoundEffects(audioContext)
          console.log('🔊 Sound effects loaded:', {
            base: !!soundEffects.base,
            hiHat: !!soundEffects.hiHat,
            tambourine: !!soundEffects.tambourine,
          })
          set((state) => ({
            audioState: {
              ...state.audioState,
              soundEffects,
            },
          }))

          // Upload file for analysis
          const analyzeResult = await safeServiceCall(() =>
            audioAnalysisService.uploadForAnalysis(file),
          )

          if (!analyzeResult.success || !analyzeResult.data) {
            throw new Error(analyzeResult.error || 'Failed to start analysis')
          }

          const { task_id } = analyzeResult.data

          // Stream analysis results
          audioAnalysisService.streamAnalysisResults(
            task_id,
            // onUpdate
            (status) => {
              console.log('Analysis update:', status.status)
            },
            // onComplete
            (result) => {
              console.log('Analysis complete:', result.result)
              setAnalysisResult(result.result)
              setAnalyzing(false)

              // Auto-generate keystroke map after analysis completes
              console.log('🗺️ Auto-generating keystroke map from analysis results')
              setTimeout(() => {
                get().generateKeystrokeMap()
              }, 100) // Small delay to ensure state is updated
            },
            // onError
            (error) => {
              const errorMessage = error instanceof Error ? error.message : error.status
              console.error('Analysis error:', errorMessage)
              setError(errorMessage)
              setAnalyzing(false)
            },
          )
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Audio analysis failed'
          console.error('Audio analysis error:', errorMessage)
          setError(errorMessage)
          setAnalyzing(false)
        }
      },

      generateKeystrokeMap: () => {
        const { audioState } = get()
        const { analysisResult } = audioState

        if (!analysisResult) {
          console.error('No analysis result available for keystroke generation')
          return
        }

        console.log('🗺️ Generating keystroke map with:', {
          bpm: analysisResult.bpm,
          beatTimestampsLength: analysisResult.beat_timestamps?.length || 0,
          melodyMapLength: analysisResult.melody_map?.length || 0,
          firstBeatTimestamp: analysisResult.beat_timestamps?.[0],
          firstMelodyNote: analysisResult.melody_map?.[0],
        })

        try {
          const { keystrokeMap, hiddenNotes } = generateCompleteKeystrokeMap(
            analysisResult.bpm,
            analysisResult.beat_timestamps,
            analysisResult.melody_map,
          )

          console.log('✅ Keystroke generation result:', {
            keystrokeMapLength: keystrokeMap.length,
            hiddenNotesLength: hiddenNotes.length,
            firstKeystroke: keystrokeMap[0],
            beatKeystrokes: keystrokeMap.filter((k) => k.type === 'beat').length,
            melodyKeystrokes: keystrokeMap.filter((k) => k.type === 'melody').length,
          })

          set((state) => ({
            audioState: {
              ...state.audioState,
              keystrokeMap,
              hiddenNotes,
            },
          }))

          console.log(`Generated ${keystrokeMap.length} total items in unified keystroke map`)
          const hiddenNotesInMap = keystrokeMap.filter((k) => k.type === 'hidden')
          console.log(`🟣 Hidden notes in unified map: ${hiddenNotesInMap.length}`)
          console.log(
            `🟣 Hidden notes preview:`,
            hiddenNotesInMap.slice(0, 5).map((h) => ({ time: h.startTime.toFixed(3), key: h.key })),
          )
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Keystroke generation failed'
          console.error('Keystroke generation error:', errorMessage)
          get().setError(errorMessage)
        }
      },

      // Keystroke handling
      handleKeyPress: (key, currentTime) => {
        const { gameState, audioState } = get()
        if (!gameState.isActive || gameState.isPaused) return

        // Calculate current game time (excluding pause time)
        const totalGameTime = gameState.gameStartTime
          ? currentTime - gameState.gameStartTime / 1000
          : 0
        const gameTime = totalGameTime - gameState.totalPauseTime / 1000

        // Find upcoming keystrokes that match the pressed key
        const matchingKeystrokes = audioState.keystrokeMap.filter(
          (k) => k.state === 'upcoming' && k.key === key,
        )

        console.log(
          `🔍 Key '${key}' pressed - found ${matchingKeystrokes.length} matching upcoming keystrokes`,
        )

        // Debug info for [Enter] key specifically
        if (key === '[Enter]') {
          const allEnterKeystrokes = audioState.keystrokeMap.filter((k) => k.key === '[Enter]')
          const upcomingEnterKeystrokes = allEnterKeystrokes.filter((k) => k.state === 'upcoming')
          console.log(
            `🔍 [Enter] debug: ${allEnterKeystrokes.length} total [Enter] keys, ${upcomingEnterKeystrokes.length} upcoming`,
          )
          console.log(`🔍 Current game time: ${gameTime.toFixed(3)}s`)
          console.log(`🔍 Next upcoming [Enter]:`, upcomingEnterKeystrokes[0])
        }

        // Check for hidden notes FIRST (space key pressed on pre-generated hidden notes in keystrokeMap)
        // Hidden notes have priority over regular keystrokes
        let hiddenNoteHit = false
        if (key === '[Space]') {
          console.log(
            `🟣 Space pressed, checking for hidden notes first (priority over regular keystrokes)...`,
          )
          console.log(`🟣 Current game time: ${gameTime.toFixed(3)}s`)

          // Find upcoming hidden notes in the unified keystrokeMap
          const upcomingHiddenNotes = audioState.keystrokeMap.filter(
            (k) => k.type === 'hidden' && k.state === 'upcoming' && k.key === '[Space]',
          )

          console.log(`🟣 Available upcoming hidden notes: ${upcomingHiddenNotes.length}`)
          console.log(
            `🟣 Hidden note times:`,
            upcomingHiddenNotes.map((h) => h.startTime.toFixed(3)),
          )

          if (upcomingHiddenNotes.length > 0) {
            const closestHiddenNote = upcomingHiddenNotes.reduce((closest, current) => {
              const closestTiming = Math.abs(gameTime - closest.startTime)
              const currentTiming = Math.abs(gameTime - current.startTime)
              return currentTiming < closestTiming ? current : closest
            })

            const hiddenNoteTiming = Math.abs(gameTime - closestHiddenNote.startTime)

            console.log(
              `🟣 Closest hidden note: ${closestHiddenNote.startTime.toFixed(3)}s, timing: ${(hiddenNoteTiming * 1000).toFixed(0)}ms`,
            )

            // Hidden note hit window: 150ms
            if (hiddenNoteTiming <= 0.15) {
              hiddenNoteHit = true

              // Play hidden note sound effect
              get().playHiddenNoteSound()

              // Update hidden note state to hit in keystrokeMap
              get().updateKeystrokeState(closestHiddenNote, 'hit')

              // Update score for hidden note
              set((state) => ({
                gameState: {
                  ...state.gameState,
                  score: state.gameState.score + 25,
                },
              }))

              console.log(
                `🟣 Hidden note hit! (${(hiddenNoteTiming * 1000).toFixed(0)}ms, +25 pts)`,
              )

              return
            }
          }
        }

        // If hidden note was hit, don't process regular keystrokes
        if (hiddenNoteHit) {
          return
        }

        // Define timing windows
        const HIT_WINDOW = 0.15 // 150ms window for hit
        const TYPO_WINDOW = 0.25 // 250ms window for typo detection
        const IGNORE_WINDOW = 0.5 // 500ms - beyond this, ignore the key press

        // Check for any upcoming keystrokes near the hit zone (regardless of key)
        const nearbyKeystrokes = audioState.keystrokeMap.filter(
          (k) => k.state === 'upcoming' && k.type !== 'hidden',
        )

        if (nearbyKeystrokes.length === 0) {
          console.log(`🔇 Key '${key}' ignored - no upcoming keystrokes`)
          return
        }

        // Find the closest upcoming keystroke in time (regardless of key)
        const closestKeystroke = nearbyKeystrokes.reduce((closest, current) => {
          const closestTiming = Math.abs(gameTime - closest.startTime)
          const currentTiming = Math.abs(gameTime - current.startTime)
          return currentTiming < closestTiming ? current : closest
        })

        // Calculate timing difference
        const timing = gameTime - closestKeystroke.startTime
        const timingAbs = Math.abs(timing)

        // If the key is pressed too far from any keystroke, ignore it
        if (timingAbs > IGNORE_WINDOW) {
          console.log(
            `🔇 Key '${key}' ignored - too far from hit zone (${(timingAbs * 1000).toFixed(0)}ms)`,
          )
          return
        }

        // Check if the pressed key matches the closest keystroke
        const isCorrectKey = closestKeystroke.key === key

        // Determine hit result
        let isCorrect = false
        let feedback = 'MISS'
        let feedbackColor = '#ff0000'
        let points = -25
        let timingAccuracy: 'sync' | 'early' | 'late' | 'miss' = 'miss'
        let newState: 'hit' | 'missed' | 'typo' = 'missed'

        if (timingAbs <= TYPO_WINDOW) {
          if (isCorrectKey && timingAbs <= HIT_WINDOW) {
            // Correct key within hit window
            isCorrect = true
            newState = 'hit'
            if (timingAbs <= 0.08) {
              // Perfect hit - expanded window from 50ms to 80ms for better sync detection
              feedback = 'PERFECT!'
              feedbackColor = '#00ff00'
              points = 100
              timingAccuracy = 'sync'
            } else {
              // Good hit
              feedback = timing < 0 ? 'EARLY' : 'LATE'
              feedbackColor = '#ffff00'
              points = 50
              timingAccuracy = timing < 0 ? 'early' : 'late'
            }

            // Play appropriate sound effect
            get().playKeystrokeSound(closestKeystroke.key)
          } else if (!isCorrectKey) {
            // Wrong key within typo window
            isCorrect = false
            newState = 'typo'
            feedback = 'TYPO!'
            feedbackColor = '#ff8800'
            points = -50
            timingAccuracy = 'miss'
            console.log(`🔥 Typo detected: pressed '${key}' but expected '${closestKeystroke.key}'`)
          } else {
            // Correct key but outside hit window (late miss)
            isCorrect = false
            newState = 'missed'
            feedback = 'MISS'
            feedbackColor = '#ff0000'
            points = -25
            timingAccuracy = 'miss'
          }
        } else {
          // Too far from any keystroke
          isCorrect = false
          newState = 'missed'
          feedback = 'MISS'
          feedbackColor = '#ff0000'
          points = -25
          timingAccuracy = 'miss'
        }

        // Update keystroke state with timing information
        get().updateKeystrokeStateWithTiming(closestKeystroke, newState, timingAccuracy, timing)

        // Update metrics
        get().updateStreak(isCorrect)
        get().addHitTiming(timing)
        get().calculateWPM()
        get().calculateAccuracy()

        // Update score and metrics
        set((state) => ({
          gameState: {
            ...state.gameState,
            score: state.gameState.score + points,
            totalKeystrokes: state.gameState.totalKeystrokes + 1,
            correctKeystrokes: isCorrect
              ? state.gameState.correctKeystrokes + 1
              : state.gameState.correctKeystrokes,
            incorrectKeystrokes: isCorrect
              ? state.gameState.incorrectKeystrokes
              : state.gameState.incorrectKeystrokes + 1,
          },
        }))

        console.log(
          `🎹 Key '${key}': ${feedback} (${(timing * 1000).toFixed(0)}ms, ${points} pts, ${timingAccuracy})`,
        )
      },

      updateKeystrokeState: (keystroke, newState) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            keystrokeMap: state.audioState.keystrokeMap.map((k) =>
              k.startTime === keystroke.startTime && k.key === keystroke.key
                ? { ...k, state: newState }
                : k,
            ),
          },
        }))
      },

      updateKeystrokeStateWithTiming: (keystroke, newState, timingAccuracy, hitTiming) => {
        set((state) => ({
          audioState: {
            ...state.audioState,
            keystrokeMap: state.audioState.keystrokeMap.map((k) =>
              k.startTime === keystroke.startTime && k.key === keystroke.key
                ? { ...k, state: newState, timingAccuracy, hitTiming }
                : k,
            ),
          },
        }))
      },

      // Statistics calculations
      calculateWPM: () => {
        const { gameState } = get()
        if (!gameState.gameStartTime) return

        // Calculate effective game time (excluding pause time)
        const currentTime = performance.now()
        const totalGameTime = currentTime - gameState.gameStartTime
        const pauseTime =
          gameState.isPaused && gameState.pauseStartTime
            ? currentTime - gameState.pauseStartTime
            : 0
        const effectiveGameTime = totalGameTime - gameState.totalPauseTime - pauseTime

        const timeElapsed = effectiveGameTime / 1000 / 60 // minutes
        const wordsTyped = gameState.correctKeystrokes / 5 // Standard: 5 characters = 1 word

        // Only calculate WPM if we have at least 3 seconds of game time and some keystrokes
        let wpm = 0
        if (timeElapsed > 3 / 60 && gameState.correctKeystrokes > 0) {
          // At least 3 seconds
          wpm = Math.round(wordsTyped / timeElapsed)
        }

        console.log('🔢 WPM Calculation:', {
          effectiveGameTime: effectiveGameTime / 1000,
          timeElapsed,
          correctKeystrokes: gameState.correctKeystrokes,
          wordsTyped,
          wpm,
          gameStartTime: gameState.gameStartTime,
          currentTime,
        })

        set((state) => ({
          gameState: {
            ...state.gameState,
            wpm,
          },
        }))
      },

      calculateAccuracy: () => {
        const { gameState } = get()
        const total = gameState.totalKeystrokes
        const accuracy = total > 0 ? Math.round((gameState.correctKeystrokes / total) * 100) : 0

        set((state) => ({
          gameState: {
            ...state.gameState,
            accuracy,
          },
        }))
      },

      updateStreak: (isCorrect) => {
        set((state) => {
          const newStreak = isCorrect ? state.gameState.streak + 1 : 0
          const newMaxStreak = Math.max(state.gameState.maxStreak, newStreak)

          return {
            gameState: {
              ...state.gameState,
              streak: newStreak,
              maxStreak: newMaxStreak,
            },
          }
        })
      },

      addHitTiming: (timing) => {
        set((state) => {
          const newHitTimings = [...state.gameState.hitTimings, timing]
          const averageReactionTime =
            newHitTimings.reduce((a, b) => a + Math.abs(b), 0) / newHitTimings.length

          return {
            gameState: {
              ...state.gameState,
              hitTimings: newHitTimings,
              averageReactionTime,
            },
          }
        })
      },

      // Session management
      startSession: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const session: SessionStats = {
          id: sessionId,
          startTime: Date.now(),
          endTime: 0,
          duration: 0,
          score: 0,
          wpm: 0,
          accuracy: 0,
          streak: 0,
          maxStreak: 0,
          totalKeystrokes: 0,
          correctKeystrokes: 0,
          incorrectKeystrokes: 0,
          averageReactionTime: 0,
          hitTimings: [],
        }

        set({ currentSession: session })
      },

      endSession: () => {
        const { currentSession, gameState } = get()
        if (!currentSession) return

        const endTime = Date.now()
        const updatedSession: SessionStats = {
          ...currentSession,
          endTime,
          duration: endTime - currentSession.startTime,
          score: gameState.score,
          wpm: gameState.wpm,
          accuracy: gameState.accuracy,
          streak: gameState.streak,
          maxStreak: gameState.maxStreak,
          totalKeystrokes: gameState.totalKeystrokes,
          correctKeystrokes: gameState.correctKeystrokes,
          incorrectKeystrokes: gameState.incorrectKeystrokes,
          averageReactionTime: gameState.averageReactionTime,
          hitTimings: gameState.hitTimings,
        }

        set({ currentSession: updatedSession })
      },

      saveSession: () => {
        const { currentSession, sessionHistory } = get()
        if (!currentSession) return

        const newHistory = [...sessionHistory, currentSession]
        set({ sessionHistory: newHistory })

        // Update performance metrics
        get().updatePerformanceMetrics()
      },

      loadSessionHistory: () => {
        // Session history is already loaded via persist middleware
        get().updatePerformanceMetrics()
      },

      // Performance tracking
      updatePerformanceMetrics: () => {
        const { sessionHistory } = get()
        if (sessionHistory.length === 0) return

        const totalSessions = sessionHistory.length
        const totalPlayTime = sessionHistory.reduce((sum, session) => sum + session.duration, 0)
        const averageWPM =
          sessionHistory.reduce((sum, session) => sum + session.wpm, 0) / totalSessions
        const averageAccuracy =
          sessionHistory.reduce((sum, session) => sum + session.accuracy, 0) / totalSessions
        const bestStreak = Math.max(...sessionHistory.map((session) => session.maxStreak))

        // Calculate improvement rate (last 5 sessions vs first 5)
        let improvementRate = 0
        if (sessionHistory.length >= 10) {
          const first5 = sessionHistory.slice(0, 5)
          const last5 = sessionHistory.slice(-5)
          const firstAvg = first5.reduce((sum, s) => sum + s.wpm, 0) / 5
          const lastAvg = last5.reduce((sum, s) => sum + s.wpm, 0) / 5
          if (firstAvg > 0) {
            improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100
          }
        }

        const confidenceLevel = get().calculateConfidenceLevel()

        set({
          performanceMetrics: {
            averageWPM,
            averageAccuracy,
            bestStreak,
            totalSessions,
            totalPlayTime,
            improvementRate,
            confidenceLevel,
            weakKeys: [], // TODO: Implement key analysis
            strongKeys: [], // TODO: Implement key analysis
          },
        })
      },

      calculateConfidenceLevel: () => {
        const { sessionHistory } = get()
        if (sessionHistory.length < 5) return 0

        const recentSessions = sessionHistory.slice(-5)
        const avgWPM = recentSessions.reduce((sum, s) => sum + s.wpm, 0) / 5
        const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / 5

        // Confidence level based on keybr.com style (35+ WPM, 95%+ accuracy)
        if (avgWPM >= 35 && avgAccuracy >= 95) return 1
        if (avgWPM >= 25 && avgAccuracy >= 90) return 0.8
        if (avgWPM >= 20 && avgAccuracy >= 85) return 0.6
        if (avgWPM >= 15 && avgAccuracy >= 80) return 0.4
        return 0.2
      },

      getTimingHistogram: () => {
        const { gameState } = get()
        const timings = gameState.hitTimings

        if (timings.length === 0) {
          return {
            earlyHits: 0,
            syncHits: 0,
            lateHits: 0,
            totalHits: 0,
            averageTiming: 0,
            standardDeviation: 0,
          }
        }

        const earlyHits = timings.filter((t) => t < -0.05).length
        const syncHits = timings.filter((t) => Math.abs(t) <= 0.05).length
        const lateHits = timings.filter((t) => t > 0.05).length
        const totalHits = timings.length
        const averageTiming = timings.reduce((sum, t) => sum + t, 0) / totalHits

        // Calculate standard deviation
        const variance =
          timings.reduce((sum, t) => sum + Math.pow(t - averageTiming, 2), 0) / totalHits
        const standardDeviation = Math.sqrt(variance)

        return {
          earlyHits,
          syncHits,
          lateHits,
          totalHits,
          averageTiming,
          standardDeviation,
        }
      },

      // Sound effects
      playKeystrokeSound: (key: string) => {
        const { audioState } = get()
        console.log(`🔊 playKeystrokeSound called for key: ${key}`)

        if (!audioState.audioContext || !audioState.soundEffects) {
          console.warn(`🔇 Cannot play sound for key ${key}: missing audioContext or soundEffects`)
          return
        }

        let soundBuffer: AudioBuffer | null = null

        // Choose sound based on key type
        if (key === '[Space]' || key === '[Enter]') {
          // Special characters use base.mp3
          soundBuffer = audioState.soundEffects.base
          console.log(`🔊 Playing base.mp3 for special key: ${key}`)
        } else {
          // Normal characters use hi-hat.mp3
          soundBuffer = audioState.soundEffects.hiHat
          console.log(`🔊 Playing hi-hat.mp3 for normal key: ${key}`)
        }

        if (soundBuffer) {
          try {
            const source = audioState.audioContext.createBufferSource()
            source.buffer = soundBuffer
            source.connect(audioState.audioContext.destination)
            source.start(0)
            console.log(`🔊 Successfully played sound for key: ${key}`)
          } catch (error) {
            console.error('Error playing keystroke sound:', error)
          }
        } else {
          console.warn(`🔇 No sound buffer available for key: ${key}`)
        }
      },

      playHiddenNoteSound: () => {
        const { audioState } = get()
        console.log('🟣 playHiddenNoteSound called')
        console.log('🟣 audioContext exists:', !!audioState.audioContext)
        console.log('🟣 soundEffects exists:', !!audioState.soundEffects)
        console.log('🟣 tambourine buffer exists:', !!audioState.soundEffects?.tambourine)

        if (!audioState.audioContext || !audioState.soundEffects?.tambourine) {
          console.warn(
            '🔇 Cannot play hidden note sound: missing audioContext or tambourine buffer',
          )
          console.warn('🔇 audioContext:', audioState.audioContext)
          console.warn('🔇 soundEffects:', audioState.soundEffects)
          return
        }

        try {
          const source = audioState.audioContext.createBufferSource()
          source.buffer = audioState.soundEffects.tambourine
          source.connect(audioState.audioContext.destination)
          source.start(0)
          console.log('🟣 Successfully played hidden note tambourine sound')
        } catch (error) {
          console.error('Error playing hidden note sound:', error)
        }
      },

      // Miss detection
      startMissDetection: () => {
        // Clear any existing interval
        if (missDetectionInterval) {
          clearInterval(missDetectionInterval)
        }

        // Start checking for missed keystrokes every 100ms
        missDetectionInterval = setInterval(() => {
          const { gameState } = get()
          if (gameState.isActive) {
            get().checkForMissedKeystrokes()
            // Also update WPM regularly
            get().calculateWPM()
          }
        }, 100)

        console.log('🕐 Started automatic miss detection and WPM updates')
      },

      stopMissDetection: () => {
        if (missDetectionInterval) {
          clearInterval(missDetectionInterval)
          missDetectionInterval = null
          console.log('🛑 Stopped automatic miss detection')
        }
      },

      checkForMissedKeystrokes: () => {
        const { gameState, audioState } = get()
        if (!gameState.isActive || !gameState.gameStartTime || gameState.isPaused) return

        const currentTime = performance.now() / 1000
        const totalGameTime = currentTime - gameState.gameStartTime / 1000
        const gameTime = totalGameTime - gameState.totalPauseTime / 1000
        const MISS_WINDOW = 0.2 // 200ms window after hit zone for marking as missed

        // Find regular keystrokes that have passed the miss window and should be marked as missed
        const regularKeystrokesToMiss = audioState.keystrokeMap.filter((keystroke) => {
          if (keystroke.state !== 'upcoming') return false
          if (keystroke.type === 'hidden') return false // Hidden notes handled separately

          const timeDifference = gameTime - keystroke.startTime
          // If game time has passed keystroke time by more than MISS_WINDOW, mark as missed
          return timeDifference > MISS_WINDOW
        })

        // Find hidden notes that have passed the window (for cleanup only, no penalty)
        const expiredHiddenNotes = audioState.keystrokeMap.filter((keystroke) => {
          if (keystroke.state !== 'upcoming') return false
          if (keystroke.type !== 'hidden') return false

          const timeDifference = gameTime - keystroke.startTime
          return timeDifference > MISS_WINDOW * 2 // Give hidden notes more time before cleanup
        })

        // Process regular keystroke misses (with penalty)
        if (regularKeystrokesToMiss.length > 0) {
          console.log(
            `⏰ Auto-marking ${regularKeystrokesToMiss.length} regular keystrokes as missed`,
          )

          regularKeystrokesToMiss.forEach((keystroke) => {
            // Update keystroke state to missed with timing info
            get().updateKeystrokeStateWithTiming(keystroke, 'missed', 'miss', 0)

            // Update streak (breaks streak)
            get().updateStreak(false)

            // Update metrics
            set((state) => ({
              gameState: {
                ...state.gameState,
                totalKeystrokes: state.gameState.totalKeystrokes + 1,
                incorrectKeystrokes: state.gameState.incorrectKeystrokes + 1,
                score: state.gameState.score - 25, // Penalty for missing
              },
            }))

            console.log(
              `❌ Auto-missed keystroke: ${keystroke.key} at ${keystroke.startTime.toFixed(2)}s`,
            )
          })

          // Recalculate accuracy after missing keystrokes
          get().calculateAccuracy()
        }

        // Process expired hidden notes (cleanup only, no penalty)
        if (expiredHiddenNotes.length > 0) {
          console.log(`🟣 Cleaning up ${expiredHiddenNotes.length} expired hidden notes`)

          expiredHiddenNotes.forEach((hiddenNote) => {
            // Just mark as missed for cleanup, no score penalty
            get().updateKeystrokeState(hiddenNote, 'missed')

            console.log(`🧹 Cleaned up hidden note at ${hiddenNote.startTime.toFixed(2)}s`)
          })
        }
      },

      // Import/Export functionality
      importBeatMap: (beatMapData: any) => {
        try {
          // Handle both simple and complete beat map formats
          let beatTimestamps: number[]
          let melodyMap: any[] = []
          let analysisInfo: any = {}
          let bpm: number = 120

          if (beatMapData.beatMap) {
            // Complete beat map format
            beatTimestamps = beatMapData.beatMap.beatTimestamps
            melodyMap = beatMapData.beatMap.melodyMap || []
            analysisInfo = beatMapData.beatMap.analysisInfo || {}
            bpm = beatMapData.beatMap.bpm || 120
          } else {
            // Simple beat map format (legacy)
            beatTimestamps = beatMapData.beatTimestamps || beatMapData
          }

          if (Array.isArray(beatTimestamps)) {
            set((state) => ({
              audioState: {
                ...state.audioState,
                analysisResult: {
                  beat_timestamps: beatTimestamps,
                  melody_map: melodyMap,
                  analysis_info: analysisInfo,
                  bpm: bpm,
                },
              },
            }))
            console.log(
              '✅ Beat map imported successfully with',
              beatTimestamps.length,
              'timestamps',
              melodyMap.length > 0 ? `and ${melodyMap.length} melody notes` : '',
            )
          } else {
            throw new Error('Invalid beat map format')
          }
        } catch (error) {
          console.error('❌ Failed to import beat map:', error)
          get().setError('Failed to import beat map')
        }
      },

      importKeystrokeMap: (keystrokeMapData: any) => {
        try {
          const keystrokeMap = keystrokeMapData.keystrokeMap || keystrokeMapData

          if (Array.isArray(keystrokeMap)) {
            // Reset states for imported keystrokes
            const resetKeystrokeMap = keystrokeMap.map((k: any) => ({
              ...k,
              state: 'upcoming' as const,
              timingAccuracy: undefined,
              hitTiming: undefined,
            }))

            set((state) => ({
              audioState: {
                ...state.audioState,
                keystrokeMap: resetKeystrokeMap,
              },
            }))
            console.log(
              '✅ Keystroke map imported successfully with',
              keystrokeMap.length,
              'keystrokes',
            )
          } else {
            throw new Error('Invalid keystroke map format')
          }
        } catch (error) {
          console.error('❌ Failed to import keystroke map:', error)
          get().setError('Failed to import keystroke map')
        }
      },

      // Persistence
      saveToLocalStorage: () => {
        // Handled by persist middleware
      },

      loadFromLocalStorage: () => {
        // Handled by persist middleware
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
        performanceMetrics: state.performanceMetrics,
      }),
    },
  ),
)
