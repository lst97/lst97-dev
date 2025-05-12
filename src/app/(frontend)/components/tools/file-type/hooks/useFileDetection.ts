'use client'

import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DetectionResult, ProcessingFile } from '../types'
import CombinedDetector from '../engine/combinedDetector'

// Configuration for batch processing
const BATCH_SIZE = 3 // Process files in batches of 3
const BATCH_DELAY = 50 // Wait 50ms between batches to let UI breathe

export const useFileDetection = () => {
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([])
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // Refs to track ongoing processing
  const processingQueueRef = useRef<ProcessingFile[]>([])
  const isProcessingRef = useRef<boolean>(false)
  const detectorRef = useRef<CombinedDetector | null>(null)
  const resultsRef = useRef<DetectionResult[]>([])

  // Generate a unique ID for a file
  const generateFileId = useCallback((): string => {
    return `file_${uuidv4()}_${Date.now()}`
  }, [])

  // Initialize detector if not already done
  const initDetector = useCallback(async () => {
    if (!detectorRef.current) {
      try {
        detectorRef.current = new CombinedDetector()
        const initialized = await detectorRef.current.initialize()
        return initialized
      } catch (error) {
        console.error('Failed to initialize file type detector:', error)
        return false
      }
    }
    return true
  }, [])

  // Process a single file with combined detector
  const processFile = useCallback(
    async (processingFile: ProcessingFile) => {
      // Update file status to processing
      setProcessingFiles((prev) =>
        prev.map((f) => (f.id === processingFile.id ? { ...f, status: 'processing' } : f)),
      )

      try {
        // Make sure detector is initialized
        if (!detectorRef.current) {
          const initialized = await initDetector()
          if (!initialized) {
            throw new Error('Could not initialize file type detector')
          }
        }

        // Process with the combined detector
        const result = await detectorRef.current!.detectFileType(
          processingFile.file,
          processingFile.id,
        )

        // Create detection result from the combined result
        const detectionResult: DetectionResult = {
          id: result.id,
          fileName: result.fileName,
          fileSize: result.fileSize,
          detectedType: result.detectedType,
          score: result.score,
          confidence: result.confidence,
          warningMessage: result.warningMessage,
          // Include both engine results directly in the detection result
          magikaResult: result.magikaResult,
          fileTypeResult: result.fileTypeResult,
        }

        // Update state
        setProcessingFiles((prev) =>
          prev.map((f) => (f.id === processingFile.id ? { ...f, status: 'completed' } : f)),
        )

        // Add to results
        resultsRef.current = [...resultsRef.current, detectionResult]
        setDetectionResults(resultsRef.current)

        return true
      } catch (error) {
        console.error(`Error processing file ${processingFile.file.name}:`, error)

        // Update file status to error
        setProcessingFiles((prev) =>
          prev.map((f) =>
            f.id === processingFile.id
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error',
                }
              : f,
          ),
        )

        return false
      }
    },
    [initDetector],
  )

  // Process files in batches
  const processBatch = useCallback(async () => {
    if (!isProcessingRef.current || processingQueueRef.current.length === 0) {
      isProcessingRef.current = false
      setIsProcessing(false)
      return
    }

    // Get next batch
    const batch = processingQueueRef.current.slice(0, BATCH_SIZE)

    // Process batch in parallel
    await Promise.all(batch.map((file) => processFile(file)))

    // Remove processed files from queue
    processingQueueRef.current = processingQueueRef.current.slice(BATCH_SIZE)

    // Process next batch after a delay
    setTimeout(() => {
      processBatch()
    }, BATCH_DELAY)
  }, [processFile])

  // Add files to processing queue
  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return

      // Create processing file objects
      const newProcessingFiles: ProcessingFile[] = files.map((file) => ({
        id: generateFileId(),
        file,
        name: file.name,
        size: file.size,
        status: 'queued',
      }))

      // Add to processing files state
      setProcessingFiles((prev) => [...prev, ...newProcessingFiles])

      // Add to processing queue
      processingQueueRef.current = [...processingQueueRef.current, ...newProcessingFiles]

      // Initialize processing if not already started
      if (!isProcessingRef.current) {
        isProcessingRef.current = true
        setIsProcessing(true)

        // Initialize detector
        await initDetector()

        // Start processing
        processBatch()
      }
    },
    [generateFileId, initDetector, processBatch],
  )

  // Clear results and reset state
  const clearResults = useCallback(() => {
    setDetectionResults([])
    setProcessingFiles([])
    processingQueueRef.current = []
    resultsRef.current = []
  }, [])

  return {
    processingFiles,
    handleFiles,
    detectionResults,
    isProcessing,
    clearResults,
  }
}
