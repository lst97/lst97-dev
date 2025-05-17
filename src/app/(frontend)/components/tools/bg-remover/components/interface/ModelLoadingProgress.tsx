'use client'

import React, { useEffect, useState } from 'react'
import { PixelProgressBar } from '@/frontend/components/ui'

/**
 * Base interface for common progress information.
 */
interface BaseProgressInfo {
  status?: string
  file?: string
  loaded?: number
  total?: number
}

/**
 * Interface for progress objects that provide a direct percentage.
 */
interface ProgressWithDirectPercentage extends BaseProgressInfo {
  progress: number // Percentage value (0-100)
}

/**
 * Interface for progress objects that provide loaded and total byte counts.
 * The `progress` field (direct percentage) should not be the primary source here.
 */
interface ProgressWithLoadedTotal extends BaseProgressInfo {
  loaded: number
  total: number
  progress?: never // Ensures this variant is distinct if 'progress' field is checked first
}

/**
 * Union type for the `progress` prop, accommodating various data structures from
 * Hugging Face transformers or a simple percentage number.
 */
type ModelProgressType = ProgressWithDirectPercentage | ProgressWithLoadedTotal | number

/**
 * Props for the ModelLoadingProgress component.
 */
type ModelLoadingProgressProps = {
  /** Indicates whether the model is currently being loaded. If false, the component renders nothing. */
  isLoading: boolean
  /**
   * The progress object from Hugging Face transformers or a raw percentage number.
   * This prop can have various structures:
   * - An object with a `progress` field (number): \`{ progress: 50, status: "downloading", file: "model.bin", loaded: 12345, total: 24690 }\`
   * - An object with \`loaded\` and \`total\` fields (number): \`{ loaded: 12345, total: 24690, status: "downloading_part" }\`
   * - A direct number representing the percentage (0-100).
   * The component adapts to these different formats to display progress.
   */
  progress: ModelProgressType
  /** A string describing the current status of the loading process (e.g., "Downloading model...", "Initializing..."). */
  status: string
}

/**
 * `ModelLoadingProgress` is a client-side component responsible for displaying the progress
 * of an AI model being loaded, typically from Hugging Face transformers.
 * It visualizes the progress using a pixel-art styled progress bar and provides
 * textual feedback including percentage, status messages, current file being downloaded,
 * and loaded/total size.
 *
 * The component is designed to handle various formats of progress data provided
 * by the Hugging Face transformers library. It intelligently parses this data
 * to update its display.
 *
 * @param isLoading - Controls the visibility of the component. If \`true\`, the progress display is shown.
 * @param progress - The progress data. Can be an object with details like \`progress\`, \`loaded\`, \`total\`, \`file\`, \`status\`, or a simple number representing the percentage.
 * @param status - A string message indicating the current loading status.
 */
const ModelLoadingProgress: React.FC<ModelLoadingProgressProps> = ({
  isLoading,
  progress,
  status,
}) => {
  const [displayPercentage, setDisplayPercentage] = useState<number>(0)
  const [progressDetails, setProgressDetails] = useState<string>('')
  const [fileSize, setFileSize] = useState<{ loaded: number; total: number } | null>(null)
  const [currentFile, setCurrentFile] = useState<string>('')

  // Process and extract useful information from the Hugging Face transformers progress object
  useEffect(() => {
    console.log(
      '[ModelLoadingProgress] Received progress prop:',
      progress ? JSON.parse(JSON.stringify(progress)) : progress,
    )
    // Reset progress display when no progress data is available
    if (!progress) {
      setDisplayPercentage(0)
      setProgressDetails('')
      setFileSize(null)
      setCurrentFile('')
      return
    }

    // Process progress data based on its structure
    if (typeof progress === 'object' && progress !== null) {
      // Case 1: Progress data is an object.

      // Check for a direct 'progress' field (often a percentage from 0-100 from Hugging Face).
      if (typeof progress.progress === 'number') {
        setDisplayPercentage(progress.progress)

        // Set status text if available
        if (progress.status) {
          setProgressDetails(progress.status)
        }

        // Extract file information if available
        if (progress.file) {
          setCurrentFile(progress.file)
        } else {
          setCurrentFile('')
        }

        // Extract size information for progress bar if available
        if (typeof progress.loaded === 'number' && typeof progress.total === 'number') {
          setFileSize({
            loaded: progress.loaded,
            total: progress.total,
          })
        } else {
          setFileSize(null)
        }
      }
      // Case 2: Fallback to 'loaded' and 'total' fields for percentage calculation.
      // This handles cases where only byte counts are provided.
      else if (
        typeof progress.loaded === 'number' &&
        typeof progress.total === 'number' &&
        progress.total > 0
      ) {
        const percentage = Math.min((progress.loaded / progress.total) * 100, 100)
        setDisplayPercentage(percentage)
        setFileSize({
          loaded: progress.loaded,
          total: progress.total,
        })
        // Note: \`status\` and \`file\` might not be available in this specific progress object structure.
        // They will retain previous values or be empty if not explicitly updated here.
      }
      // If the object structure is not recognized (e.g., missing 'progress' or 'loaded'/'total'),
      // displayPercentage and other states will retain their previous values.
      // This prevents flickering or loss of information if an intermediate progress update is malformed.
    }
    // Case 3: Progress data is a direct number (assumed to be a percentage 0-100).
    else if (typeof progress === 'number') {
      // If 'progress' is a raw number, assume it's already a percentage (0-100).
      setDisplayPercentage(progress)
      // Clear other details as they are typically not provided with a raw number.
      setProgressDetails('')
      setFileSize(null)
      setCurrentFile('')
    }
    // Case 4: Progress data is not an object or number (e.g., null, undefined, or other unexpected type after the initial check).
    else {
      setDisplayPercentage(0)
      setProgressDetails('Waiting for progress data...')
      setFileSize(null)
      setCurrentFile('')
    }
  }, [progress])

  if (!isLoading) return null

  return (
    <div className="mb-8 border-4 border-border bg-card p-6 rounded-none shadow-[8px_8px_0_#000] relative">
      {/* Pixel noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #000 25%, transparent 25%), 
            linear-gradient(-45deg, #000 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #000 75%), 
            linear-gradient(-45deg, transparent 75%, #000 75%)
          `,
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
          mixBlendMode: 'overlay',
        }}
        aria-hidden="true"
      />

      <div className="flex flex-col space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-['Press_Start_2P'] text-sm">Loading AI Model</h3>
          <span className="font-['Press_Start_2P'] text-xs">{Math.round(displayPercentage)}%</span>
        </div>

        {/* Using the new PixelProgressBar */}
        <PixelProgressBar value={displayPercentage} height={16} animated={true} />

        {/* Status message */}
        <div className="font-['Press_Start_2P'] text-xs" style={{ color: 'var(--color-accent)' }}>
          {status || progressDetails || 'Initializing model...'}
        </div>

        {/* File information */}
        {currentFile && (
          <div className="text-xs font-['Press_Start_2P'] mt-1 opacity-80">File: {currentFile}</div>
        )}

        {/* Size information */}
        {fileSize && (
          <div className="text-xs font-['Press_Start_2P'] mt-1 opacity-80">
            {formatBytes(fileSize.loaded)} of {formatBytes(fileSize.total)}
          </div>
        )}

        <div className="text-xs opacity-70 font-['Press_Start_2P'] mt-2">
          Please wait while the background removal AI model is being downloaded. This may take a few
          moments depending on your connection speed.
        </div>
      </div>
    </div>
  )
}

// Helper function to format bytes into human-readable format
/**
 * Formats a number of bytes into a human-readable string (e.g., KB, MB, GB).
 * @param bytes - The number of bytes to format.
 * @returns A string representing the formatted bytes (e.g., "1.23 MB"). Returns "0 Bytes" if input is 0.
 */
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default ModelLoadingProgress
