import type {
  AnalyzeResponse,
  TaskResultResponse,
  SuccessResponse,
  StatusResponse,
  FailureResponse,
} from '../types'

/**
 * Audio Analysis Service
 * Handles communication with the backend for audio file analysis
 */
export class AudioAnalysisService {
  private readonly baseUrl: string
  private eventSource: EventSource | null = null

  constructor(baseUrl = 'http://127.0.0.1:8000') {
    this.baseUrl = baseUrl
  }

  /**
   * Upload audio file for analysis
   * @param file - Audio file to analyze
   * @returns Promise with task ID and backend type
   */
  async uploadForAnalysis(file: File): Promise<AnalyzeResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get analysis results by task ID (polling-based)
   * @param taskId - Task ID from upload response
   * @returns Promise with task result
   */
  async getAnalysisResult(taskId: string): Promise<TaskResultResponse> {
    const response = await fetch(`${this.baseUrl}/results/${taskId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Stream analysis results using Server-Sent Events
   * @param taskId - Task ID from upload response
   * @param onUpdate - Callback for status updates
   * @param onComplete - Callback for completion
   * @param onError - Callback for errors
   * @returns Function to close the stream
   */
  streamAnalysisResults(
    taskId: string,
    onUpdate: (status: StatusResponse) => void,
    onComplete: (result: SuccessResponse) => void,
    onError: (error: FailureResponse | Error) => void,
  ): () => void {
    // Close any existing EventSource connection
    if (this.eventSource) {
      this.eventSource.close()
    }

    // Create new EventSource connection to SSE endpoint
    this.eventSource = new EventSource(`${this.baseUrl}/stream/${taskId}`)

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TaskResultResponse

        switch (data.state) {
          case 'SUCCESS':
            this.eventSource?.close()
            this.eventSource = null
            onComplete(data)
            break

          case 'FAILURE':
            this.eventSource?.close()
            this.eventSource = null
            onError(data)
            break

          case 'PENDING':
          case 'PROCESSING':
            onUpdate(data)
            break

          default:
            console.warn('Unknown analysis state:', data)
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
        onError(new Error('Error parsing server response'))
      }
    }

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      this.eventSource?.close()
      this.eventSource = null
      onError(new Error('Connection error to analysis server'))
    }

    this.eventSource.onopen = () => {
      console.log('SSE connection opened for task:', taskId)
    }

    // Return cleanup function
    return () => {
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }
    }
  }

  /**
   * Cleanup method to close any open connections
   */
  cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * Load audio file as AudioBuffer for playback
   * @param file - Audio file to load
   * @param audioContext - Web Audio API context
   * @returns Promise with decoded audio buffer
   */
  async loadAudioBuffer(file: File, audioContext: AudioContext): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer()
    return audioContext.decodeAudioData(arrayBuffer)
  }

  /**
   * Load sound effect files for game audio
   * @param audioContext - Web Audio API context
   * @param baseUrl - Base URL for sound files (defaults to /typo-sync/)
   * @returns Promise with decoded sound effect buffers
   */
  async loadSoundEffects(
    audioContext: AudioContext,
    baseUrl = '/typo-sync/',
  ): Promise<{
    base: AudioBuffer | null
    hiHat: AudioBuffer | null
    tambourine: AudioBuffer | null
  }> {
    const soundEffects = {
      base: null as AudioBuffer | null,
      hiHat: null as AudioBuffer | null,
      tambourine: null as AudioBuffer | null,
    }

    try {
      const [baseResponse, hiHatResponse, tambourineResponse] = await Promise.allSettled([
        fetch(`${baseUrl}base.mp3`).then((res) => res.arrayBuffer()),
        fetch(`${baseUrl}hi-hat.mp3`).then((res) => res.arrayBuffer()),
        fetch(`${baseUrl}tambourine.mp3`).then((res) => res.arrayBuffer()),
      ])

      if (baseResponse.status === 'fulfilled') {
        soundEffects.base = await audioContext.decodeAudioData(baseResponse.value)
      }

      if (hiHatResponse.status === 'fulfilled') {
        soundEffects.hiHat = await audioContext.decodeAudioData(hiHatResponse.value)
      }

      if (tambourineResponse.status === 'fulfilled') {
        soundEffects.tambourine = await audioContext.decodeAudioData(tambourineResponse.value)
        console.log('🟣 Successfully loaded tambourine.mp3')
      } else {
        console.error('🟣 Failed to load tambourine.mp3:', tambourineResponse.reason)
      }
    } catch (error) {
      console.warn('Error loading some sound effects:', error)
    }

    return soundEffects
  }

  /**
   * Load metronome sound for rhythm guidance
   * @param audioContext - Web Audio API context
   * @param baseUrl - Base URL for sound files
   * @returns Promise with decoded metronome buffer
   */
  async loadMetronomeSound(
    audioContext: AudioContext,
    baseUrl = '/typo-sync/',
  ): Promise<AudioBuffer | null> {
    try {
      const response = await fetch(`${baseUrl}beat.wav`)
      const arrayBuffer = await response.arrayBuffer()
      return audioContext.decodeAudioData(arrayBuffer)
    } catch (error) {
      console.error('Error loading metronome sound:', error)
      return null
    }
  }

  /**
   * Load melody note sound for melody visualization
   * @param audioContext - Web Audio API context
   * @param baseUrl - Base URL for sound files
   * @returns Promise with decoded melody note buffer
   */
  async loadMelodySound(
    audioContext: AudioContext,
    baseUrl = '/typo-sync/',
  ): Promise<AudioBuffer | null> {
    try {
      const response = await fetch(`${baseUrl}melody_note.wav`)
      const arrayBuffer = await response.arrayBuffer()
      return audioContext.decodeAudioData(arrayBuffer)
    } catch (error) {
      console.error('Error loading melody sound:', error)
      return null
    }
  }

  /**
   * Play an audio buffer through the audio context
   * @param audioBuffer - Audio buffer to play
   * @param audioContext - Web Audio API context
   * @param when - When to start playing (default: now)
   * @param offset - Offset into the buffer to start playing
   * @param duration - Duration to play (optional)
   * @returns AudioBufferSourceNode that can be controlled
   */
  playAudioBuffer(
    audioBuffer: AudioBuffer,
    audioContext: AudioContext,
    when = 0,
    offset = 0,
    duration?: number,
  ): AudioBufferSourceNode {
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)

    if (duration !== undefined) {
      source.start(when, offset, duration)
    } else {
      source.start(when, offset)
    }

    return source
  }

  /**
   * Create and initialize Web Audio API context
   * @returns Promise with audio context (handles user gesture requirements)
   */
  async createAudioContext(): Promise<AudioContext> {
    const audioContext = new AudioContext()

    // Resume context if it's suspended (due to autoplay policy)
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    return audioContext
  }
}

// Create default instance
export const audioAnalysisService = new AudioAnalysisService()

// Types for service responses
export type AudioServiceResult<T> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Wrapper function for safe service calls with error handling
 */
export async function safeServiceCall<T>(
  operation: () => Promise<T>,
): Promise<AudioServiceResult<T>> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    console.error('Audio service error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
