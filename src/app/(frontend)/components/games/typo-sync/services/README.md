# Audio Analysis Service - React Query Integration

This document describes the React Query integration for the TypoSync audio analysis service.

## Overview

The audio analysis service has been updated to use TanStack Query (React Query) instead of direct fetch calls. This provides better caching, retry logic, and state management.

## Architecture

### Files

1. **`audioAnalysisQueryService.ts`** - New React Query-based service with mutation and query functions
2. **`audioAnalysisService.ts`** - Updated wrapper that maintains backward compatibility by delegating to the query service
3. **`useAudioAnalysisQuery.ts`** - React hooks that re-export from the query service

### Key Features

- **Automatic Caching**: Query results are cached automatically by React Query
- **Retry Logic**: Failed requests are retried with exponential backoff
- **Optimistic Updates**: UI updates immediately while requests are in flight
- **Background Refetching**: Stale data is refetched automatically
- **Turnstile Security**: Integrated security token validation for cloud processing

## Usage

### Basic Usage with Hooks

```tsx
import { useOptimizedAudioAnalysis } from '../hooks/useAudioAnalysisQuery'

function AudioUploadComponent() {
  const { analyzeAudio, isAnalyzing, error, result } = useOptimizedAudioAnalysis()

  const handleFileUpload = async (file: File, turnstileToken: string) => {
    analyzeAudio({
      file,
      priority: 'normal',
      turnstileToken
    })
  }

  return (
    <div>
      {isAnalyzing && <div>Analyzing audio...</div>}
      {error && <div>Error: {error.message}</div>}
      {result && <div>Analysis complete: {result.analysis_info.total_beats} beats</div>}
    </div>
  )
}
```

### Individual Hooks

```tsx
// Check cache for existing analysis
const { data: cachedResult } = useAudioCacheQuery(audioHash, !!audioHash)

// Upload file for analysis
const uploadMutation = useAudioUploadMutation()
uploadMutation.mutate({ file, priority: 'high', turnstileToken })

// Poll for results
const { data: analysisResult } = useAnalysisResultQuery(taskId, !!taskId)

// Generate audio hash
const hashMutation = useAudioHashMutation()
const hash = await hashMutation.mutateAsync(file)
```

### Backward Compatibility

The original `audioAnalysisService` interface is preserved:

```tsx
import { audioAnalysisService } from '../services/audioAnalysisService'

// These still work exactly as before
const cachedResult = await audioAnalysisService.checkCache(audioHash)
const uploadResult = await audioAnalysisService.uploadForAnalysis(file, priority, turnstileToken)
const analysisResult = await audioAnalysisService.analyzeAudioFile(file, priority, turnstileToken)
```

## Security Integration

### Turnstile Token Validation

All cloud processing requests now require a Turnstile token:

```tsx
// In GameControls component
const handleFileUpload = async (file: File, turnstileToken: string) => {
  if (cloudProcessingEnabled && !turnstileToken) {
    setShowTurnstile(true)
    return
  }
  
  // Upload with token
  onFileUpload(file, turnstileToken)
}
```

### Error Handling

The service includes specific error handling for security failures:

- `403` errors → "Security verification failed"
- `400` errors with "turnstile" → "Security verification is required"

## Query Keys

React Query uses structured query keys for caching:

```tsx
const audioAnalysisKeys = {
  all: ['audio-analysis'],
  cache: (audioHash: string) => ['audio-analysis', 'cache', audioHash],
  result: (taskId: string) => ['audio-analysis', 'result', taskId],
  results: () => ['audio-analysis', 'results'],
}
```

## Cache Management

### Automatic Cache Updates

- Cache hits update the cache query automatically
- Successful uploads invalidate related queries
- Failed requests don't affect cached data

### Manual Cache Control

```tsx
const { invalidateAll, invalidateCache, removeCache } = useInvalidateAudioCache()

// Invalidate all audio analysis queries
invalidateAll()

// Invalidate specific cache entry
invalidateCache(audioHash)

// Remove cache entry completely
removeCache(audioHash)
```

## Performance Optimizations

### Parallel Processing

The service uses React Query's parallel processing capabilities:

```tsx
// Multiple queries run in parallel
const { data: cachedResult } = useAudioCacheQuery(audioHash)
const { data: analysisResult } = useAnalysisResultQuery(taskId)
```

### Polling Strategy

Analysis results are polled using React Query's built-in polling:

```tsx
refetchInterval: (data) => {
  // Stop polling when complete
  if (data?.state === 'SUCCESS' || data?.state === 'FAILURE') {
    return false
  }
  return 2000 // Poll every 2 seconds
}
```

### Background Updates

React Query automatically refetches stale data in the background, ensuring the UI always shows the latest information.

## Migration Notes

### For Existing Code

1. **No changes required** - The original service interface is preserved
2. **Optional enhancement** - Can migrate to hooks for better React integration
3. **Automatic benefits** - Caching and retry logic work automatically

### For New Code

1. **Use hooks** - Prefer `useOptimizedAudioAnalysis` for new components
2. **Leverage caching** - Use `useAudioCacheQuery` for cache-first workflows
3. **Handle loading states** - Use `isAnalyzing` and `error` from hooks

## Testing

The service includes comprehensive error handling and graceful degradation:

- Network failures are retried automatically
- Invalid files are validated before upload
- Security failures provide clear error messages
- Cache misses fall back to server requests

## Future Enhancements

1. **Offline Support**: React Query can be extended with offline capabilities
2. **Optimistic Updates**: Could update UI immediately before server confirmation
3. **Pagination**: For large result sets, React Query supports infinite queries
4. **Real-time Updates**: WebSocket integration for real-time analysis status
