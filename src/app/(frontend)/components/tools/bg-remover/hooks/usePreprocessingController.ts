import { useRef, useCallback, useEffect, useState } from 'react'
import type { ExtendedImageJob, PreprocessingControllerReturn } from './types'
import { useWorkerController } from './'

interface PreprocessingControllerOptions {
  imageListRef: React.RefObject<ExtendedImageJob[]>
  isBatchActiveRef: React.RefObject<boolean>
  modelLoadedRef: React.RefObject<boolean> // Needed to set job status correctly
  overallErrorRef: React.RefObject<string | null>
  segmentationQueueRef: React.RefObject<string[]> // To add job to next queue
  setImageList: React.Dispatch<React.SetStateAction<ExtendedImageJob[]>>
  setOverallError: React.Dispatch<React.SetStateAction<string | null>>
  setTriggerPreprocessingQueue: React.Dispatch<React.SetStateAction<number>>
  setTriggerProcessQueue: React.Dispatch<React.SetStateAction<number>> // To trigger segmentation queue
  MAX_PREPROCESSING_WORKERS: number
}

// Define the type for the worker controller
interface WorkerController {
  workerRefs: React.RefObject<Worker[]>
  workerJobAssignments: React.RefObject<Map<number, string | null>>
  workerInitializationStatus: React.RefObject<Array<'pending' | 'success' | 'failed'>>
  processNextJob: () => void
  cleanupWorkers: () => void
  workerReadyStatus: React.RefObject<boolean[]>
}

/**
 * @hook usePreprocessingController
 * @description
 * Orchestrates and manages a pool of Web Workers dedicated to image preprocessing tasks.
 * This hook forms a critical part of the background removal pipeline, handling the initial
 * processing of images before they are sent for segmentation. It aims to perform these
 * CPU-intensive tasks off the main thread to maintain UI responsiveness.
 *
 * Core Responsibilities:
 * - **Worker Lifecycle Management**: Initializes a configurable number of preprocessing workers
 *   on mount and terminates them cleanly on unmount. Monitors worker creation and health.
 * - **Job Queue Management**: Maintains an internal queue (`preprocessingQueueRef`) for image
 *   jobs (`ExtendedImageJob`) that are pending preprocessing.
 * - **Job Distribution**: Intelligently distributes jobs from the queue to available (idle)
 *   workers. It leverages the `useWorkerController` hook for the underlying worker
 *   management and job assignment logic.
 * - **Inter-Worker Communication**:
 *   - Sends image data (as a data URL) to workers for preprocessing.
 *   - Receives messages from workers, including:
 *     - `PREPROCESSING_RESULT`: Contains the preprocessed image URL or an error.
 *     - `WORKER_READY`: Indicates a worker is initialized and ready for tasks.
 *   - Handles worker errors and crashes gracefully.
 * - **State & Status Updates**:
 *   - Updates the `imageList` state with the status of each job (e.g., 'pending_preprocessing',
 *     'preprocessing', 'queued' for segmentation, 'error').
 *   - Manages `overallError` state if critical failures occur (e.g., all workers fail).
 * - **Pipeline Integration**:
 *   - Adds successfully preprocessed job IDs to the `segmentationQueueRef`.
 *   - Triggers the segmentation process (`setTriggerProcessQueue`) if the segmentation model
 *     is loaded (`modelLoadedRef`).
 * - **Batch Processing Control**: Responds to changes in `isBatchActiveRef` to pause or
 *   resume job processing.
 * - **Error Handling**: Includes mechanisms for handling errors during worker creation,
 *   job dispatch, image fetching, and worker execution. Provides detailed error messages
 *   on a per-job basis and for the overall system.
 *
 * @param {PreprocessingControllerOptions} options - Configuration object for the controller.
 * @param {React.RefObject<ExtendedImageJob[]>} options.imageListRef - Ref to the list of all image jobs.
 * @param {React.RefObject<boolean>} options.isBatchActiveRef - Ref indicating if batch processing is active.
 * @param {React.RefObject<boolean>} options.modelLoadedRef - Ref indicating if the segmentation model is loaded.
 * @param {React.RefObject<string | null>} options.overallErrorRef - Ref to store any critical, system-wide error message.
 * @param {React.RefObject<string[]>} options.segmentationQueueRef - Ref to the queue for the next (segmentation) stage.
 * @param {React.Dispatch<React.SetStateAction<ExtendedImageJob[]>>} options.setImageList - State setter for the image job list.
 * @param {React.Dispatch<React.SetStateAction<string | null>>} options.setOverallError - State setter for critical errors.
 * @param {React.Dispatch<React.SetStateAction<number>>} options.setTriggerPreprocessingQueue - State setter to trigger processing of the preprocessing queue.
 * @param {React.Dispatch<React.SetStateAction<number>>} options.setTriggerProcessQueue - State setter to trigger the next (segmentation) processing queue.
 * @param {number} options.MAX_PREPROCESSING_WORKERS - The maximum number of preprocessing workers to instantiate.
 *
 * @returns {PreprocessingControllerReturn} An object containing:
 * @returns {React.RefObject<string[]>} return.preprocessingQueueRef - Ref to the internal queue of job IDs awaiting preprocessing.
 * @returns {() => void} return.processNextForPreprocessing - Function to manually trigger processing of the next job in the queue.
 * @returns {() => void} return.cleanupPreprocessingWorkers - Function to terminate all preprocessing workers.
 * @returns {React.RefObject<Worker[]>} return.preprocessingWorkerRefs - Ref to the array of active worker instances.
 * @returns {React.RefObject<Map<number, string | null>>} return.preprocessingWorkerJobAssignments - Ref to a map tracking which job ID (if any) is assigned to each worker.
 * @returns {React.RefObject<Array<'pending' | 'success' | 'failed'>>} return.preprocessingWorkerInitializationStatus - Ref tracking the initialization status of each worker.
 * @returns {React.RefObject<boolean[]>} return.preprocessingWorkerReadyStatus - Ref tracking if each worker has reported itself as ready.
 */
export const usePreprocessingController = ({
  imageListRef,
  isBatchActiveRef,
  modelLoadedRef,
  overallErrorRef,
  segmentationQueueRef,
  setImageList,
  setOverallError,
  setTriggerPreprocessingQueue,
  setTriggerProcessQueue,
  MAX_PREPROCESSING_WORKERS,
}: PreprocessingControllerOptions): PreprocessingControllerReturn => {
  const preprocessingQueueRef = useRef<string[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])

  // Initialize the workers when the component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR guard

    console.log(
      `[MainThread-PreCtrl] Initializing ${MAX_PREPROCESSING_WORKERS} preprocessing workers (mount effect)`,
    )
    const newWorkers: Worker[] = []
    let creationError = false

    try {
      for (let i = 0; i < MAX_PREPROCESSING_WORKERS; i++) {
        console.log(`[MainThread-PreCtrl] Creating preprocessing worker ${i}`)
        const worker = new Worker(
          new URL('../components/engine/preprocessing_worker.js', import.meta.url),
          { type: 'module', name: `preprocessing-worker-${i}-${Date.now().toString().slice(-4)}` },
        )

        if (!worker) {
          throw new Error(`Failed to create preprocessing worker ${i}`)
        }
        newWorkers.push(worker)
        console.log(`[MainThread-PreCtrl] Preprocessing worker ${i} instance created successfully`)
      }
    } catch (error) {
      console.error('[MainThread-PreCtrl] Error creating worker instances:', error)
      setOverallError((prev) =>
        prev
          ? `${prev} Failed to initialize preprocessing workers.`
          : 'Failed to initialize preprocessing workers.',
      )
      creationError = true
    }

    if (!creationError) {
      setWorkers(newWorkers)
      console.log(
        `[MainThread-PreCtrl] All ${newWorkers.length} preprocessing workers created and set in state`,
      )
    }

    // Cleanup workers on unmount
    return () => {
      console.log(
        `[MainThread-PreCtrl] Cleaning up ${newWorkers.length} preprocessing workers on unmount`,
      )
      newWorkers.forEach((worker, index) => {
        try {
          console.log(`[MainThread-PreCtrl] Terminating worker ${index} on cleanup`)
          worker.terminate()
        } catch (error) {
          console.error(`[MainThread-PreCtrl] Error terminating worker ${index}:`, error)
        }
      })
      setWorkers([]) // Clear workers from state on unmount
    }
  }, [MAX_PREPROCESSING_WORKERS, setOverallError]) // Effect runs if MAX_PREPROCESSING_WORKERS changes

  /**
   * Handles messages received from preprocessing workers.
   * Processes successful preprocessing results or handles errors,
   * updates job status, and manages the workflow to the next stage.
   *
   * @param {MessageEvent} event - The message event from the worker
   * @param {number} workerIndex - Index of the worker that sent the message
   */
  const handlePreprocessingWorkerMessage = useCallback(
    (event: MessageEvent, workerIndex: number) => {
      const { type, payload } = event.data

      if (type === 'PREPROCESSING_RESULT') {
        const { jobId, preprocessedImageUrl, error: preprocessingError } = payload
        const assignedJobId = workerController.workerJobAssignments.current.get(workerIndex)

        if (!jobId) {
          console.error(
            `[MainThread-PreCtrl] Worker ${workerIndex} sent result without jobId`,
            payload,
          )
          return
        }
        if (jobId !== assignedJobId) {
          console.error(
            `[MainThread-PreCtrl] Worker ${workerIndex} sent result for wrong job. Expected: ${assignedJobId}, Got: ${jobId}`,
          )
          return
        }

        workerController.workerJobAssignments.current.set(workerIndex, null) // Free up the worker

        setImageList((prevList) =>
          prevList.map((job) => {
            if (job.id === jobId) {
              if (preprocessingError) {
                return {
                  ...job,
                  status: 'error',
                  error: `Preprocessing Error (Worker ${workerIndex}): ${preprocessingError}`,
                } as ExtendedImageJob
              } else if (preprocessedImageUrl) {
                if (!segmentationQueueRef.current.includes(jobId)) {
                  segmentationQueueRef.current.push(jobId)
                }
                if (modelLoadedRef.current) {
                  setTriggerProcessQueue((c) => c + 1)
                }
                return {
                  ...job,
                  status: modelLoadedRef.current ? 'queued' : 'pending_segmentation',
                  preprocessedImageUrl: preprocessedImageUrl,
                  error: undefined,
                } as ExtendedImageJob
              } else {
                return {
                  ...job,
                  status: 'error',
                  error: 'Preprocessing worker returned no result or URL.',
                } as ExtendedImageJob
              }
            }
            return job
          }),
        )
        if (isBatchActiveRef.current) setTriggerPreprocessingQueue((c) => c + 1)
      } else if (type === 'WORKER_READY') {
        console.log(`[MainThread-PreCtrl] Worker ${workerIndex} sent WORKER_READY message`)
      }
    },
    // workerController is not a direct dependency here, its methods should be stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setImageList,
      setTriggerPreprocessingQueue,
      setTriggerProcessQueue,
      isBatchActiveRef,
      modelLoadedRef,
      segmentationQueueRef,
    ],
  )

  /**
   * Handles errors from preprocessing workers.
   * Updates job status for affected jobs and checks for systemic worker failures.
   *
   * @param {ErrorEvent} event - The error event from the worker
   * @param {number} workerIndex - Index of the worker that encountered an error
   */
  const handlePreprocessingWorkerError = useCallback(
    (event: ErrorEvent, workerIndex: number) => {
      console.error(`[MainThread-PreCtrl] Error from worker ${workerIndex}:`, event.message)

      const assignedJobId = workerController.workerJobAssignments.current.get(workerIndex)
      if (assignedJobId) {
        setImageList((prev) =>
          prev.map((job) =>
            job.id === assignedJobId
              ? ({
                  ...job,
                  status: 'error',
                  error: `Preprocessing worker ${workerIndex} crashed: ${event.message}`,
                } as ExtendedImageJob)
              : job,
          ),
        )
        workerController.workerJobAssignments.current.set(workerIndex, null)
      }

      const allPreprocessingFailed = workerController.workerInitializationStatus.current.every(
        (s: 'pending' | 'success' | 'failed') => s === 'failed',
      )
      if (
        allPreprocessingFailed &&
        workerController.workerInitializationStatus.current.length === MAX_PREPROCESSING_WORKERS &&
        (!overallErrorRef.current ||
          !overallErrorRef.current.includes('all preprocessing workers failed'))
      ) {
        setOverallError((prev) =>
          prev ? `${prev} All preprocessing workers failed.` : 'All preprocessing workers failed.',
        )
      }

      if (isBatchActiveRef.current) setTriggerPreprocessingQueue((c) => c + 1)
    },
    // workerController is not a direct dependency here, its methods should be stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setImageList,
      setOverallError,
      setTriggerPreprocessingQueue,
      isBatchActiveRef,
      overallErrorRef,
      MAX_PREPROCESSING_WORKERS,
    ],
  )

  /**
   * Sends a job to a preprocessing worker and updates its status.
   * Handles error cases where the worker might not be available.
   *
   * @param {ExtendedImageJob} job - The job to process
   * @param {number} workerIndex - The index of the target worker
   */
  const sendToPreprocessingWorker = useCallback(
    (job: ExtendedImageJob, workerIndex: number) => {
      console.log(
        `[MainThread-PreCtrl] Attempting to send job ${job.id} to preprocessing worker ${workerIndex}`,
      )
      const worker = workerController.workerRefs.current[workerIndex]

      if (!worker) {
        console.error(
          `[MainThread-PreCtrl] Worker ${workerIndex} is null. Re-queueing job ${job.id}.`,
        )
        if (!preprocessingQueueRef.current.includes(job.id)) {
          preprocessingQueueRef.current.unshift(job.id)
        }
        if (workerController.workerJobAssignments.current.get(workerIndex) === job.id) {
          workerController.workerJobAssignments.current.set(workerIndex, null)
        }
        setImageList((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? ({
                  ...j,
                  status: 'pending_preprocessing',
                  error: 'Preprocessing worker instance unexpectedly missing for assignment.',
                } as ExtendedImageJob)
              : j,
          ),
        )
        if (isBatchActiveRef.current) setTriggerPreprocessingQueue((c) => c + 1)
        return
      }

      const verifyWorkerAndSend = async () => {
        try {
          const workerResponded = await new Promise<boolean>((resolve) => {
            const timeoutId = setTimeout(() => {
              worker.removeEventListener('message', responseHandler)
              console.error(
                `[MainThread-PreCtrl] Worker ${workerIndex} did not respond to verification for job ${job.id}`,
              )
              resolve(false)
            }, 2000) // Increased timeout for verification

            const responseHandler = (event: MessageEvent) => {
              if (event.data?.type === 'WORKER_READY') {
                console.log(
                  `[MainThread-PreCtrl] Worker ${workerIndex} verified responsive before processing job ${job.id}`,
                )
                clearTimeout(timeoutId)
                worker.removeEventListener('message', responseHandler)
                resolve(true)
              }
            }
            worker.addEventListener('message', responseHandler)
            console.log(
              `[MainThread-PreCtrl] Verifying worker ${workerIndex} is responsive for job ${job.id}`,
            )
            worker.postMessage({ type: 'TEST_WORKER' })
          })

          if (!workerResponded) {
            throw new Error(`Worker ${workerIndex} is not responding or failed verification`)
          }

          if (job.originalBlobUrl) {
            console.log(
              `[MainThread-PreCtrl] Fetching image data for job ${job.id} before sending to worker`,
            )
            const response = await fetch(job.originalBlobUrl)
            if (!response.ok) {
              throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`)
            }
            const blob = await response.blob()
            console.log(
              `[MainThread-PreCtrl] Image fetched successfully for job ${job.id}, size: ${blob.size} bytes`,
            )
            const reader = new FileReader()
            reader.onloadend = function () {
              worker.postMessage({
                type: 'PREPROCESS_IMAGE',
                payload: {
                  jobId: job.id,
                  imageDataUrl: reader.result as string,
                },
              })
              console.log(
                `[MainThread-PreCtrl] Image data URL sent to worker ${workerIndex} for job ${job.id}`,
              )
              setImageList((prev) =>
                prev.map((j) =>
                  j.id === job.id ? ({ ...j, status: 'preprocessing' } as ExtendedImageJob) : j,
                ),
              )
            }
            reader.onerror = function (error) {
              throw new Error(
                `Error converting blob to data URL for job ${job.id}: ${error?.toString()}`,
              )
            }
            reader.readAsDataURL(blob)
          } else {
            throw new Error(`No originalBlobUrl for job ${job.id}`)
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error(
            `[MainThread-PreCtrl] Error in sendToPreprocessingWorker for job ${job.id} with worker ${workerIndex}:`,
            error,
          )
          if (!preprocessingQueueRef.current.includes(job.id)) {
            preprocessingQueueRef.current.unshift(job.id)
          }
          workerController.workerJobAssignments.current.set(workerIndex, null)
          setImageList((prev) =>
            prev.map((j) =>
              j.id === job.id
                ? ({
                    ...j,
                    status: 'pending_preprocessing',
                    error: `Error sending to worker ${workerIndex}: ${error.message || 'Unknown error'}`,
                  } as ExtendedImageJob)
                : j,
            ),
          )
          if (isBatchActiveRef.current) setTriggerPreprocessingQueue((c) => c + 1)
        }
      }

      verifyWorkerAndSend()
    },
    // workerController is not a direct dependency here, its methods should be stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setImageList, setTriggerPreprocessingQueue, isBatchActiveRef],
  )

  /**
   * Determines if a job is eligible for preprocessing based on its status.
   *
   * @param {ExtendedImageJob} job - The job to check
   * @returns {boolean} True if the job is eligible for preprocessing
   */
  const isJobEligibleForPreprocessing = useCallback((job: ExtendedImageJob): boolean => {
    return job.status === 'pending_preprocessing'
  }, [])

  /**
   * Initializes the worker controller with the preprocessing configuration.
   * The worker controller handles the core logic of worker management.
   */
  const workerController = useWorkerController<ExtendedImageJob>({
    workers: workers,
    maxWorkers: MAX_PREPROCESSING_WORKERS,
    onMessage: handlePreprocessingWorkerMessage,
    onError: handlePreprocessingWorkerError,
    jobQueueRef: preprocessingQueueRef,
    imageListRef,
    isBatchActiveRef,
    processJobFn: sendToPreprocessingWorker,
    isJobEligibleForProcessing: isJobEligibleForPreprocessing,
    setTriggerProcessQueue: setTriggerPreprocessingQueue,
    workerType: 'Preprocessing',
  }) as WorkerController

  useEffect(() => {
    if (
      workers.length > 0 &&
      isBatchActiveRef.current &&
      preprocessingQueueRef.current.length > 0
    ) {
      console.log(
        `[MainThread-PreCtrl] Workers initialized (${workers.length}) and batch active with pending jobs (${preprocessingQueueRef.current.length}). Triggering queue processing.`,
      )
      setTriggerPreprocessingQueue((c) => c + 1) // This will call workerController.processNextJob()
    }
  }, [workers, isBatchActiveRef, setTriggerPreprocessingQueue])

  return {
    preprocessingQueueRef,
    processNextForPreprocessing: workerController.processNextJob,
    cleanupPreprocessingWorkers: workerController.cleanupWorkers,
    preprocessingWorkerRefs: workerController.workerRefs,
    preprocessingWorkerJobAssignments: workerController.workerJobAssignments,
    preprocessingWorkerInitializationStatus: workerController.workerInitializationStatus,
    preprocessingWorkerReadyStatus: workerController.workerReadyStatus,
  } as PreprocessingControllerReturn
}
