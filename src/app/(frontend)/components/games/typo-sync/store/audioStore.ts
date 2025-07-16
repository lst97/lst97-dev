import { audioAnalysisService, safeServiceCall } from '../services/audioAnalysisService'
import { generateCompleteKeystrokeMap } from '../utils/keystrokeGeneration'
import type { AnalysisResult, Priority } from '../types'

export interface AudioActions {
  setAnalyzing: (isAnalyzing: boolean) => void
  setAnalysisResult: (result: AnalysisResult | null) => void
  setKeystrokeMap: (map: any[]) => void
  setHiddenNotes: (notes: any[]) => void
  setAudioBuffer: (buffer: AudioBuffer | null) => void
  setAudioContext: (context: AudioContext | null) => void
  analyzeAudio: (audioFile: File, priority?: Priority) => Promise<void>
  cancelAnalysis: () => void
  generateKeystrokeMap: () => void
  playKeystrokeSound: (key: string, type?: string) => void
  playHiddenNoteSound: () => void
  loadSoundEffects: () => Promise<void>
}

let currentStreamCloseFunction: (() => void) | null = null

export const createAudioActions = (set: any, get: any): AudioActions => ({
  setAnalyzing: (isAnalyzing: boolean) => {
    set((state: any) => ({
      audioState: { ...state.audioState, isAnalyzing },
    }))
  },

  setAnalysisResult: (result: AnalysisResult | null) => {
    set((state: any) => ({
      audioState: { ...state.audioState, analysisResult: result },
    }))
  },

  setKeystrokeMap: (map: any[]) => {
    set((state: any) => ({
      audioState: { ...state.audioState, keystrokeMap: map },
    }))
  },

  setHiddenNotes: (notes: any[]) => {
    set((state: any) => ({
      audioState: { ...state.audioState, hiddenNotes: notes },
    }))
  },

  setAudioBuffer: (buffer: AudioBuffer | null) => {
    set((state: any) => ({
      audioState: { ...state.audioState, audioBuffer: buffer },
    }))
  },

  setAudioContext: (context: AudioContext | null) => {
    set((state: any) => ({
      audioState: { ...state.audioState, audioContext: context },
    }))

    // Load sound effects when audio context is available
    if (context) {
      setTimeout(() => {
        get().loadSoundEffects()
      }, 100) // Small delay to ensure the state is updated
    }
  },

  analyzeAudio: async (audioFile: File, priority: 'high' | 'normal' | 'batch' = 'normal') => {
    try {
      get().setAnalyzing(true)
      get().setError(null)

      // Set up audio context and buffer first
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      get().setAudioContext(audioContext)

      const arrayBuffer = await audioFile.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      get().setAudioBuffer(audioBuffer)

      // Step 1: Upload file for analysis to get task ID
      const uploadResult = await safeServiceCall(() =>
        audioAnalysisService.uploadForAnalysis(audioFile, priority),
      )

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Failed to upload file for analysis')
      }

      const { task_id, cache_hit, result } = uploadResult.data

      // Handle cache hit - immediate result (no need to call getAnalysisResult)
      if (cache_hit && result) {
        get().setAnalysisResult(result)
        get().generateKeystrokeMap()
        get().setAnalyzing(false)
        return
      }

      // Step 2: Stream analysis results via SSE
      return new Promise<void>((resolve, reject) => {
        const closeStream = audioAnalysisService.streamAnalysisResults(
          task_id,
          // onUpdate - handle status updates
          () => {},
          // onComplete - handle successful completion
          (result) => {
            currentStreamCloseFunction = null // Clear the reference
            try {
              if (result.state === 'SUCCESS' && result.result) {
                get().setAnalysisResult(result.result)
                get().generateKeystrokeMap()
                get().setAnalyzing(false)
                resolve()
              } else {
                throw new Error('Analysis completed but no result data received')
              }
            } catch (error) {
              get().setError('Failed to process analysis results')
              get().setAnalyzing(false)
              reject(error)
            }
          },
          // onError - handle errors
          (error) => {
            currentStreamCloseFunction = null // Clear the reference
            let errorMessage = 'Analysis failed'

            if (error instanceof Error) {
              errorMessage = error.message
            } else if (error.state === 'FAILURE') {
              errorMessage = error.status || 'Processing failed'
            } else if (error.state === 'ERROR') {
              errorMessage = error.status || 'System error occurred'
            } else if (error.state === 'NOT_FOUND') {
              errorMessage = 'Task not found - may have expired'
            } else if (error.status) {
              errorMessage = error.status
            }

            get().setError('Audio analysis failed: ' + errorMessage)
            get().setAnalyzing(false)
            reject(new Error(errorMessage))
          },
        )

        // Store the close function for cleanup
        currentStreamCloseFunction = closeStream
      })
    } catch (error) {
      get().setError(
        'Audio analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      )
      get().setAnalyzing(false)
      throw error
    }
  },

  cancelAnalysis: () => {
    if (currentStreamCloseFunction) {
      currentStreamCloseFunction()
      currentStreamCloseFunction = null
    }
    get().setAnalyzing(false)
    get().setError('Analysis cancelled')
  },

  generateKeystrokeMap: () => {
    const { audioState } = get()
    const { analysisResult } = audioState

    if (!analysisResult) {
      console.error('❌ No analysis result available for keystroke generation')
      return
    }

    try {
      const keystrokeMap = generateCompleteKeystrokeMap(
        analysisResult.bpm || 120,
        analysisResult.beat_timestamps || [],
        analysisResult.melody_map || [],
      )

      get().setKeystrokeMap(keystrokeMap.keystrokeMap)
      get().setHiddenNotes(keystrokeMap.hiddenNotes)
    } catch (error) {
      console.error('❌ Error generating keystroke map:', error)
      get().setError('Failed to generate keystroke map')
    }
  },

  playKeystrokeSound: (key: string, type?: string) => {
    const { audioState } = get()
    const { soundEffects } = audioState

    try {
      let soundBuffer = null

      if (type === 'beat') {
        soundBuffer = soundEffects.beat
      } else if (key === '[Space]' || key === '[Enter]') {
        soundBuffer = soundEffects.base
      } else {
        soundBuffer = soundEffects.hiHat
      }

      if (soundBuffer && audioState.audioContext) {
        const source = audioState.audioContext.createBufferSource()
        source.buffer = soundBuffer

        const gainNode = audioState.audioContext.createGain()
        if (type === 'beat') {
          gainNode.gain.value = 0.8
        } else if (key === '[Space]' || key === '[Enter]') {
          gainNode.gain.value = 0.5
        } else {
          gainNode.gain.value = 0.2
        }

        source.connect(gainNode)
        gainNode.connect(audioState.audioContext.destination)

        source.start(0)
      }
    } catch (error) {
      console.warn('Error playing keystroke sound:', error)
    }
  },

  playHiddenNoteSound: () => {
    const { audioState } = get()
    const { soundEffects } = audioState

    try {
      if (soundEffects.tambourine && audioState.audioContext) {
        const source = audioState.audioContext.createBufferSource()
        source.buffer = soundEffects.tambourine

        const gainNode = audioState.audioContext.createGain()
        gainNode.gain.value = 0.5

        source.connect(gainNode)
        gainNode.connect(audioState.audioContext.destination)

        source.start(0)
      }
    } catch (error) {
      console.warn('Error playing hidden note sound:', error)
    }
  },

  loadSoundEffects: async () => {
    const { audioState } = get()

    if (!audioState.audioContext) {
      console.warn('No audio context available for loading sound effects')
      return
    }

    try {
      const soundEffects = await audioAnalysisService.loadSoundEffects(audioState.audioContext)

      set((state: any) => ({
        audioState: {
          ...state.audioState,
          soundEffects,
        },
      }))
    } catch (error) {
      console.warn('Failed to load sound effects:', error)
    }
  },
})
