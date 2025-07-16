import type {
  AnalyzeResponse,
  TaskResultResponse,
  SuccessResponse,
  StatusResponse,
  FailureResponse,
  Priority,
} from '../types'

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

// Cache endpoint response wrapper
interface CacheEndpointResponse {
  audio_hash: string
  result: CacheResponse
  cached_at: string
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
  private readonly maxFileSize: number = 50 * 1024 * 1024 // 50MB
  private readonly supportedTypes: string[] = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/flac',
  ]

  constructor(baseUrl = 'http://127.0.0.1:8000') {
    this.baseUrl = baseUrl
  }

  /**
   * Validate audio file before upload
   * @param file - Audio file to validate
   * @throws Error if validation fails
   */
  validateFile(file: File): void {
    // File size validation
    if (file.size > this.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`)
    }

    // File type validation
    if (!this.supportedTypes.includes(file.type)) {
      throw new Error(
        `Unsupported file type: ${file.type}. Supported types: ${this.supportedTypes.join(', ')}`,
      )
    }
  }

  /**
   * Generate audio hash for cache lookup (matches backend format exactly)
   * @param file - Audio file to generate hash for
   * @returns Promise with audio hash string
   */
  private async generateAudioHash(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = new Uint8Array(arrayBuffer)
      const hashBuffer = await crypto.subtle.digest('SHA-256', audioBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

      return hashHex
    } catch (_error) {
      throw new Error('Content hash generation failed')
    }
  }

  /**
   * Check cache for existing analysis
   * @param audioHash - Audio file hash
   * @returns Promise with cached analysis or null if not found
   */
  async checkCache(audioHash: string): Promise<CacheResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/${audioHash}`)

      if (response.ok) {
        const cacheData: CacheEndpointResponse = await response.json()
        return cacheData.result
      }

      // 404 means not in cache, other errors should be handled
      if (response.status === 404) {
        return null
      }

      throw new Error(`Cache check failed: ${response.status}`)
    } catch (error) {
      console.warn('Cache check failed:', error)
      return null
    }
  }

  /**
   * Upload audio file for analysis with cache optimization
   * @param file - Audio file to analyze
   * @param priority - Processing priority (high, normal, batch)
   * @returns Promise with enhanced response including queue info or cached data
   */
  async uploadForAnalysis(
    file: File,
    priority: Priority = 'normal',
  ): Promise<EnhancedAnalyzeResponse> {
    this.validateFile(file)

    // Generate audio hash and check cache first
    const audioHash = await this.generateAudioHash(file)
    const cachedResult = await this.checkCache(audioHash)

    if (cachedResult) {
      // Return cached data in the same format as analyze response
      return {
        task_id: '', // Not needed for cached results
        backend: 'in-memory',
        cache_hit: true,
        queue_position: 0,
        estimated_wait_time_minutes: 0,
        result: cachedResult,
      }
    }

    // Cache miss - proceed with analysis
    const formData = new FormData()
    formData.append('audio', file)
    formData.append('priority', priority)

    const response = await fetch(`${this.baseUrl}/v2/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = (await response.json()) as EnhancedAnalyzeResponse

    // If the response includes cached data (cache hit on server side)
    if (result.cache_hit) {
      return result
    }

    // Normal analysis response
    return {
      ...result,
      cache_hit: false,
    }
  }

  /**
   * Get analysis results by task ID (polling-based)
   * @param taskId - Task ID from upload response
   * @returns Promise with task result
   */
  async getAnalysisResult(taskId: string): Promise<TaskResultResponse> {
    const response = await fetch(`${this.baseUrl}/v2/results/${taskId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Analyze audio file with optimized caching workflow
   * @param file - Audio file to analyze
   * @param priority - Processing priority (high, normal, batch)
   * @returns Promise with analysis result (either cached or processed)
   */
  async analyzeAudioFile(file: File, priority: Priority = 'normal'): Promise<CacheResponse> {
    const uploadResult = await this.uploadForAnalysis(file, priority)

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
    beat: AudioBuffer | null
  }> {
    const soundEffects = {
      base: null as AudioBuffer | null,
      hiHat: null as AudioBuffer | null,
      tambourine: null as AudioBuffer | null,
      beat: null as AudioBuffer | null,
    }

    try {
      const [baseResponse, hiHatResponse, tambourineResponse, beatResponse] =
        await Promise.allSettled([
          fetch(`${baseUrl}base.mp3`).then((res) => res.arrayBuffer()),
          fetch(`${baseUrl}hi-hat.mp3`).then((res) => res.arrayBuffer()),
          fetch(`${baseUrl}tambourine.mp3`).then((res) => res.arrayBuffer()),
          fetch(`${baseUrl}beat.wav`).then((res) => res.arrayBuffer()),
        ])

      if (baseResponse.status === 'fulfilled') {
        soundEffects.base = await audioContext.decodeAudioData(baseResponse.value)
      }

      if (hiHatResponse.status === 'fulfilled') {
        soundEffects.hiHat = await audioContext.decodeAudioData(hiHatResponse.value)
      }

      if (tambourineResponse.status === 'fulfilled') {
        soundEffects.tambourine = await audioContext.decodeAudioData(tambourineResponse.value)
      } else {
        console.error('Failed to load tambourine.mp3:', tambourineResponse.reason)
      }

      if (beatResponse.status === 'fulfilled') {
        soundEffects.beat = await audioContext.decodeAudioData(beatResponse.value)
      } else {
        console.error('Failed to load beat.wav:', beatResponse.reason)
      }
    } catch (error) {
      console.warn('Error loading some sound effects:', error)
    }

    return soundEffects
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
