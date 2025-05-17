/**
 * Represents a generic job item that the worker controller can process.
 * It requires at least an \`id\` and a \`status\`.
 */
export interface BaseJob {
  id: string
  status: string
}

/**
 * Represents an image processing job, extending BaseJob with image-specific fields.
 */
export interface ImageJob extends BaseJob {
  originalFile?: File
  originalBlobUrl?: string
  preprocessedImageUrl?: string
  segmentationResult?: unknown // Specific structure depends on the segmentation model
  transparentImageDataUrl?: string
  error?: string
}

/**
 * Payload for MODEL_LOADING_PROGRESS messages from a worker.
 * Structure may vary based on the model loading library (e.g., Transformers.js).
 */
export interface ModelLoadingProgressPayload {
  status: string // e.g., "downloading", "initializing", "ready"
  name?: string // Name of the model or file
  file?: string // Specific file being processed
  progress?: number // Percentage (0-100)
  loaded?: number // Bytes loaded
  total?: number // Total bytes
  [key: string]: unknown // Allow other properties from the source
}

/**
 * Payload for MODEL_LOADING_STATUS messages from a worker.
 */
export interface ModelLoadingStatusPayload {
  loading: boolean
  loaded?: boolean
  error?: string | null
}

/**
 * Payload for WORKER_READY or INIT_WORKER_COMPLETE messages from a worker.
 */
export interface WorkerReadyPayload {
  workerIndex: number
}

// Union type for known message payloads from workers.
// This can be expanded as more message types are strictly defined.
export type WorkerMessagePayload =
  | ModelLoadingProgressPayload
  | ModelLoadingStatusPayload
  | WorkerReadyPayload
  | { [key: string]: unknown } // Fallback for other/unknown messages

export type WorkerMessageType =
  | 'WORKER_READY'
  | 'INIT_WORKER_COMPLETE'
  | 'MODEL_LOADING_PROGRESS'
  | 'MODEL_LOADING_STATUS'
  | 'INIT_WORKER' // Sent by controller, received by workers
  | 'TEST_WORKER' // Sent by controller for testing, received by workers
  | 'PROCESS_IMAGE' // Sent by controller, received by segmentation & postprocessing workers
  | 'PROCESSING_RESULT' // Sent by workers
  | 'WORKER_STARTUP_COMPLETE' // Sent by preprocessing worker, currently not used by controller
  | 'PREPROCESS_IMAGE' // Sent by controller, received by preprocessing worker
  | 'LOAD_MODEL' // Sent by controller, received by segmentation worker
  | 'MODEL_LOAD_ATTEMPTED' // Sent by segmentation worker

export interface WorkerMessage<P = WorkerMessagePayload> {
  type: WorkerMessageType
  payload: P
}

/**
 * Configuration options for the useWorkerController hook.
 * @template TJob The type of job objects being processed, must extend BaseJob.
 */
export interface WorkerControllerOptions<TJob extends BaseJob> {
  workers: Worker[]
  maxWorkers: number
  onMessage: (event: MessageEvent<WorkerMessage>, workerIndex: number) => void
  onError: (event: ErrorEvent, workerIndex: number) => void
  jobQueueRef: React.RefObject<string[]>
  imageListRef: React.RefObject<TJob[]>
  isBatchActiveRef: React.RefObject<boolean>
  processJobFn: (job: TJob, workerIndex: number) => void
  isJobEligibleForProcessing: (job: TJob) => boolean
  setTriggerProcessQueue?: React.Dispatch<React.SetStateAction<number>>
  workerType?: string
}

/**
 * Represents the progress data that might come from various sources (e.g., segmentation controller progress which is initially `unknown`).
 * This is kept somewhat flexible.
 */
export type RawModelProgressData =
  | number
  | { progress?: number; loaded?: number; total?: number; status?: string; file?: string }

/**
 * Type for the progress prop specifically expected by the ModelLoadingProgress component.
 * It defines stricter shapes for how progress can be represented.
 */
export type ModelProgressTypeForComponent =
  | number
  | { progress: number; loaded?: number; total?: number; status?: string; file?: string } // Direct progress percentage is primary
  | { loaded: number; total: number; progress?: never; status?: string; file?: string } // Loaded/total bytes are primary, progress percentage is derived

/**
 * Return value of the useWorkerController hook.
 */
export interface WorkerControllerReturn {
  workerRefs: React.RefObject<Worker[]>
  workerJobAssignments: React.RefObject<Map<number, string | null>>
  workerInitializationStatus: React.RefObject<Array<'pending' | 'success' | 'failed'>>
  workerReadyStatus: React.RefObject<boolean[]>
  processNextJob: () => void
  cleanupWorkers: () => void
  modelLoadingProgress: {
    progress: ModelLoadingProgressPayload | unknown // Data from MODEL_LOADING_PROGRESS
    status: string // Status message for model loading UI
  }
}
