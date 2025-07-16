import type {
  AnalyzeResponse,
  TaskResultResponse,
  SuccessResponse,
  StatusResponse,
  FailureResponse,
  Priority,
} from '../types'
import { audioAnalysisQueryService } from './audioAnalysisQueryService'

// Cache response type - matches the AnalysisResult interface
interface CacheResponse {
  bpm: number
  beat_timestamps: number[]
  melody_map: {
    pitch: string
    start_time: number
    duration: number
  }[]
  analysis_info: {
    total_beats: number
    total_subdivisions: number
    consolidated_notes: number
    filtered_notes: number
    min_note_duration: number
    subdivision_factor: number
  }
}

// Enhanced analyze response that includes cache data when cache hit occurs
interface EnhancedAnalyzeResponse extends Omit<AnalyzeResponse, 'cache_hit'> {
  cache_hit?: boolean
  // When cache_hit is true, the full result data is included
  result?: CacheResponse
}

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
   * Validate audio file before upload
   * @param file - Audio file to validate
   * @throws Error if validation fails
   */
  validateFile(file: File): void {
    return audioAnalysisQueryService.validateFile(file)
  }

  /**
   * Generate audio hash for cache lookup (matches backend format exactly)
   * @param file - Audio file to generate hash for
   * @returns Promise with audio hash string
   */
  async generateAudioHash(file: File): Promise<string> {
    return audioAnalysisQueryService.generateAudioHash(file)
  }

  /**
   * Check cache for existing analysis
   * @param audioHash - Audio file hash
   * @returns Promise with cached analysis or null if not found
   */
  async checkCache(audioHash: string): Promise<CacheResponse | null> {
    return audioAnalysisQueryService.checkCacheQuery(audioHash)
  }

  /**
   * Upload audio file for analysis with cache optimization
   * @param file - Audio file to analyze
   * @param priority - Processing priority (high, normal, batch)
   * @param turnstileToken - Turnstile security token (required for cloud processing)
   * @returns Promise with enhanced response including queue info or cached data
   */
  async uploadForAnalysis(
    file: File,
    priority: Priority = 'normal',
    turnstileToken?: string,
  ): Promise<EnhancedAnalyzeResponse & { audioHash?: string }> {
    return audioAnalysisQueryService.uploadForAnalysisMutation({ file, priority, turnstileToken })
  }

  /**
   * Get analysis results by task ID (polling-based)
   * @param taskId - Task ID from upload response
   * @returns Promise with task result
   */
  async getAnalysisResult(taskId: string): Promise<TaskResultResponse> {
    return audioAnalysisQueryService.getAnalysisResultQuery(taskId)
  }

  /**
   * Analyze audio file with optimized caching workflow
   * @param file - Audio file to analyze
   * @param priority - Processing priority (high, normal, batch)
   * @param turnstileToken - Turnstile security token (required for cloud processing)
   * @returns Promise with analysis result (either cached or processed)
   */
  async analyzeAudioFile(
    file: File,
    priority: Priority = 'normal',
    turnstileToken?: string,
  ): Promise<CacheResponse> {
    const uploadResult = await this.uploadForAnalysis(file, priority, turnstileToken)

    // If we got cached data (either from client-side cache or server-side cache hit), return it immediately
    if (uploadResult.cache_hit && uploadResult.result) {
      return uploadResult.result
    }

    // Otherwise, we need to poll for results using the task_id (cache_hit=false)
    if (!uploadResult.task_id) {
      throw new Error('No task_id provided for analysis')
    }

    // Poll for results
    return this.pollForResults(uploadResult.task_id)
  }

  /**
   * Poll for analysis results until completion
   * @param taskId - Task ID to poll for
   * @param maxAttempts - Maximum polling attempts (default: 60)
   * @param intervalMs - Polling interval in milliseconds (default: 2000)
   * @returns Promise with analysis result
   */
  private async pollForResults(
    taskId: string,
    maxAttempts = 60,
    intervalMs = 2000,
  ): Promise<CacheResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.getAnalysisResult(taskId)

      if (result.state === 'SUCCESS') {
        return result.result as CacheResponse
      }

      if (result.state === 'FAILURE' || result.state === 'ERROR' || result.state === 'NOT_FOUND') {
        throw new Error(`Analysis failed: ${result.status || 'Unknown error'}`)
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error('Analysis timeout - maximum polling attempts exceeded')
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
    this.eventSource = new EventSource(`${this.baseUrl}/v2/stream/${taskId}`)

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
          case 'ERROR':
          case 'NOT_FOUND':
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
    return audioAnalysisQueryService.loadAudioBuffer(file, audioContext)
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
    beat: AudioBuffer | null
  }> {
    return audioAnalysisQueryService.loadSoundEffects(audioContext, baseUrl)
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
    return audioAnalysisQueryService.loadMelodySound(audioContext, baseUrl)
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
    return audioAnalysisQueryService.playAudioBuffer(
      audioBuffer,
      audioContext,
      when,
      offset,
      duration,
    )
  }

  /**
   * Create and initialize Web Audio API context
   * @returns Promise with audio context (handles user gesture requirements)
   */
  async createAudioContext(): Promise<AudioContext> {
    return audioAnalysisQueryService.createAudioContext()
  }
}

// Create default instance
export const audioAnalysisService = new AudioAnalysisService(process.env.TYPO_SYNC_BACKEND_URL)

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
