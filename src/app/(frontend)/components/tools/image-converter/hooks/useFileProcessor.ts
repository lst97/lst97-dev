'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ImageInfo, SupportedFormat, ProcessingFile, ImageMetadata } from '../types'
import { processHeicFile, generateImageId } from '../services/imageConversionService'
import { extractImageMetadata, extractDimensionsFromImage } from '../services/imageMetadata'

// Simple HEIC file check
const isHeicFile = (file: File): boolean => {
  // Check by extension
  if (file.name.toLowerCase().endsWith('.heic')) {
    return true
  }

  // Check by MIME type
  return file.type === 'image/heic' || file.type === 'image/heif'
}

type UseFileProcessorProps = {
  onFilesProcessed: (images: ImageInfo[]) => void
  onError: (error: string) => void
}

// Configuration for batch processing
const BATCH_SIZE = 3 // Process files in batches of 3
const BATCH_DELAY = 50 // Wait 50ms between batches to let UI breathe
const USE_IDLE_CALLBACK = true // Use requestIdleCallback when available

export const useFileProcessor = ({ onFilesProcessed, onError }: UseFileProcessorProps) => {
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([])

  // Refs to track ongoing processing
  const processingQueueRef = useRef<ProcessingFile[]>([])
  const isProcessingRef = useRef<boolean>(false)
  const processedImagesRef = useRef<ImageInfo[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Abort any ongoing processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  // Update the status of a processing file
  const updateFileStatus = useCallback(
    (
      id: string,
      status: ProcessingFile['status'],
      additionalData: Partial<ProcessingFile> = {},
    ) => {
      setProcessingFiles((prevFiles) =>
        prevFiles.map((file) => (file.id === id ? { ...file, status, ...additionalData } : file)),
      )
    },
    [],
  )

  // Client-side HEIC conversion using heic-convert/browser
  const convertHeicOnClient = useCallback(
    async (processingFile: ProcessingFile): Promise<{ file: File; originalType: string }> => {
      const { id, file } = processingFile

      // Update status to converting HEIC
      updateFileStatus(id, 'converting_heic', { progressPercent: 20 })

      try {
        // Dynamically import client-side converter
        const { clientSideHeicConvertor: clientSideHeicConvert } = await import(
          '@/frontend/components/tools/image-converter/components/engine/heicConverter'
        )

        // Update progress
        updateFileStatus(id, 'converting_heic', { progressPercent: 40 })

        // Convert using client-side converter - yield to main thread for animation
        await new Promise((resolve) => setTimeout(resolve, 0))

        const objectUrl = await clientSideHeicConvert(file, 'JPEG', 90)

        // Update progress
        updateFileStatus(id, 'converting_heic', { progressPercent: 60 })

        // Convert object URL to File
        const response = await fetch(objectUrl)
        const blob = await response.blob()

        // Create File object
        const convertedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg',
        })

        // Release the object URL to free memory
        URL.revokeObjectURL(objectUrl)

        return {
          file: convertedFile,
          originalType: 'image/heic',
        }
      } catch (error) {
        console.error('Client-side HEIC conversion error:', error)

        try {
          // Yield to main thread before starting CPU-intensive operation
          await new Promise((resolve) => setTimeout(resolve, 0))

          const convertedFile = await processHeicFile(file)
          return {
            file: convertedFile,
            originalType: 'image/heic',
          }
        } catch (fallbackError) {
          console.error('Fallback conversion also failed:', fallbackError)
          throw new Error(
            `Failed to convert HEIC file: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      }
    },
    [updateFileStatus],
  )

  // Extract metadata using our utility function instead of a worker
  const extractMetadataFromImage = useCallback(
    async (
      processingFile: ProcessingFile,
    ): Promise<{
      dimensions: { width: number; height: number }
      metadata: ImageMetadata | null
    }> => {
      const { id, file, previewUrl } = processingFile

      // Update status to extracting metadata
      updateFileStatus(id, 'extracting_metadata', { progressPercent: 70 })

      try {
        // Try to extract metadata using ExifReader
        const result = await extractImageMetadata(file)

        // If dimensions weren't found in metadata, try to get them from the image preview
        if (previewUrl && (!result.dimensions.width || !result.dimensions.height)) {
          try {
            const imageDimensions = await extractDimensionsFromImage(previewUrl)
            result.dimensions = imageDimensions
          } catch (err) {
            console.warn('Failed to extract dimensions from preview image:', err)
          }
        }

        return result
      } catch (error) {
        console.warn('Metadata extraction error:', error)

        // If we have a preview URL, try to get dimensions from it as fallback
        if (previewUrl) {
          try {
            const dimensions = await extractDimensionsFromImage(previewUrl)
            return { dimensions, metadata: null }
          } catch (err) {
            console.warn('Failed to extract dimensions from preview image:', err)
          }
        }

        return { dimensions: { width: 0, height: 0 }, metadata: null }
      }
    },
    [updateFileStatus],
  )

  // Process a single file to generate preview and extract metadata
  const processFile = useCallback(
    async (processingFile: ProcessingFile, signal?: AbortSignal) => {
      try {
        // Check if processing has been aborted
        if (signal?.aborted) {
          throw new Error('Processing aborted')
        }

        const { id, file } = processingFile
        let currentFile = file
        let originalType: SupportedFormat | undefined = undefined
        const originalSize = file.size

        // Update status to reading
        updateFileStatus(id, 'reading', { progressPercent: 10 })

        // Check if this is a HEIC file
        const isHeic = isHeicFile(file)

        // Convert HEIC to JPEG if needed using client-side processing
        if (isHeic) {
          try {
            // Allow UI to update before CPU-intensive work
            await new Promise((resolve) => setTimeout(resolve, 0))

            if (signal?.aborted) throw new Error('Processing aborted')

            const { file: convertedFile, originalType: heicOriginalType } =
              await convertHeicOnClient(processingFile)
            currentFile = convertedFile
            originalType = heicOriginalType as SupportedFormat

            // Update the file in the processing file object
            updateFileStatus(id, 'reading', {
              file: currentFile,
              originalType,
              progressPercent: 40,
            })
          } catch (error) {
            if (signal?.aborted) throw new Error('Processing aborted')
            throw new Error(
              `Failed to convert HEIC file: ${error instanceof Error ? error.message : String(error)}`,
            )
          }
        }

        if (signal?.aborted) throw new Error('Processing aborted')

        // Update status to generating preview
        updateFileStatus(id, 'generating_preview', { progressPercent: 50 })

        // Generate preview using createObjectURL
        const previewUrl = URL.createObjectURL(currentFile)

        // Update file with preview
        updateFileStatus(id, 'extracting_metadata', {
          previewUrl,
          progressPercent: 70,
        })

        if (signal?.aborted) throw new Error('Processing aborted')

        // Extract metadata and dimensions using our utility
        const { dimensions, metadata } = await extractMetadataFromImage({
          ...processingFile,
          file: currentFile,
          previewUrl,
        })

        // Create the final image info
        const imageInfo: ImageInfo = {
          id,
          file: currentFile,
          name: file.name,
          size: originalSize,
          type: currentFile.type,
          originalType,
          preview: previewUrl,
          width: dimensions.width,
          height: dimensions.height,
          metadata: metadata || undefined, // Convert null to undefined
        }

        // Mark as completed
        updateFileStatus(id, 'completed', {
          imageInfo,
          width: dimensions.width,
          height: dimensions.height,
          metadata: metadata || undefined, // Convert null to undefined
          progressPercent: 100,
        })

        return imageInfo
      } catch (error) {
        // Don't update status if aborted
        if (error instanceof Error && error.message === 'Processing aborted') {
          throw error
        }

        const errorMessage = error instanceof Error ? error.message : String(error)
        updateFileStatus(processingFile.id, 'error', { error: errorMessage })
        throw error
      }
    },
    [updateFileStatus, convertHeicOnClient, extractMetadataFromImage],
  )

  // Process files in batches to avoid blocking the UI
  const processBatch = useCallback(async () => {
    if (processingQueueRef.current.length === 0 || !isProcessingRef.current) {
      // Done processing
      isProcessingRef.current = false

      // Call the callback with all processed images
      if (processedImagesRef.current.length > 0) {
        onFilesProcessed([...processedImagesRef.current])
        processedImagesRef.current = []
      }

      return
    }

    // Create a new abort controller for this batch
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    // Take a batch of files from the queue
    const batch = processingQueueRef.current.splice(0, BATCH_SIZE)

    try {
      // Process each file in the batch sequentially
      for (const file of batch) {
        if (signal.aborted) break

        try {
          const imageInfo = await processFile(file, signal)
          processedImagesRef.current.push(imageInfo)
        } catch (error) {
          if (error instanceof Error && error.message === 'Processing aborted') {
            break
          }
          console.error(`Error processing file ${file.name}:`, error)
        }

        // Yield to main thread between files to allow UI updates
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      // Schedule next batch using requestIdleCallback if available, or setTimeout as fallback
      if (USE_IDLE_CALLBACK && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        ;(window as Window).requestIdleCallback(
          () => {
            setTimeout(processBatch, 0)
          },
          { timeout: 1000 },
        )
      } else {
        setTimeout(processBatch, BATCH_DELAY)
      }
    } catch (error) {
      console.error('Batch processing error:', error)
      isProcessingRef.current = false
    }
  }, [processFile, onFilesProcessed])

  // Handle multiple files by queuing them for batch processing
  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        onError('No files selected')
        return
      }

      // Filter for supported image types
      const imageFiles = Array.from(files).filter(
        (file) => file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic'),
      )

      if (!imageFiles.length) {
        onError('No supported image files found')
        return
      }

      // Create processing file objects and add to state
      const newProcessingFiles: ProcessingFile[] = imageFiles.map((file) => ({
        id: generateImageId(),
        file,
        status: 'queued',
        name: file.name,
        size: file.size,
        type: file.type,
        progressPercent: 0,
      }))

      // Add the new files to the processing state
      setProcessingFiles((prev) => [...prev, ...newProcessingFiles])

      // Reset abort controller if one exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Add files to the processing queue
      processingQueueRef.current = [...processingQueueRef.current, ...newProcessingFiles]

      // Start processing if not already processing
      if (!isProcessingRef.current) {
        isProcessingRef.current = true
        processedImagesRef.current = []

        // Start batch processing with a small delay to let UI update
        setTimeout(processBatch, 50)
      }
    },
    [onError, processBatch],
  )

  // Allow canceling ongoing processing
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    isProcessingRef.current = false
    processingQueueRef.current = []
    processedImagesRef.current = []
  }, [])

  // Clean up completed files after a delay
  useEffect(() => {
    const completedIds = processingFiles
      .filter((file) => file.status === 'completed' || file.status === 'error')
      .map((file) => file.id)

    if (completedIds.length > 0) {
      const timer = setTimeout(() => {
        setProcessingFiles((prev) =>
          prev.filter(
            (file) =>
              !(
                completedIds.includes(file.id) &&
                (file.status === 'completed' || file.status === 'error')
              ),
          ),
        )
      }, 3000) // Remove completed/error files after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [processingFiles])

  return {
    handleFiles,
    processingFiles,
    clearProcessingFiles: () => setProcessingFiles([]),
    cancelProcessing,
  }
}
