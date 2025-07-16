import { 
  audioAnalysisKeys,
  useAudioCacheQuery,
  useAnalysisResultQuery,
  useAudioUploadMutation,
  useAudioHashMutation,
  useFileValidation,
  useOptimizedAudioAnalysisQuery,
  useInvalidateAudioCache
} from '../services/audioAnalysisQueryService'

// Re-export all hooks from the query service
export {
  audioAnalysisKeys,
  useAudioCacheQuery,
  useAnalysisResultQuery,
  useAudioUploadMutation,
  useAudioHashMutation,
  useFileValidation,
  useOptimizedAudioAnalysisQuery as useOptimizedAudioAnalysis,
  useInvalidateAudioCache
}