import React from 'react'
import ModelLoadingProgress from './ModelLoadingProgress'

interface ImageUploadControlProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onStartBatch: () => void
  modelLoaded: boolean
  isBatchActive: boolean
  hasPendingOrQueuedJobs: boolean
  modelLoading: boolean
  remainingJobCount: number
  modelLoadingProgress?: number
  modelLoadingStatus?: string
}

export const ImageUploadControl: React.FC<ImageUploadControlProps> = React.memo(
  ({
    onFileChange,
    onStartBatch,
    modelLoaded,
    isBatchActive,
    hasPendingOrQueuedJobs,
    modelLoading,
    remainingJobCount,
    modelLoadingProgress = 0,
    modelLoadingStatus = '',
  }) => {
    return (
      <div className="flex flex-col gap-2 mb-4">
        {/* Show model loading progress when model is loading */}
        {modelLoading && (
          <ModelLoadingProgress
            isLoading={modelLoading}
            progress={modelLoadingProgress}
            status={modelLoadingStatus}
          />
        )}

        <label className="flex flex-col gap-1">
          <span>Select images:</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="border border-gray-300 p-2 rounded"
            disabled={modelLoading || isBatchActive}
          />
        </label>
        {(hasPendingOrQueuedJobs || isBatchActive) && (
          <button
            onClick={onStartBatch}
            disabled={!modelLoaded || isBatchActive || modelLoading}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed mt-2"
          >
            {isBatchActive ? 'Processing Batch...' : 'Start Processing Batch'}
            {isBatchActive && remainingJobCount > 0 && ` (${remainingJobCount} remaining)`}
          </button>
        )}
      </div>
    )
  },
)

ImageUploadControl.displayName = 'ImageUploadControl'
