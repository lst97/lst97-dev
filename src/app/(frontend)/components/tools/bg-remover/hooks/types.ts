import { RefObject } from 'react'

export type WorkerInitializationPhase =
  | 'idle'
  | 'initializing_first'
  | 'first_worker_complete'
  | 'initializing_remaining'
  | 'all_initialized'

export type ImageJobStatus =
  | 'pending_preprocessing'
  | 'preprocessing'
  | 'pending_segmentation'
  | 'queued'
  | 'preparing'
  | 'segmentation'
  | 'completed'
  | 'error'
  | 'pending_postprocessing'
  | 'postprocessing'

export interface ImageJob {
  id: string // Unique identifier for the job
  file: File // Original file object
  name: string // File name
  originalBlobUrl: string // Blob URL for original image preview
  dataUrlForWorker?: string // Data URL generated for the worker (created on demand)
  processedImageUrl?: string // Data URL for processed image preview
  segmentationResult?: unknown // Stores raw segmentation output if needed between stages
  preprocessedImageUrl?: string // Data URL from preprocessing worker, if applicable
  status:
    | 'pending_preprocessing' // Initial state after file selection
    | 'preprocessing' // Actively being preprocessed by a worker
    | 'pending_segmentation' // Preprocessing done, waiting for segmentation worker or model
    | 'queued' // Job is in the segmentation queue, model is ready
    | 'preparing' // Main thread is preparing to send to segmentation worker
    | 'sementation_worker' // Segmentation worker is processing
    | 'postprocessing' // Segmentation done, waiting for mask application worker
    | 'postprocessing' // Mask application worker is processing
    | 'completed'
    | 'error'
  error?: string // Error message if any
}

export interface ExtendedImageJob extends Omit<ImageJob, 'status'> {
  status: ImageJobStatus
  preprocessedImageUrl?: string
  segmentationResult?: unknown
  processedFileSize?: number
}

export interface SegmentationControllerReturn {
  segmentationQueueRef: RefObject<string[]>
  processNextForSegmentation: () => void
  cleanupSegmentationWorkers: () => void
  segmentationWorkerJobAssignments: RefObject<Map<number, string | null>>
  segmentationWorkerInitializationStatus: RefObject<Array<'pending' | 'success' | 'failed'>>
  workerReadyStatus: RefObject<boolean[]>
  modelLoadingProgress: {
    progress: unknown
    status: string
  }
}

export interface PreprocessingControllerReturn {
  preprocessingQueueRef: RefObject<string[]>
  processNextForPreprocessing: () => void
  cleanupPreprocessingWorkers: () => void
  preprocessingWorkerRefs: RefObject<Worker[]>
  preprocessingWorkerJobAssignments: RefObject<Map<number, string | null>>
  preprocessingWorkerInitializationStatus: RefObject<Array<'pending' | 'success' | 'failed'>>
  preprocessingWorkerReadyStatus: RefObject<boolean[]>
}
