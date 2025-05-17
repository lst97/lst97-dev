import { useEffect, useRef, useCallback, useState } from 'react'
import type { ExtendedImageJob } from './types'
import { useWorkerController } from './'
import { getFileSizeFromDataUrl } from '../utils/file'

interface PostprocessingControllerOptions {
  imageListRef: React.RefObject<ExtendedImageJob[]>
  isBatchActiveRef: React.RefObject<boolean>
  overallErrorRef: React.RefObject<string | null>
  setImageList: React.Dispatch<React.SetStateAction<ExtendedImageJob[]>>
  setOverallError: React.Dispatch<React.SetStateAction<string | null>>
  setTriggerMaskApplicationQueue: React.Dispatch<React.SetStateAction<number>>
  setTriggerProcessQueue: React.Dispatch<React.SetStateAction<number>>
  MAX_MASK_APPLICATION_WORKERS: number
  isMaskQueueBeingProcessed: boolean
  setIsMaskQueueBeingProcessed: React.Dispatch<React.SetStateAction<boolean>>
}

// Define the type for the worker controller
interface WorkerController {
  workerRefs: React.RefObject<Worker[]>
  workerJobAssignments: React.RefObject<Map<number, string | null>>
  workerInitializationStatus: React.RefObject<Array<'pending' | 'success' | 'failed'>>
  workerReadyStatus: React.RefObject<boolean[]>
  processNextJob: () => void
  cleanupWorkers: () => void
}

// Declare global interface augmentation for the window object
declare global {
  interface Window {
    _postprocessingRebuiltAttempted?: boolean
  }
}

/**
 * @interface PostprocessingControllerReturnType
 * @description Defines the shape of the object returned by the `usePostprocessingController` hook.
 */
export interface PostprocessingControllerReturnType {
  postprocessingQueueRef: React.RefObject<string[]>
  processNextForMaskApplication: () => void
  cleanupMaskApplicationWorkers: () => void
  maskApplicationWorkerRefs: React.RefObject<Worker[]>
  postprocessingWorkerJobAssignments: React.RefObject<Map<number, string | null>>
  maskApplicationWorkerInitializationStatus: React.RefObject<
    Array<'pending' | 'success' | 'failed'>
  >
  maskApplicationWorkerReadyStatus: React.RefObject<boolean[]>
}

/**
 * @hook usePostprocessingController
 * @description Manages the post-processing of segmented images, specifically applying masks to remove backgrounds.
 * This hook is a critical component of the image background removal tool, orchestrating the use of Web Workers
 * to perform CPU-intensive mask application tasks in parallel, thus preventing UI freezes and enhancing performance.
 *
 * Key Responsibilities:
 * 1.  **Worker Pool Management**: Initializes, manages, and terminates a pool of Web Workers dedicated to mask application.
 *     It includes a mechanism to rebuild workers if all of them fail, ensuring resilience.
 * 2.  **Job Queuing**: Maintains a queue (`postprocessingQueueRef`) for image jobs that have undergone segmentation and are awaiting mask application.
 * 3.  **Job Dispatching**: Intelligently dispatches jobs from the queue to available and ready workers, leveraging the `useWorkerController`.
 * 4.  **Result Handling**: Processes messages from workers, updating the status of image jobs with either the processed image (transparent background) or an error.
 *     It also handles the cleanup of blob URLs to prevent memory leaks.
 * 5.  **State Management**: Updates the global image list (`imageListRef`, `setImageList`) and manages overall system error states (`overallErrorRef`, `setOverallError`).
 * 6.  **Coordination**: Interacts with other parts of the background removal system, such as triggering the processing of the mask application queue.
 *
 * The hook relies on a generic `useWorkerController` for foundational worker management logic, specializing it for the
 * specific needs of mask application (e.g., message types, job eligibility criteria).
 *
 * @param {PostprocessingControllerOptions} options - Configuration options and state setters.
 * @param {React.RefObject<ExtendedImageJob[]>} options.imageListRef - Ref to the list of image jobs.
 * @param {React.RefObject<boolean>} options.isBatchActiveRef - Ref indicating if batch processing is active.
 * @param {React.RefObject<string | null>} options.overallErrorRef - Ref to store any overall system error.
 * @param {React.Dispatch<React.SetStateAction<ExtendedImageJob[]>>} options.setImageList - State setter for the image list.
 * @param {React.Dispatch<React.SetStateAction<string | null>>} options.setOverallError - State setter for the overall system error.
 * @param {React.Dispatch<React.SetStateAction<number>>} options.setTriggerMaskApplicationQueue - State setter to trigger processing of the mask application queue.
 * @param {number} options.MAX_MASK_APPLICATION_WORKERS - Maximum number of mask application workers to create.
 * @param {boolean} options.isMaskQueueBeingProcessed - Flag indicating if the mask queue is currently being processed.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} options.setIsMaskQueueBeingProcessed - State setter for the `isMaskQueueBeingProcessed` flag.
 *
 * @returns {PostprocessingControllerReturnType} An object containing:
 *   - `postprocessingQueueRef`: Ref to the queue of job IDs awaiting mask application.
 *   - `processNextForMaskApplication`: Function to trigger processing of the next job in the mask application queue.
 *   - `cleanupMaskApplicationWorkers`: Function to terminate all mask application workers.
 *   - `maskApplicationWorkerRefs`: Ref to the array of mask application worker instances.
 *   - `postprocessingWorkerJobAssignments`: Ref to the map of worker indices to assigned job IDs.
 *   - `maskApplicationWorkerInitializationStatus`: Ref to the array of initialization statuses for each worker.
 *   - `maskApplicationWorkerReadyStatus`: Ref to the array of ready statuses for each worker.
 */
export const usePostprocessingController = ({
  imageListRef,
  isBatchActiveRef,
  overallErrorRef,
  setImageList,
  setOverallError,
  setTriggerMaskApplicationQueue,
  MAX_MASK_APPLICATION_WORKERS,
  setIsMaskQueueBeingProcessed,
}: PostprocessingControllerOptions): PostprocessingControllerReturnType => {
  const postprocessingQueueRef = useRef<string[]>([])
  const workersCreatedRef = useRef<boolean>(false)
  const [postprocessingWorkers, setPostprocessingWorkers] = useState<Worker[]>([])

  /**
   * Initialize postprocessing workers on the client side
   * Creates a pool of workers that will handle mask application in parallel
   */
  useEffect(
    () => {
      if (typeof window === 'undefined' || postprocessingWorkers.length > 0) return

      const initialWorkers: Worker[] = []
      try {
        console.log(
          `[MainThread-PostCtrl] Initializing ${MAX_MASK_APPLICATION_WORKERS} postprocessing workers.`,
        )
        for (let i = 0; i < MAX_MASK_APPLICATION_WORKERS; i++) {
          const worker = new Worker(
            new URL('../components/engine/postprocessing_worker.js', import.meta.url),
            {
              type: 'module',
              name: `postprocessing-worker-${i}-${Date.now().toString().slice(-4)}`,
            },
          )
          initialWorkers.push(worker)
        }
        workersCreatedRef.current = true
        setPostprocessingWorkers(initialWorkers)
      } catch (error) {
        console.error(
          '[MainThread-PostCtrl] Failed to create initial postprocessing workers:',
          error,
        )
        setOverallError((prev) =>
          prev
            ? `${prev} Failed to init postprocessing workers.`
            : 'Failed to init postprocessing workers.',
        )
      }

      return () => {
        console.log('[MainThread-PostCtrl] Cleaning up postprocessing workers on unmount.')
        initialWorkers.forEach((worker, index) => {
          try {
            worker.terminate()
          } catch (e) {
            console.error(`[MainThread-PostCtrl] Error terminating worker ${index} on unmount:`, e)
          }
        })
        workersCreatedRef.current = false
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [MAX_MASK_APPLICATION_WORKERS, setOverallError],
  )

  /**
   * Handles messages received from mask application Web Workers.
   * This function is crucial for updating job statuses based on worker output.
   */
  const handleMaskApplicationWorkerMessage = useCallback(
    (event: MessageEvent, workerIndex: number) => {
      const { type, payload } = event.data

      if (type === 'PROCESSING_RESULT') {
        const { jobId, transparentImageDataUrl, error: maskError } = payload
        const assignedJobId = workerController.workerJobAssignments.current.get(workerIndex)

        if (!jobId) {
          console.warn(
            `[MainThread-MaskCtrl] Mask application worker ${workerIndex} sent result without a jobId.`,
          )
          return
        }
        if (jobId !== assignedJobId) {
          console.warn(
            `[MainThread-MaskCtrl] Worker ${workerIndex} sent result for an unexpected job. Expected: ${assignedJobId}, Received: ${jobId}. This might happen if a job was reassigned or cancelled.`,
          )
          // Potentially, we might not want to process this if the job is no longer assigned to this worker.
          // However, for now, we'll assume the job ID in the payload is the source of truth for the update.
          // But we will not mark the worker as idle for the *assignedJobId* if they don't match.
        } else {
          // Only mark as idle if the job ID matches the assignment.
          workerController.workerJobAssignments.current.set(workerIndex, null)
        }

        setImageList((prevList) =>
          prevList.map((job) => {
            if (job.id === jobId) {
              if (maskError) {
                console.error(
                  `[MainThread-MaskCtrl] Mask application error for job ${jobId} from worker ${workerIndex}: ${maskError}`,
                )
                return {
                  ...job,
                  status: 'error',
                  error: `Mask Application Error (Worker ${workerIndex}): ${maskError}`,
                } as ExtendedImageJob
              } else if (transparentImageDataUrl) {
                // Clean up previous blob URL to prevent memory leaks
                if (job.processedImageUrl && job.processedImageUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(job.processedImageUrl)
                }

                const processedFileSize = getFileSizeFromDataUrl(transparentImageDataUrl)

                return {
                  ...job,
                  status: 'completed',
                  processedImageUrl: transparentImageDataUrl,
                  processedFileSize,
                  error: undefined,
                } as ExtendedImageJob
              } else {
                console.warn(
                  `[MainThread-MaskCtrl] Mask application worker ${workerIndex} returned no result or URL for job ${jobId}.`,
                )
                return {
                  ...job,
                  status: 'error',
                  error: 'Mask application worker returned no result or URL.',
                } as ExtendedImageJob
              }
            }
            return job
          }),
        )
        if (isBatchActiveRef.current) setTriggerMaskApplicationQueue((c) => c + 1)
      } else {
        console.log(
          `[MainThread-MaskCtrl] Received unhandled message type '${type}' from worker ${workerIndex}.`,
        )
      }
    },
    // Ensure workerController.workerJobAssignments is listed if it's directly used or its methods are.
    // Assuming workerJobAssignments is stable or managed within workerController hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setImageList, setTriggerMaskApplicationQueue, isBatchActiveRef],
  )

  /**
   * Handles errors originating from mask application Web Workers (e.g., worker script crashing).
   */
  const handleMaskApplicationWorkerError = useCallback(
    (event: ErrorEvent, workerIndex: number) => {
      console.error(
        `[MainThread-MaskCtrl] Critical error from mask application worker ${workerIndex}:`,
        event.message,
        event,
      )

      const assignedJobId = workerController.workerJobAssignments.current.get(workerIndex)
      if (assignedJobId) {
        setImageList((prev) =>
          prev.map((job) =>
            job.id === assignedJobId
              ? ({
                  ...job,
                  status: 'error',
                  error: `Mask application worker ${workerIndex} crashed: ${event.message}`,
                } as ExtendedImageJob)
              : job,
          ),
        )
        workerController.workerJobAssignments.current.set(workerIndex, null)
      }

      // This status update is typically handled by the useWorkerController's onError,
      // but we ensure the job is correctly marked and the worker is freed.

      const allMaskAppWorkersFailed = workerController.workerInitializationStatus.current.every(
        (s) => s === 'failed',
      )

      if (
        allMaskAppWorkersFailed &&
        (!overallErrorRef.current ||
          !overallErrorRef.current.includes('all mask application workers failed'))
      ) {
        console.warn('[MainThread-MaskCtrl] All mask application workers have failed.')
        setOverallError((prev) =>
          prev
            ? `${prev} All mask application workers failed.`
            : 'All mask application workers failed.',
        )
      }

      if (isBatchActiveRef.current) setTriggerMaskApplicationQueue((c) => c + 1)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setImageList,
      setOverallError,
      setTriggerMaskApplicationQueue,
      isBatchActiveRef,
      overallErrorRef,
    ],
  )

  /**
   * Sends an image job to a specified mask application worker for processing.
   */
  const sendToMaskApplicationWorker = useCallback(
    (job: ExtendedImageJob, workerIndex: number) => {
      const worker = workerController.workerRefs.current[workerIndex]
      if (worker && workerController.workerReadyStatus.current[workerIndex]) {
        console.log(
          `[MainThread-MaskCtrl] Sending job ${job.id} to postprocessing worker ${workerIndex}.`,
        )
        worker.postMessage({
          type: 'PROCESS_IMAGE',
          payload: {
            jobId: job.id,
            originalBlobUrl: job.preprocessedImageUrl,
            segmentationResult: job.segmentationResult,
          },
        })
        setImageList((prev) =>
          prev.map((j) =>
            j.id === job.id ? ({ ...j, status: 'postprocessing' } as ExtendedImageJob) : j,
          ),
        )
      } else {
        const reason = !worker
          ? 'worker instance is null'
          : 'worker is not ready or not initialized'
        console.warn(
          `[MainThread-MaskCtrl] Cannot send job ${job.id} to worker ${workerIndex}: ${reason}. Re-queuing job.`,
        )
        // Add job back to the front of the queue
        postprocessingQueueRef.current.unshift(job.id)
        // Ensure worker assignment is cleared if it was tentatively set
        if (workerController.workerJobAssignments.current.get(workerIndex) === job.id) {
          workerController.workerJobAssignments.current.set(workerIndex, null)
        }
        setImageList((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? ({
                  ...j,
                  status: 'pending_postprocessing', // Revert to pending
                  error: `Mask application worker ${workerIndex} unavailable: ${reason}. Job re-queued.`,
                } as ExtendedImageJob)
              : j,
          ),
        )
        // No need to trigger queue here, as processNextJob will be called again.
        // However, if this failure implies the worker is permanently unusable,
        // the workerController should handle its status update.
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setImageList, postprocessingQueueRef],
  )

  const isJobEligibleForMaskApplication = useCallback((job: ExtendedImageJob): boolean => {
    const isEligible =
      job.status === 'pending_postprocessing' &&
      !!job.preprocessedImageUrl &&
      !!job.segmentationResult

    if (
      job.status === 'pending_postprocessing' &&
      (!job.preprocessedImageUrl || !job.segmentationResult)
    ) {
      console.warn(
        `[MainThread-PostCtrl] Job ${job.id} is 'pending_postprocessing' but missing essential data. ` +
          `Preprocessed Image: ${!!job.preprocessedImageUrl}, Segmentation Result: ${!!job.segmentationResult}. Cannot process.`,
      )
    }

    return isEligible
  }, [])

  /**
   * Initialize the worker controller with the pool of mask application workers
   */
  const workerController = useWorkerController<ExtendedImageJob>({
    workers: postprocessingWorkers,
    maxWorkers: MAX_MASK_APPLICATION_WORKERS,
    onMessage: handleMaskApplicationWorkerMessage,
    onError: handleMaskApplicationWorkerError,
    jobQueueRef: postprocessingQueueRef,
    imageListRef,
    isBatchActiveRef,
    processJobFn: sendToMaskApplicationWorker,
    isJobEligibleForProcessing: isJobEligibleForMaskApplication,
    setTriggerProcessQueue: setTriggerMaskApplicationQueue,
    workerType: 'MaskApplication', // Important for logging and potentially worker identification
  }) as WorkerController

  const rebuildWorkersAndSetState = useCallback(() => {
    console.info(`[MainThread-PostCtrl] Attempting to rebuild all postprocessing workers.`)

    // Terminate existing workers before creating new ones
    setPostprocessingWorkers((currentWorkers) => {
      currentWorkers.forEach((worker, index) => {
        try {
          console.log(`[MainThread-PostCtrl] Terminating old worker ${index} during rebuild.`)
          worker.terminate()
        } catch (e) {
          console.error(
            `[MainThread-PostCtrl] Error terminating old worker ${index} during rebuild:`,
            e,
          )
        }
      })

      const newWorkersArray: Worker[] = []
      try {
        for (let i = 0; i < MAX_MASK_APPLICATION_WORKERS; i++) {
          const worker = new Worker(
            new URL('../components/engine/postprocessing_worker.js', import.meta.url),
            {
              type: 'module',
              name: `postprocessing-worker-${i}-rebuilt-${Date.now().toString().slice(-4)}`,
            },
          )
          newWorkersArray.push(worker)
        }
        workersCreatedRef.current = true // Mark that workers (re)creation was attempted/successful
        console.log(
          `[MainThread-PostCtrl] Successfully rebuilt ${newWorkersArray.length} postprocessing workers.`,
        )
        // Reset the rebuild attempt flag *after* successful creation,
        // so if creation fails, it can be attempted again (e.g., on next trigger).
        // This logic might need adjustment based on how often rebuilds should occur.
        // For now, window._postprocessingRebuiltAttempted is reset by the calling useEffect.
        if (typeof window !== 'undefined') {
          // This flag should be reset more carefully, perhaps after a successful processNextJob call with new workers.
          // For now, resetting it here allows another attempt if this rebuild fails partway.
          // window._postprocessingRebuiltAttempted = false;
        }
        return newWorkersArray
      } catch (error) {
        console.error(
          '[MainThread-PostCtrl] Critical error creating new workers during rebuild:',
          error,
        )
        setOverallError((prev) =>
          prev
            ? `${prev} Failed to rebuild postprocessing workers.`
            : 'Failed to rebuild postprocessing workers.',
        )
        workersCreatedRef.current = false // Mark creation as failed
        return [] // Return empty array if rebuild fails
      }
    })
  }, [MAX_MASK_APPLICATION_WORKERS, setOverallError])

  useEffect(
    () => {
      if (isBatchActiveRef.current) {
        // This log can be noisy if triggered frequently. Consider conditional logging or removing if too verbose.
        // console.log(
        //   `[MainThread-PostCtrl] Mask application queue triggered. Queue length: ${postprocessingQueueRef.current.length}`,
        // );

        const anyPostProcessingWorkersReady = workerController.workerReadyStatus.current.some(
          (status) => status === true,
        )
        const allWorkersFailed =
          workersCreatedRef.current && // Only consider all failed if workers were meant to be created
          workerController.workerInitializationStatus.current.length ===
            MAX_MASK_APPLICATION_WORKERS && // Ensure all potential worker slots are accounted for
          workerController.workerInitializationStatus.current.every((status) => status === 'failed')

        if (allWorkersFailed && postprocessingQueueRef.current.length > 0) {
          console.warn(
            `[MainThread-PostCtrl] All ${MAX_MASK_APPLICATION_WORKERS} postprocessing workers have failed and jobs are in queue. Attempting rebuild.`,
          )

          if (typeof window !== 'undefined' && !window._postprocessingRebuiltAttempted) {
            window._postprocessingRebuiltAttempted = true
            rebuildWorkersAndSetState()
            // After attempting a rebuild, we might want to immediately try processing again,
            // or wait for the next trigger. For now, let it flow.
            // The workerController's internal state will be updated by setPostprocessingWorkers,
            // which should then be reflected in workerReadyStatus on next check.
          } else if (typeof window !== 'undefined' && window._postprocessingRebuiltAttempted) {
            console.warn(
              '[MainThread-PostCtrl] Worker rebuild already attempted. Waiting for next trigger or manual intervention if issues persist.',
            )
          }
        } else if (anyPostProcessingWorkersReady && postprocessingQueueRef.current.length > 0) {
          // console.log('[MainThread-PostCtrl] Processing next job in mask application queue.')
          workerController.processNextJob()
        } else if (postprocessingQueueRef.current.length > 0) {
          // This case means jobs are pending, but no workers are ready (and not all have "failed" to trigger rebuild, or rebuild was attempted)
          console.log(
            `[MainThread-PostCtrl] Jobs in mask queue, but no workers ready. Current worker states: Init: [${workerController.workerInitializationStatus.current.join(', ')}], Ready: [${workerController.workerReadyStatus.current.join(', ')}]`,
          )
          setIsMaskQueueBeingProcessed(false) // Ensure queue processing is marked as not active
        } else {
          // Queue is empty or no batch active
          setIsMaskQueueBeingProcessed(false)
        }
      } else {
        setIsMaskQueueBeingProcessed(false)
        // Reset rebuild attempt flag when batch processing stops, allowing a fresh attempt next time
        if (typeof window !== 'undefined') {
          window._postprocessingRebuiltAttempted = false
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // Dependencies for the effect
      isBatchActiveRef.current, // Note: isBatchActiveRef.current makes this tricky for dependency array.
      // Prefer passing isBatchActiveRef.current as a value if possible, or restructure.
      // For now, assuming the trigger `setTriggerMaskApplicationQueue` handles re-evaluation.
      setTriggerMaskApplicationQueue, // This is likely the primary trigger for this effect.
      workerController.processNextJob,
      workerController.workerInitializationStatus,
      workerController.workerReadyStatus,
      rebuildWorkersAndSetState,
      setIsMaskQueueBeingProcessed,
      MAX_MASK_APPLICATION_WORKERS, // Added as it's used in allWorkersFailed logic
      // postprocessingQueueRef.current.length is not a stable dependency.
      // The effect should run when setTriggerMaskApplicationQueue changes.
    ],
  )

  return {
    postprocessingQueueRef,
    processNextForMaskApplication: workerController.processNextJob,
    cleanupMaskApplicationWorkers: workerController.cleanupWorkers,
    maskApplicationWorkerRefs: workerController.workerRefs,
    postprocessingWorkerJobAssignments: workerController.workerJobAssignments,
    maskApplicationWorkerInitializationStatus: workerController.workerInitializationStatus,
    maskApplicationWorkerReadyStatus: workerController.workerReadyStatus,
  }
}
