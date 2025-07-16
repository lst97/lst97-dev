import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AnalyzeResponse, TaskResultResponse, Priority } from '../types'

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
interface AnalyzeResponseWithCache extends Omit<AnalyzeResponse, 'cache_hit'> {
  cache_hit?: boolean
  // When cache_hit is true, the full result data is included
  result?: CacheResponse
  audioHash?: string
}

/**
 * React Query-based Audio Analysis Service
 * Replaces direct fetch calls with TanStack Query for better caching and state management
 */
export class AudioAnalysisQueryService {
  private readonly baseUrl: string
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
  async generateAudioHash(file: File): Promise<string> {
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
   * Query function for checking cache
   */
  async checkCacheQuery(audioHash: string): Promise<CacheResponse | null> {
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
   * Mutation function for uploading audio for analysis
   */
  async uploadForAnalysisMutation({
    file,
    priority = 'normal',
    turnstileToken,
  }: {
    file: File
    priority?: Priority
    turnstileToken?: string
  }): Promise<AnalyzeResponseWithCache> {
    this.validateFile(file)

    // Generate audio hash and check cache first
    const audioHash = await this.generateAudioHash(file)
    const cachedResult = await this.checkCacheQuery(audioHash)

    if (cachedResult) {
      // Return cached data in the same format as analyze response
      return {
        task_id: '', // Not needed for cached results
        backend: 'in-memory',
        cache_hit: true,
        queue_position: 0,
        estimated_wait_time_minutes: 0,
        result: cachedResult,
        audioHash,
      }
    }

    // Cache miss - proceed with analysis
    const formData = new FormData()
    formData.append('audio', file)
    formData.append('priority', priority)

    // Add turnstile token for security verification
    if (turnstileToken) {
      formData.append('turnstile_token', turnstileToken)
    }

    const response = await fetch(`${this.baseUrl}/v2/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Handle specific security errors
      if (response.status === 403) {
        throw new Error('Security verification failed. Please complete the Turnstile verification.')
      }

      if (response.status === 400 && errorData.error?.includes('turnstile')) {
        throw new Error('Security verification is required for cloud processing.')
      }

      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = (await response.json()) as AnalyzeResponseWithCache

    // If the response includes cached data (cache hit on server side)
    if (result.cache_hit) {
      return { ...result, audioHash }
    }

    // Normal analysis response
    return {
      ...result,
      cache_hit: false,
      audioHash,
    }
  }

  /**
   * Query function for getting analysis results by task ID
   */
  async getAnalysisResultQuery(taskId: string): Promise<TaskResultResponse> {
    const response = await fetch(`${this.baseUrl}/v2/results/${taskId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Load audio file as AudioBuffer for playback
   */
  async loadAudioBuffer(file: File, audioContext: AudioContext): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer()
    return audioContext.decodeAudioData(arrayBuffer)
  }

  /**
   * Load sound effects files for game audio
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

// Query keys for React Query
export const audioAnalysisKeys = {
  all: ['audio-analysis'] as const,
  cache: (audioHash: string) => [...audioAnalysisKeys.all, 'cache', audioHash] as const,
  result: (taskId: string) => [...audioAnalysisKeys.all, 'result', taskId] as const,
  results: () => [...audioAnalysisKeys.all, 'results'] as const,
} as const

// Create service instance
export const audioAnalysisQueryService = new AudioAnalysisQueryService(
  process.env.TYPO_SYNC_BACKEND_URL,
)

/**
 * Hook for checking cache for existing analysis
 */
export function useAudioCacheQuery(audioHash: string, enabled = true) {
  return useQuery({
    queryKey: audioAnalysisKeys.cache(audioHash),
    queryFn: () => audioAnalysisQueryService.checkCacheQuery(audioHash),
    enabled: enabled && !!audioHash,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

/**
 * Hook for polling analysis results
 */
export function useAnalysisResultQuery(taskId: string, enabled = true) {
  return useQuery({
    queryKey: audioAnalysisKeys.result(taskId),
    queryFn: () => audioAnalysisQueryService.getAnalysisResultQuery(taskId),
    enabled: enabled && !!taskId,
    refetchInterval: (query) => {
      // Stop polling if analysis is complete or failed
      // Access data through query.state.data since this is the Query object
      if (
        query.state.status === 'success' &&
        query.state.data &&
        (query.state.data.state === 'SUCCESS' ||
        query.state.data.state === 'FAILURE' ||
        query.state.data.state === 'ERROR')
      ) {
        return false
      }
      return 2000 // Poll every 2 seconds
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Stop retrying if we get specific error states
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string
        if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('FAILURE')) {
          return false
        }
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook for uploading audio for analysis
 */
export function useAudioUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: audioAnalysisQueryService.uploadForAnalysisMutation.bind(audioAnalysisQueryService),
    onSuccess: (data: AnalyzeResponseWithCache) => {
      // If we got cached data, update the cache query
      if (data.cache_hit && data.result && data.audioHash) {
        queryClient.setQueryData(audioAnalysisKeys.cache(data.audioHash), data.result)
      }
    },
    onError: (error) => {
      console.error('Audio upload failed:', error)
    },
  })
}

/**
 * Hook for generating audio hash
 */
export function useAudioHashMutation() {
  return useMutation({
    mutationFn: (file: File) => audioAnalysisQueryService.generateAudioHash(file),
    onError: (error) => {
      console.error('Audio hash generation failed:', error)
    },
  })
}

/**
 * Hook for file validation
 */
export function useFileValidation() {
  return useMutation({
    mutationFn: (file: File) => {
      audioAnalysisQueryService.validateFile(file)
      return Promise.resolve(true)
    },
    onError: (error) => {
      console.error('File validation failed:', error)
    },
  })
}

/**
 * Combined hook for optimized audio analysis workflow using React Query
 */
export function useOptimizedAudioAnalysisQuery() {
  const queryClient = useQueryClient()
  const hashMutation = useAudioHashMutation()
  const uploadMutation = useAudioUploadMutation()

  const analyzeWithOptimization = useMutation({
    mutationFn: async ({
      file,
      priority = 'normal',
      turnstileToken,
    }: {
      file: File
      priority?: Priority
      turnstileToken?: string
    }) => {
      // Step 1: Validate file
      audioAnalysisQueryService.validateFile(file)

      // Step 2: Generate hash and check cache
      const audioHash = await hashMutation.mutateAsync(file)
      const cachedResult = await queryClient.fetchQuery({
        queryKey: audioAnalysisKeys.cache(audioHash),
        queryFn: () => audioAnalysisQueryService.checkCacheQuery(audioHash),
      })

      if (cachedResult) {
        return cachedResult
      }

      // Step 3: Upload for analysis
      const uploadResult = (await uploadMutation.mutateAsync({
        file,
        priority,
        turnstileToken,
      })) as AnalyzeResponseWithCache

      // Step 4: If cached on server, return immediately
      if (uploadResult.cache_hit && uploadResult.result) {
        return uploadResult.result
      }

      // Step 5: Poll for results using React Query
      if (uploadResult.task_id) {
        // Continue polling until complete
        let attempts = 0
        const maxAttempts = 60

        while (attempts < maxAttempts) {
          const result = (await queryClient.fetchQuery({
            queryKey: audioAnalysisKeys.result(uploadResult.task_id),
            queryFn: () => audioAnalysisQueryService.getAnalysisResultQuery(uploadResult.task_id),
          })) as TaskResultResponse

          if (result.state === 'SUCCESS') {
            return result.result as CacheResponse
          }

          if (
            result.state === 'FAILURE' ||
            result.state === 'ERROR' ||
            result.state === 'NOT_FOUND'
          ) {
            throw new Error(`Analysis failed: ${result.status || 'Unknown error'}`)
          }

          // Wait before next poll
          await new Promise((resolve) => setTimeout(resolve, 2000))
          attempts++
        }

        throw new Error('Analysis timeout - maximum polling attempts exceeded')
      }

      throw new Error('No task ID received for analysis')
    },
    onError: (error) => {
      console.error('Optimized audio analysis failed:', error)
    },
  })

  return {
    analyzeAudio: analyzeWithOptimization.mutate,
    analyzeAudioAsync: analyzeWithOptimization.mutateAsync,
    isAnalyzing: analyzeWithOptimization.isPending,
    error: analyzeWithOptimization.error,
    result: analyzeWithOptimization.data,
    reset: analyzeWithOptimization.reset,
  }
}

/**
 * Hook for invalidating audio analysis cache
 */
export function useInvalidateAudioCache() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: audioAnalysisKeys.all }),
    invalidateCache: (audioHash: string) =>
      queryClient.invalidateQueries({ queryKey: audioAnalysisKeys.cache(audioHash) }),
    invalidateResult: (taskId: string) =>
      queryClient.invalidateQueries({ queryKey: audioAnalysisKeys.result(taskId) }),
    removeCache: (audioHash: string) =>
      queryClient.removeQueries({ queryKey: audioAnalysisKeys.cache(audioHash) }),
    removeResult: (taskId: string) =>
      queryClient.removeQueries({ queryKey: audioAnalysisKeys.result(taskId) }),
  }
}

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
