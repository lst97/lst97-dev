import { useEffect, useRef, useCallback, useState } from 'react'
import type { ExtendedImageJob, WorkerInitializationPhase } from './types'
import { useWorkerController } from './'

// Add global interface augmentation for window object
declare global {
  interface Window {
    _maskQueueTriggerDebounceTimeout: NodeJS.Timeout | null
    _postprocessingRebuiltAttempted?: boolean
  }
}

interface SegmentationControllerOptions {
  imageListRef: React.RefObject<ExtendedImageJob[]>
  isBatchActiveRef: React.RefObject<boolean>
  modelLoadedRef: React.RefObject<boolean>
  modelLoadingRef: React.RefObject<boolean>
  overallErrorRef: React.RefObject<string | null>
  initializationPhase: WorkerInitializationPhase
  setImageList: React.Dispatch<React.SetStateAction<ExtendedImageJob[]>>
  setOverallError: React.Dispatch<React.SetStateAction<string | null>>
  setModelLoading: React.Dispatch<React.SetStateAction<boolean>>
  setModelLoaded: React.Dispatch<React.SetStateAction<boolean>>
  setInitializationPhase: React.Dispatch<React.SetStateAction<WorkerInitializationPhase>>
  setTriggerProcessQueue: React.Dispatch<React.SetStateAction<number>>
  setTriggerMaskApplicationQueue: React.Dispatch<React.SetStateAction<number>>
  postprocessingQueueRef: React.RefObject<string[]>
  MAX_SEGMENTATION_WORKERS: number
}

// Define the type for the worker controller
interface WorkerController {
  workerRefs: React.RefObject<Worker[]>
  workerJobAssignments: React.RefObject<Map<number, string | null>>
  workerInitializationStatus: React.RefObject<Array<'pending' | 'success' | 'failed'>>
  workerReadyStatus: React.RefObject<boolean[]>
  processNextJob: () => void
  cleanupWorkers: () => void
  modelLoadingProgress: {
    progress: number
    status: string
  }
}

// Define the return type for the segmentation controller
interface SegmentationControllerReturn {
  segmentationQueueRef: React.RefObject<string[]>
  processNextForSegmentation: () => void
  cleanupSegmentationWorkers: () => void
  segmentationWorkerJobAssignments: React.RefObject<Map<number, string | null>>
  segmentationWorkerInitializationStatus: React.RefObject<Array<'pending' | 'success' | 'failed'>>
  workerReadyStatus: React.RefObject<boolean[]>
  modelLoadingProgress: {
    progress: number
    status: string
  }
}

/**
 * @hook useSegmentationController
 * @description Orchestrates and manages the entire lifecycle and operations of segmentation web workers
 * for background image removal. This hook is the central nervous system for the segmentation feature,
 * handling the complexities of worker initialization, AI model loading, job distribution,
 * message passing, state synchronization, and error recovery. It dynamically adjusts the number
 * of active workers and their states based on the application's needs and the user's actions.
 *
 * Key Responsibilities:
 *
 * 1.  **Worker Lifecycle Management**:
 *     -   Manages a pool of segmentation workers based on `MAX_SEGMENTATION_WORKERS`.
 *     -   Handles phased initialization of these workers:
 *         -   `idle`: No workers active, all resources are cleared.
 *         -   `initializing_first`: Creates a single primary worker, primarily to initiate model download and caching.
 *         -   `initializing_remaining`: Creates additional workers up to a certain limit (currently 1), after the first worker has potentially started/completed model loading.
 *         -   `all_initialized`: All intended workers are created and attempts are made to load the model on them.
 *     -   Terminates and cleans up workers when they are no longer needed or when the component unmounts.
 *
 * 2.  **AI Model Management**:
 *     -   Coordinates the loading of the segmentation AI model across all active workers.
 *     -   Tracks the model loading progress and status (`modelLoadingRef`, `modelLoadedRef`, `segmentationWorkerModelReadyStatus`).
 *     -   Sends `LOAD_MODEL` commands to workers and handles `MODEL_LOADING_STATUS` messages.
 *     -   Includes retry mechanisms for model loading on individual workers.
 *     -   Aggregates the model loading status from all workers to determine the global model readiness.
 *
 * 3.  **Job Orchestration & Queue Management**:
 *     -   Manages a `segmentationQueueRef` for image job IDs awaiting segmentation.
 *     -   Distributes jobs from this queue to available and model-ready workers using the `useWorkerController` hook.
 *     -   Updates the status of `ExtendedImageJob` objects in `imageListRef` as they progress through segmentation
 *         (e.g., `queued` -> `pending_segmentation` -> `segmentation` -> `pending_postprocessing` or `error`).
 *     -   Adds successfully segmented jobs to the `postprocessingQueueRef` for further processing (e.g., mask application).
 *
 * 4.  **Communication & State Synchronization**:
 *     -   Handles messages from workers (`PROCESSING_RESULT`, `MODEL_LOADING_STATUS`, `WORKER_READY`).
 *     -   Updates the parent component's state via setters provided in `options` (e.g., `setImageList`, `setModelLoading`, `setModelLoaded`, `setOverallError`).
 *     -   Relies on `useWorkerController` for lower-level worker management aspects like script initialization status (`workerInitializationStatus`),
 *         job assignments (`segmentationWorkerJobAssignments`), and raw worker readiness (`workerReadyStatus`).
 *
 * 5.  **Error Handling & Recovery**:
 *     -   Manages errors originating from workers (script errors, model loading failures, processing errors).
 *     -   Updates `overallErrorRef` and individual job error states.
 *     -   Attempts to re-queue jobs if a worker is not ready or if an error occurs that might be transient.
 *     -   Adjusts model loading/loaded status based on widespread worker failures.
 *
 * @param {SegmentationControllerOptions} options - Configuration options, React refs to shared state,
 *        and state setter functions necessary for the controller to interact with the parent component's
 *        state and manage the segmentation workers effectively.
 *        - `imageListRef`: Ref to the array of image jobs.
 *        - `isBatchActiveRef`: Ref indicating if a batch processing session is active.
 *        - `modelLoadedRef`: Ref indicating if the AI model is considered loaded by at least one worker.
 *        - `modelLoadingRef`: Ref indicating if the AI model is currently being loaded.
 *        - `overallErrorRef`: Ref to store any critical system-wide error messages.
 *        - `initializationPhase`: Current phase of worker initialization.
 *        - `setImageList`: Setter for the image jobs list.
 *        - `setOverallError`: Setter for the overall error message.
 *        - `setModelLoading`: Setter for the model loading state.
 *        - `setModelLoaded`: Setter for the model loaded state.
 *        - `setInitializationPhase`: Setter to change the worker initialization phase.
 *        - `setTriggerProcessQueue`: Setter to trigger the job processing queue.
 *        - `setTriggerMaskApplicationQueue`: Setter to trigger the mask application queue.
 *        - `postprocessingQueueRef`: Ref to the queue of job IDs awaiting post-processing.
 *        - `MAX_SEGMENTATION_WORKERS`: The maximum number of segmentation workers to create.
 *
 * @returns {SegmentationControllerReturn} An object containing:
 *  - `segmentationQueueRef`: React ref to the queue of job IDs awaiting segmentation. This queue is consumed by this controller.
 *  - `processNextForSegmentation`: Function to be called to attempt processing the next job in the `segmentationQueueRef`.
 *                                  It checks model readiness and batch status before dispatching.
 *  - `cleanupSegmentationWorkers`: Function to explicitly terminate all segmentation workers and clear associated state.
 *                                  Should be called on component unmount or when segmentation is no longer needed.
 *  - `segmentationWorkerJobAssignments`: React ref (from `useWorkerController`) to a map tracking which job ID (if any) is assigned to each worker by its index.
 *  - `segmentationWorkerInitializationStatus`: React ref (from `useWorkerController`) to an array indicating the script initialization status
 *                                            ('pending', 'success', 'failed') of each worker.
 *  - `workerReadyStatus`: React ref (from `useWorkerController`) to an array indicating the basic readiness status of each worker (script loaded and ready for messages).
 *  - `modelLoadingProgress`: Object (from `useWorkerController`, though likely reflects primary worker's init) containing progress data for model loading,
 *                             often reflecting the initial download/setup rather than subsequent worker model loads.
 */
export const useSegmentationController = ({
  imageListRef,
  isBatchActiveRef,
  modelLoadedRef,
  modelLoadingRef,
  overallErrorRef,
  initializationPhase,
  setImageList,
  setOverallError,
  setModelLoading,
  setModelLoaded,
  setInitializationPhase,
  setTriggerProcessQueue,
  setTriggerMaskApplicationQueue,
  postprocessingQueueRef,
  MAX_SEGMENTATION_WORKERS,
}: SegmentationControllerOptions): SegmentationControllerReturn => {
  const segmentationQueueRef = useRef<string[]>([])
  const segmentationWorkerModelReadyStatus = useRef<boolean[]>([])
  const segmentationWorkerModelLoadAttemptCompleted = useRef<boolean[]>([])
  const previousPhaseRef = useRef<WorkerInitializationPhase>(initializationPhase)

  const defaultJobAssignmentsRef = useRef(new Map<number, string | null>())
  const defaultInitStatusRef = useRef<Array<'pending' | 'success' | 'failed'>>([])
  const defaultReadyStatusRef = useRef<boolean[]>([])

  const [segmentationWorkers, setSegmentationWorkers] = useState<Worker[]>([])

  useEffect(
    () => {
      if (typeof window === 'undefined') return

      if (previousPhaseRef.current === initializationPhase && segmentationWorkers.length > 0) {
        return
      }

      console.log(
        `[MainThread-SegCtrl] Phase changed from ${previousPhaseRef.current} to ${initializationPhase}, updating workers`,
      )

      segmentationWorkers.forEach((worker, i) => {
        try {
          console.log(
            `[MainThread-SegCtrl] Terminating old worker ${i} (from state) before creating new workers for phase ${initializationPhase}`,
          )
          worker.terminate()
        } catch (e) {
          console.error(`[MainThread-SegCtrl] Error terminating old worker at index ${i}:`, e)
        }
      })

      const newWorkersLocal: Worker[] = []
      const timestampSuffix = Date.now().toString().slice(-4)

      try {
        if (initializationPhase === 'initializing_first') {
          console.log('[MainThread-SegCtrl] Creating first worker to download model')
          const worker = new Worker(
            new URL('../components/engine/segmentation_worker.js', import.meta.url),
            {
              type: 'module',
              name: `segmentation-worker-primary-${timestampSuffix}`,
            },
          )
          newWorkersLocal.push(worker)
        } else if (
          initializationPhase === 'initializing_remaining' ||
          initializationPhase === 'all_initialized'
        ) {
          const currentWorkerCount = 0
          const numWorkersToCreate =
            initializationPhase === 'initializing_remaining'
              ? Math.min(1, MAX_SEGMENTATION_WORKERS - currentWorkerCount)
              : MAX_SEGMENTATION_WORKERS

          console.log(
            `[MainThread-SegCtrl] Creating ${numWorkersToCreate} workers for phase ${initializationPhase}`,
          )

          for (let i = 0; i < numWorkersToCreate; i++) {
            const workerName =
              currentWorkerCount + i === 0 && numWorkersToCreate < MAX_SEGMENTATION_WORKERS
                ? `segmentation-worker-primary-${timestampSuffix}`
                : `segmentation-worker-${currentWorkerCount + i}-${timestampSuffix}`

            const worker = new Worker(
              new URL('../components/engine/segmentation_worker.js', import.meta.url),
              {
                type: 'module',
                name: workerName,
              },
            )
            newWorkersLocal.push(worker)
          }
        }

        console.log(
          `[MainThread-SegCtrl] Setting ${newWorkersLocal.length} new workers for phase ${initializationPhase}`,
        )
        setSegmentationWorkers(newWorkersLocal)

        if (newWorkersLocal.length > 0) {
          segmentationWorkerModelReadyStatus.current = new Array(newWorkersLocal.length).fill(false)
          segmentationWorkerModelLoadAttemptCompleted.current = new Array(
            newWorkersLocal.length,
          ).fill(false)
        }

        previousPhaseRef.current = initializationPhase
      } catch (error) {
        console.error('[MainThread-SegCtrl] Error creating workers:', error)
        setSegmentationWorkers([])
      }

      if (initializationPhase !== 'idle') {
        if (!modelLoadingRef.current && newWorkersLocal.length > 0) setModelLoading(true)
        if (modelLoadedRef.current) setModelLoaded(false)
      } else {
        if (modelLoadingRef.current) setModelLoading(false)
        if (modelLoadedRef.current) setModelLoaded(false)
      }

      return () => {
        console.log(
          `[MainThread-SegCtrl] Cleanup for phase ${initializationPhase}: Terminating ${newWorkersLocal.length} workers created in this effect run.`,
        )
        newWorkersLocal.forEach((worker, index) => {
          try {
            worker.terminate()
          } catch (e) {
            console.error(
              `[MainThread-SegCtrl] Error terminating worker at index ${index} in cleanup:`,
              e,
            )
          }
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      initializationPhase,
      modelLoadingRef,
      modelLoadedRef,
      setModelLoading,
      setModelLoaded,
      MAX_SEGMENTATION_WORKERS,
    ],
  )

  const handleSegmentationWorkerMessage = useCallback(
    (event: MessageEvent, workerIndex: number) => {
      const { type, payload } = event.data

      switch (type) {
        case 'MODEL_LOADING_STATUS': {
          if (workerIndex >= segmentationWorkerModelReadyStatus.current.length) {
            console.warn(
              `[MainThread-SegCtrl] MODEL_LOADING_STATUS from worker ${workerIndex}, but index is out of bounds for model status arrays. Current length: ${segmentationWorkerModelReadyStatus.current.length}. Ignoring.`,
            )
            return
          }
          const modelLoaded = payload.loaded || false
          segmentationWorkerModelReadyStatus.current[workerIndex] = modelLoaded

          if (modelLoaded || payload.error) {
            if (workerIndex < segmentationWorkerModelLoadAttemptCompleted.current.length) {
              segmentationWorkerModelLoadAttemptCompleted.current[workerIndex] = true
            } else {
              console.warn(
                `[MainThread-SegCtrl] workerIndex ${workerIndex} out of bounds for segmentationWorkerModelLoadAttemptCompleted on model load/error.`,
              )
            }
          }

          if (payload.error) {
            console.error(
              `[MainThread-SegCtrl] Model loading error from segmentation worker ${workerIndex}:`,
              payload.error,
            )
          }

          const currentPhase = initializationPhase
          const workerInitStatus = workerController?.workerInitializationStatus?.current || []

          if (workerIndex === 0 && currentPhase === 'initializing_first') {
            if (modelLoaded) {
              console.log(
                `[MainThread-SegCtrl] First seg worker (0) model load complete. Phase: ${currentPhase}. Transitioning to init remaining.`,
              )
              setInitializationPhase('initializing_remaining')
            } else if (payload.error || (payload.loading === false && !modelLoaded)) {
              console.log(
                `[MainThread-SegCtrl] First seg worker (0) model load failed. Phase: ${currentPhase}. Not initializing remaining. Transitioning to all_initialized.`,
              )
              setInitializationPhase('all_initialized')
            }
          }

          const successfulScriptInitsIndices = workerInitStatus
            .map((status: 'pending' | 'success' | 'failed', i: number) =>
              status === 'success' ? i : -1,
            )
            .filter(
              (i: number) => i !== -1 && i < segmentationWorkerModelReadyStatus.current.length,
            )

          let newGlobalModelLoaded = false
          let newGlobalModelLoading = false

          if (successfulScriptInitsIndices.length === 0) {
            if (
              currentPhase === 'all_initialized' ||
              workerInitStatus.every(
                (s: 'pending' | 'success' | 'failed') => s === 'failed' || s === 'pending',
              ) // Consider pending as not ready
            ) {
              newGlobalModelLoading = false
              newGlobalModelLoaded = false
            } else {
              newGlobalModelLoading = true
            }
          } else {
            newGlobalModelLoaded = successfulScriptInitsIndices.some(
              (idx: number) => segmentationWorkerModelReadyStatus.current[idx],
            )

            if (newGlobalModelLoaded) {
              newGlobalModelLoading = false
            } else {
              const allModelLoadAttemptsBySuccessfulInitsCompleted =
                successfulScriptInitsIndices.every(
                  (idx: number) => segmentationWorkerModelLoadAttemptCompleted.current[idx],
                )

              if (
                currentPhase !== 'all_initialized' ||
                !allModelLoadAttemptsBySuccessfulInitsCompleted
              ) {
                newGlobalModelLoading = true
              } else {
                newGlobalModelLoading = false
              }
            }
          }

          if (modelLoadedRef.current !== newGlobalModelLoaded) setModelLoaded(newGlobalModelLoaded)
          if (modelLoadingRef.current !== newGlobalModelLoading)
            setModelLoading(newGlobalModelLoading)

          if (newGlobalModelLoaded && !modelLoadedRef.current && isBatchActiveRef.current) {
            console.log(
              '[MainThread-SegCtrl] Model newly loaded and batch active, triggering queue processing.',
            )
            setTriggerProcessQueue((c) => c + 1)
          }
          break
        }
        case 'PROCESSING_RESULT': {
          const { jobId, result, originalBlobUrl, error: processingError } = payload
          const assignedJobId = workerController?.workerJobAssignments?.current?.get(workerIndex)

          if (!jobId) {
            console.error(
              `[MainThread-SegCtrl] Seg worker ${workerIndex} sent result without jobId:`,
              payload,
            )
            return
          }
          if (jobId !== assignedJobId) {
            console.error(
              `[MainThread-SegCtrl] Seg worker ${workerIndex} sent result for wrong job. Expected: ${assignedJobId}, Got: ${jobId}`,
            )
            return
          }

          workerController?.workerJobAssignments?.current?.set(workerIndex, null) // Free up the worker

          setImageList((prevList) => {
            const newList = prevList.map((job) => {
              if (job.id === jobId) {
                if (processingError) {
                  console.error(
                    `[MainThread-SegCtrl] Processing error for job ${jobId} from worker ${workerIndex}: ${processingError}`,
                  )
                  return {
                    ...job,
                    status: 'error',
                    error: `Processing Error (Seg. Worker ${workerIndex}): ${processingError}`,
                  } as ExtendedImageJob
                } else if (result && originalBlobUrl) {
                  console.log(
                    `[MainThread-SegCtrl] Job ${jobId} segmented by worker ${workerIndex}. Adding to mask app queue.`,
                  )
                  if (!postprocessingQueueRef.current.includes(jobId)) {
                    postprocessingQueueRef.current.push(jobId)
                    if (!window._maskQueueTriggerDebounceTimeout) {
                      window._maskQueueTriggerDebounceTimeout = setTimeout(() => {
                        console.log(
                          `[MainThread-SegCtrl] Debounced trigger for mask application queue`,
                        )
                        window._maskQueueTriggerDebounceTimeout = null
                        setTriggerMaskApplicationQueue((c) => c + 1)
                      }, 100)
                    }
                  }
                  return {
                    ...job,
                    status: 'pending_postprocessing',
                    segmentationResult: result,
                    error: undefined,
                  } as ExtendedImageJob
                } else {
                  console.error(
                    `[MainThread-SegCtrl] Seg worker ${workerIndex} returned no result or preprocessed URL for job ${jobId}.`,
                  )
                  return {
                    ...job,
                    status: 'error',
                    error: 'Segmentation worker returned no result or preprocessed URL',
                  } as ExtendedImageJob
                }
              }
              return job
            })
            return newList
          })

          if (isBatchActiveRef.current) setTriggerProcessQueue((c) => c + 1)
          break
        }
        case 'WORKER_READY': {
          // This is already handled by the useWorkerController and doesn't need special handling here
          console.log(`[MainThread-SegCtrl] Worker ${workerIndex} reported ready`)
          break
        }
        case 'MODEL_LOAD_ATTEMPTED': {
          // Handle the model load attempt acknowledgement
          console.log(
            `[MainThread-SegCtrl] Worker ${workerIndex} confirmed model load attempt initiated`,
          )
          // No need for special handling beyond logging since this is managed by the effect with modelLoadAttemptedHandler
          break
        }
        default:
          console.warn(
            `[MainThread-SegCtrl] Unknown message type from seg worker ${workerIndex}: ${type}`,
          )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setImageList,
      // setOverallError, // Controlled more directly by initialization effect
      setModelLoading,
      setModelLoaded,
      setInitializationPhase,
      setTriggerProcessQueue,
      setTriggerMaskApplicationQueue,
      initializationPhase,
      modelLoadedRef,
      modelLoadingRef,
      overallErrorRef,
      isBatchActiveRef,
      postprocessingQueueRef,
      // workerController is not a direct dependency here, its methods should be stable
    ],
  )

  const handleSegmentationWorkerError = useCallback(
    (event: ErrorEvent, workerIndex: number) => {
      // ... (ensure workerIndex bounds checks for segmentationWorkerModelLoadAttemptCompleted and workerController assignments)
      console.error(
        `[MainThread-SegCtrl] Error event from seg worker ${workerIndex}:`,
        event.message,
        event,
      )
      let errorMessage = `An unspecified error occurred in segmentation worker ${workerIndex}.`
      if (event.message) {
        errorMessage = event.message
      } else if (event.filename || event.lineno || event.colno) {
        errorMessage = `Script error in worker ${workerIndex}: ${event.filename || 'Unknown file'} (line ${event.lineno || 'N/A'}, col ${event.colno || 'N/A'})`
      }

      if (workerIndex < segmentationWorkerModelLoadAttemptCompleted.current.length) {
        segmentationWorkerModelLoadAttemptCompleted.current[workerIndex] = true
      } else {
        console.warn(
          `[MainThread-SegCtrl] workerIndex ${workerIndex} out of bounds for segmentationWorkerModelLoadAttemptCompleted on error.`,
        )
      }

      setOverallError((prevError) => {
        if (prevError && prevError.includes('All workers failed')) return prevError
        return `Worker Error (Seg. Worker ${workerIndex}): ${errorMessage}`
      })

      const assignedJobId = workerController?.workerJobAssignments?.current?.get(workerIndex)
      if (assignedJobId) {
        setImageList((prev) =>
          prev.map((job) =>
            job.id === assignedJobId
              ? ({
                  ...job,
                  status: 'error',
                  error: `Segmentation worker ${workerIndex} crashed or errored`,
                } as ExtendedImageJob)
              : job,
          ),
        )
        workerController?.workerJobAssignments?.current?.set(workerIndex, null)
      }

      const workerInitStatus = workerController?.workerInitializationStatus?.current || []
      const successfulScriptInitsIndices = workerInitStatus
        .map((s: 'pending' | 'success' | 'failed', i: number) => (s === 'success' ? i : -1))
        .filter((i: number) => i !== -1 && i < segmentationWorkerModelReadyStatus.current.length)

      if (successfulScriptInitsIndices.length === 0) {
        setModelLoaded(false)
        setModelLoading(false)
      } else {
        const anyModelReady = successfulScriptInitsIndices.some(
          (idx: number) => segmentationWorkerModelReadyStatus.current[idx],
        )
        if (!anyModelReady) {
          const allLoadAttemptsComplete = successfulScriptInitsIndices.every(
            (idx: number) => segmentationWorkerModelLoadAttemptCompleted.current[idx],
          )
          if (allLoadAttemptsComplete) {
            setModelLoading(false)
          }
        }
      }
      if (isBatchActiveRef.current) setTriggerProcessQueue((c) => c + 1)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setImageList,
      setOverallError,
      setModelLoading,
      setModelLoaded,
      setTriggerProcessQueue,
      overallErrorRef,
      isBatchActiveRef,
      // workerController not direct dep
    ],
  )

  const sendToSegmentationWorker = useCallback(
    async (job: ExtendedImageJob, workerIndex: number) => {
      // ... (ensure workerIndex bounds checks)
      if (!job.preprocessedImageUrl) {
        console.error(
          `[MainThread-SegCtrl] Job ${job.id} has no preprocessedImageUrl. Cannot send to seg worker ${workerIndex}.`,
        )
        setImageList((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? ({
                  ...j,
                  status: 'error',
                  error: 'Missing preprocessed image URL for segmentation',
                } as ExtendedImageJob)
              : j,
          ),
        )
        if (workerIndex < (workerController?.workerJobAssignments?.current?.size || 0)) {
          workerController?.workerJobAssignments?.current.set(workerIndex, null)
        }
        if (isBatchActiveRef.current) setTriggerProcessQueue((c) => c + 1)
        return
      }

      const dataUrl = job.preprocessedImageUrl
      const targetWorker = workerController?.workerRefs?.current[workerIndex]
      const workerInitStatus = workerController?.workerInitializationStatus?.current || []

      if (
        targetWorker &&
        workerIndex < workerInitStatus.length &&
        workerInitStatus[workerIndex] === 'success' &&
        workerIndex < segmentationWorkerModelReadyStatus.current.length &&
        segmentationWorkerModelReadyStatus.current[workerIndex]
      ) {
        console.log(
          `[MainThread-SegCtrl] Posting job ${job.id} to ready segmentation worker ${workerIndex}.`,
        )
        targetWorker.postMessage({
          type: 'PROCESS_IMAGE',
          payload: {
            jobId: job.id,
            imageDataUrl: dataUrl,
            originalBlobUrl: dataUrl,
          },
        })
        setImageList((prev) =>
          prev.map((j) =>
            j.id === job.id ? ({ ...j, status: 'segmentation' } as ExtendedImageJob) : j,
          ),
        )
      } else {
        const scriptStatus =
          workerIndex < workerInitStatus.length ? workerInitStatus[workerIndex] : 'unknown'
        const modelStatus =
          workerIndex < segmentationWorkerModelReadyStatus.current.length
            ? segmentationWorkerModelReadyStatus.current[workerIndex]
            : 'unknown'
        console.error(
          `[MainThread-SegCtrl] Seg worker ${workerIndex} not ready for job ${job.id} (Script: ${scriptStatus}, Model: ${modelStatus}). Re-queueing.`,
        )
        if (!segmentationQueueRef.current.includes(job.id)) {
          segmentationQueueRef.current.unshift(job.id)
        }
        if (workerIndex < (workerController?.workerJobAssignments?.current?.size || 0)) {
          workerController?.workerJobAssignments?.current.set(workerIndex, null)
        }
        setImageList((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? ({
                  ...j,
                  status: 'queued',
                  error: `Seg. worker ${workerIndex} was not ready, re-queued.`,
                } as ExtendedImageJob)
              : j,
          ),
        )
        if (isBatchActiveRef.current) setTriggerProcessQueue((c) => c + 1)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setImageList,
      setTriggerProcessQueue,
      isBatchActiveRef,
      segmentationQueueRef /* workerController not direct dep */,
    ],
  )

  const isJobEligibleForSegmentation = useCallback((job: ExtendedImageJob): boolean => {
    return (
      (job.status === 'queued' || job.status === 'pending_segmentation') &&
      !!job.preprocessedImageUrl
    )
  }, [])

  const workerController = useWorkerController<ExtendedImageJob>({
    workers: segmentationWorkers,
    maxWorkers: MAX_SEGMENTATION_WORKERS,
    onMessage: handleSegmentationWorkerMessage,
    onError: handleSegmentationWorkerError,
    jobQueueRef: segmentationQueueRef,
    imageListRef,
    isBatchActiveRef,
    processJobFn: sendToSegmentationWorker,
    isJobEligibleForProcessing: isJobEligibleForSegmentation,
    setTriggerProcessQueue,
    workerType: 'Segmentation',
  }) as WorkerController

  useEffect(
    () => {
      if (typeof window === 'undefined') return
      let isActive = true

      if (
        (initializationPhase === 'initializing_remaining' ||
          initializationPhase === 'all_initialized') &&
        workerController?.workerRefs?.current.length > 0
      ) {
        console.log(
          '[MainThread-SegCtrl] Triggering explicit model loading for secondary/all workers',
        )

        const currentWorkers = workerController.workerRefs.current
        const modelLoadAttemptAcknowledged = new Array(currentWorkers.length).fill(false)

        const modelLoadAttemptedHandler = (event: MessageEvent) => {
          if (
            event.data?.type === 'MODEL_LOAD_ATTEMPTED' &&
            typeof event.data.payload?.workerIndex === 'number'
          ) {
            const idx = event.data.payload.workerIndex
            if (idx >= 0 && idx < modelLoadAttemptAcknowledged.length) {
              console.log(
                `[MainThread-SegCtrl] Worker ${idx} confirmed model load attempt initiated`,
              )
              modelLoadAttemptAcknowledged[idx] = true
            }
          }
        }

        currentWorkers.forEach((worker) => {
          if (worker) {
            worker.addEventListener('message', modelLoadAttemptedHandler)
          }
        })

        const sendLoadModelToWorkerWithRetry = (worker: Worker, index: number, attempt = 1) => {
          if (
            !isActive ||
            modelLoadAttemptAcknowledged[index] ||
            (segmentationWorkerModelReadyStatus.current[index] && attempt > 1)
          ) {
            if (modelLoadAttemptAcknowledged[index])
              console.log(
                `[MainThread-SegCtrl] Worker ${index} already ack model load or model ready.`,
              )
            return // Stop if component unmounted, acknowledged, or already loaded after first attempt
          }
          console.log(
            `[MainThread-SegCtrl] Sending LOAD_MODEL to worker ${index} (attempt ${attempt})`,
          )
          worker.postMessage({ type: 'LOAD_MODEL' })

          if (attempt < 3) {
            // Retry up to 2 times (total 3 attempts)
            setTimeout(() => {
              if (
                isActive &&
                !modelLoadAttemptAcknowledged[index] &&
                !segmentationWorkerModelReadyStatus.current[index]
              ) {
                sendLoadModelToWorkerWithRetry(worker, index, attempt + 1)
              }
            }, 3000 * attempt) // Increase delay for subsequent attempts
          }
        }

        currentWorkers.forEach((worker, i) => {
          // Skip the first worker if it was primarily responsible and might already be loading/loaded
          if (
            i === 0 &&
            initializationPhase === 'initializing_remaining' &&
            segmentationWorkerModelReadyStatus.current[0]
          ) {
            console.log(
              `[MainThread-SegCtrl] Worker 0 (primary) already has model loaded in remaining phase, skipping explicit LOAD_MODEL.`,
            )
            modelLoadAttemptAcknowledged[i] = true // Mark as handled
            return
          }

          if (
            worker &&
            i < workerController.workerReadyStatus.current.length &&
            i < segmentationWorkerModelReadyStatus.current.length
          ) {
            if (!workerController.workerReadyStatus.current[i]) {
              console.log(
                `[MainThread-SegCtrl] Worker ${i} not ready yet, will wait for ready before LOAD_MODEL`,
              )
              const checkInterval = setInterval(() => {
                if (!isActive) {
                  clearInterval(checkInterval)
                  return
                }
                if (workerController.workerReadyStatus.current[i]) {
                  console.log(`[MainThread-SegCtrl] Worker ${i} now ready, sending LOAD_MODEL`)
                  clearInterval(checkInterval)
                  if (!segmentationWorkerModelReadyStatus.current[i]) {
                    sendLoadModelToWorkerWithRetry(worker, i)
                  }
                }
              }, 300)
              setTimeout(() => {
                if (!isActive) return
                clearInterval(checkInterval)
                if (
                  !workerController.workerReadyStatus.current[i] &&
                  !segmentationWorkerModelReadyStatus.current[i]
                ) {
                  console.warn(
                    `[MainThread-SegCtrl] Worker ${i} never became ready, attempting LOAD_MODEL anyway`,
                  )
                  sendLoadModelToWorkerWithRetry(worker, i)
                }
              }, 7000)
            } else if (!segmentationWorkerModelReadyStatus.current[i]) {
              console.log(
                `[MainThread-SegCtrl] Worker ${i} is ready, sending LOAD_MODEL as model not yet loaded.`,
              )
              sendLoadModelToWorkerWithRetry(worker, i)
            }
          } else {
            console.warn(
              `[MainThread-SegCtrl] Worker ${i} or its status arrays are not available for sending LOAD_MODEL.`,
            )
          }
        })

        return () => {
          isActive = false
          currentWorkers.forEach((worker) => {
            if (worker) {
              worker.removeEventListener('message', modelLoadAttemptedHandler)
            }
          })
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      initializationPhase,
      segmentationWorkers,
      workerController?.workerRefs?.current,
      workerController?.workerReadyStatus?.current,
    ],
  ) // Ensure workerController refs are stable or correctly re-triggered

  useEffect(
    () => {
      if (typeof window === 'undefined') return
      let didCancel = false

      const currentPhase = initializationPhase
      const workerInitStatus = workerController?.workerInitializationStatus?.current || []
      const currentSegWorkers = segmentationWorkers // From useMemo

      if (currentPhase === 'idle' && !didCancel) {
        console.log(
          '[MainThread-SegCtrl] Init Phase: IDLE. Resetting segmentation worker model statuses.',
        )
        segmentationWorkerModelReadyStatus.current = []
        segmentationWorkerModelLoadAttemptCompleted.current = []
      } else if (currentPhase === 'initializing_first' && !didCancel) {
        console.log('[MainThread-SegCtrl] Init Phase: initializing_first.')
        if (!modelLoadingRef.current && !modelLoadedRef.current && currentSegWorkers.length > 0) {
          console.log(
            '[MainThread-SegCtrl] Setting modelLoading to true as phase is initializing_first and workers exist.',
          )
          setModelLoading(true)
        }
      } else if (currentPhase === 'initializing_remaining' && !didCancel) {
        console.log(
          '[MainThread-SegCtrl] Init Phase: initializing_remaining. Transitioning to all_initialized.',
        )
        setInitializationPhase('all_initialized')
      } else if (currentPhase === 'all_initialized' && !didCancel) {
        console.log('[MainThread-SegCtrl] Init Phase: all_initialized. Performing final checks.')
        const successfulScriptInitsIndices = workerInitStatus
          .map((status: 'pending' | 'success' | 'failed', i: number) =>
            status === 'success' ? i : -1,
          )
          .filter((i: number) => i !== -1 && i < segmentationWorkerModelReadyStatus.current.length)

        const successfulScriptInitsCount = successfulScriptInitsIndices.length
        const allScriptInitAttemptsDone = workerInitStatus.every(
          (status: 'pending' | 'success' | 'failed') => status !== 'pending',
        )

        if (
          allScriptInitAttemptsDone &&
          successfulScriptInitsCount === 0 &&
          workerInitStatus.length >= MAX_SEGMENTATION_WORKERS
        ) {
          if (modelLoadingRef.current) setModelLoading(false)
          if (modelLoadedRef.current) setModelLoaded(false)
        } else if (successfulScriptInitsCount > 0 && !modelLoadedRef.current) {
          const allSuccessfulScriptInitsCompletedModelLoad = successfulScriptInitsIndices.every(
            (idx: number) => segmentationWorkerModelLoadAttemptCompleted.current[idx],
          )
          if (allSuccessfulScriptInitsCompletedModelLoad) {
            if (modelLoadingRef.current) setModelLoading(false)
          } else if (
            !modelLoadingRef.current &&
            !modelLoadedRef.current &&
            successfulScriptInitsCount > 0
          ) {
            setModelLoading(true)
          }
        } else if (
          successfulScriptInitsCount === 0 &&
          !allScriptInitAttemptsDone &&
          currentSegWorkers.length > 0
        ) {
          // If no scripts have successfully initialized yet, but not all attempts are done, and we expect workers
          if (!modelLoadingRef.current && !modelLoadedRef.current) setModelLoading(true)
        }
      }

      return () => {
        didCancel = true
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      initializationPhase,
      modelLoadingRef,
      modelLoadedRef,
      overallErrorRef,
      setInitializationPhase,
      setModelLoading,
      setModelLoaded,
      // setOverallError, // Overall error setting is tricky and might be better localized
      MAX_SEGMENTATION_WORKERS,
      // workerController, // Avoid direct dependency on workerController object if possible
      segmentationWorkers, // Depend on the result of useMemo
    ],
  )

  const processNextForSegmentation = useCallback(() => {
    const workerJobAssignmentsCurrent = workerController?.workerJobAssignments?.current
    if (!workerJobAssignmentsCurrent) {
      console.warn(
        '[MainThread-SegCtrl] processNextForSegmentation: workerJobAssignments not ready.',
      )
      return
    }

    if (!isBatchActiveRef.current || segmentationQueueRef.current.length === 0) {
      return
    }

    const queueJobIdsSet = new Set(segmentationQueueRef.current)

    if (!modelLoadedRef.current) {
      if (segmentationQueueRef.current.length > 0) {
        const hasQueuedJobs = imageListRef.current.some(
          (job) => queueJobIdsSet.has(job.id) && job.status === 'queued',
        )
        if (hasQueuedJobs) {
          setImageList((prev) =>
            prev.map((job) =>
              queueJobIdsSet.has(job.id) && job.status === 'queued'
                ? ({ ...job, status: 'pending_segmentation' } as ExtendedImageJob)
                : job,
            ),
          )
        }
      }
      return
    }

    const hasPendingSegmentationJobs = imageListRef.current.some(
      (job) => queueJobIdsSet.has(job.id) && job.status === 'pending_segmentation',
    )

    if (hasPendingSegmentationJobs) {
      setImageList((prev) =>
        prev.map((job) =>
          queueJobIdsSet.has(job.id) && job.status === 'pending_segmentation'
            ? ({ ...job, status: 'queued' } as ExtendedImageJob)
            : job,
        ),
      )
    }
    workerController?.processNextJob?.()
  }, [
    setImageList,
    isBatchActiveRef,
    modelLoadedRef,
    workerController,
    imageListRef,
    segmentationQueueRef,
  ])

  const cleanupSegmentationWorkers = useCallback(() => {
    console.log('[MainThread-SegCtrl] Cleaning up all segmentation workers explicitly')

    // Run the workerController cleanup which handles listener removal etc.
    workerController?.cleanupWorkers?.()

    // Terminate all workers currently in state and reset state
    segmentationWorkers.forEach((worker, index) => {
      try {
        console.log(
          `[MainThread-SegCtrl] Terminating worker ${index} from state in cleanupSegmentationWorkers`,
        )
        worker.terminate()
      } catch (e) {
        console.error(
          `[MainThread-SegCtrl] Error terminating worker ${index} in cleanupSegmentationWorkers:`,
          e,
        )
      }
    })

    setSegmentationWorkers([])
    segmentationWorkerModelReadyStatus.current = []
    segmentationWorkerModelLoadAttemptCompleted.current = []
  }, [segmentationWorkers, workerController]) // Depends on current segmentationWorkers state and workerController

  return {
    segmentationQueueRef,
    processNextForSegmentation,
    cleanupSegmentationWorkers,
    segmentationWorkerJobAssignments:
      workerController?.workerJobAssignments || defaultJobAssignmentsRef,
    segmentationWorkerInitializationStatus:
      workerController?.workerInitializationStatus || defaultInitStatusRef,
    workerReadyStatus: workerController?.workerReadyStatus || defaultReadyStatusRef,
    modelLoadingProgress: workerController?.modelLoadingProgress || {
      progress: 0,
      status: 'Initializing...',
    },
  }
}
