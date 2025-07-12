import { useState, useCallback, useRef, useEffect } from 'react'
import type { AudioAnalysisHook, AudioState } from '../types'
import { audioAnalysisService, safeServiceCall } from '../services/audioAnalysisService'
import { generateCompleteKeystrokeMap } from '../utils/keystrokeGeneration'

/**
 * Hook for managing audio analysis and keystroke generation
 */
export function useAudioAnalysis(): AudioAnalysisHook {
  // Audio analysis state
  const [audioState, setAudioState] = useState<AudioState>({
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
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for cleanup
  const cleanupStreamRef = useRef<(() => void) | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  /**
   * Analyze audio file using the backend service
   */
  const analyzeAudio = useCallback(
    async (file: File) => {
      if (isAnalyzing) {
        console.warn('Analysis already in progress')
        return
      }

      setIsAnalyzing(true)
      setError(null)
      setAudioState((prev) => ({ ...prev, isAnalyzing: true }))

      try {
        // Create audio context if not exists
        if (!audioContextRef.current) {
          audioContextRef.current = await audioAnalysisService.createAudioContext()
          setAudioState((prev) => ({ ...prev, audioContext: audioContextRef.current }))
        }

        // Load audio buffer for playback
        const audioBuffer = await audioAnalysisService.loadAudioBuffer(
          file,
          audioContextRef.current,
        )
        setAudioState((prev) => ({ ...prev, audioBuffer }))

        // Load sound effects
        const soundEffects = await audioAnalysisService.loadSoundEffects(audioContextRef.current)
        setAudioState((prev) => ({ ...prev, soundEffects }))

        // Upload file for analysis
        const analyzeResult = await safeServiceCall(() =>
          audioAnalysisService.uploadForAnalysis(file),
        )

        if (!analyzeResult.success || !analyzeResult.data) {
          throw new Error(analyzeResult.error || 'Failed to start analysis')
        }

        const { task_id } = analyzeResult.data

        // Stream analysis results
        cleanupStreamRef.current = audioAnalysisService.streamAnalysisResults(
          task_id,
          // onUpdate
          () => {},
          // onComplete
          (result) => {
            setAudioState((prev) => ({
              ...prev,
              isAnalyzing: false,
              analysisResult: result.result,
            }))
            setIsAnalyzing(false)
          },
          // onError
          (error) => {
            const errorMessage = error instanceof Error ? error.message : error.status
            console.error('Analysis error:', errorMessage)
            setError(errorMessage)
            setAudioState((prev) => ({ ...prev, isAnalyzing: false }))
            setIsAnalyzing(false)
          },
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
        console.error('Audio analysis error:', err)
        setError(errorMessage)
        setAudioState((prev) => ({ ...prev, isAnalyzing: false }))
        setIsAnalyzing(false)
      }
    },
    [isAnalyzing],
  )

  /**
   * Generate keystroke map from analysis results
   */
  const generateKeystrokeMap = useCallback(() => {
    if (!audioState.analysisResult) {
      setError('No analysis result available for keystroke generation')
      return
    }

    try {
      const { bpm, beat_timestamps, melody_map } = audioState.analysisResult

      const result = generateCompleteKeystrokeMap(bpm, beat_timestamps, melody_map)

      setAudioState((prev) => ({
        ...prev,
        keystrokeMap: result.keystrokeMap,
        hiddenNotes: result.hiddenNotes,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Keystroke generation failed'
      console.error('Keystroke generation error:', err)
      setError(errorMessage)
    }
  }, [audioState.analysisResult])

  /**
   * Reset analysis state
   */
  const resetAnalysis = useCallback(() => {
    // Cleanup stream if active
    if (cleanupStreamRef.current) {
      cleanupStreamRef.current()
      cleanupStreamRef.current = null
    }

    setAudioState({
      isAnalyzing: false,
      analysisResult: null,
      keystrokeMap: [],
      hiddenNotes: [],
      audioBuffer: null,
      audioContext: audioContextRef.current,
      audioSource: null,
      soundEffects: {
        base: null,
        hiHat: null,
        tambourine: null,
      },
    })
    setIsAnalyzing(false)
    setError(null)
  }, [])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cleanup stream
      if (cleanupStreamRef.current) {
        cleanupStreamRef.current()
      }

      // Cleanup audio service
      audioAnalysisService.cleanup()

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    analyzeAudio,
    generateKeystrokeMap,
    audioState,
    isAnalyzing,
    error,
    resetAnalysis,
  }
}
