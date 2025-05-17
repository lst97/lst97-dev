import { useEffect, useRef, useCallback, useState } from 'react'
import type {
  BaseJob,
  WorkerControllerOptions,
  WorkerControllerReturn,
  ModelLoadingProgressPayload,
  WorkerMessage,
  ModelLoadingStatusPayload,
} from '../components/engine/types' // Adjusted path

/**
 * @hook useWorkerController
 * @description Manages a pool of web workers to perform tasks concurrently.
 * This hook handles the entire lifecycle of workers, including initialization,
 * job distribution from a queue, message and error handling, and cleanup.
 * It implements a retry mechanism for worker initialization failures and
 * provides detailed status tracking for each worker (initialization, readiness, job assignment).
 *
 * Special attention is given to messages from workers regarding model loading,
 * allowing the main thread to display progress and status updates.
 *
 * The hook is generic and can be configured for different types of jobs and workers.
 * It relies on several refs and callbacks provided via options to interact with
 * the broader application state (e.g., job queue, list of items to process).
 *
 * Key features:
 * - Dynamic worker pool management up to \`maxWorkers\`.
 * - Robust worker initialization with retries on failure.
 * - Job queuing and assignment to available, ready workers.
 * - Centralized message handling, with special processing for \`MODEL_LOADING_PROGRESS\` and \`WORKER_READY\` type messages.
 * - Detailed tracking of worker initialization status and readiness.
 * - Graceful cleanup of workers.
 *
 * @template T - The type of job objects being processed. Each job object must have an \`id: string\` and \`status: string\`.
 * @param {WorkerControllerOptions<T>} options - Configuration options for the worker controller.
 * @param {Worker[]} options.workers - An array of pre-instantiated Worker objects to be managed. This array can change, triggering re-initialization.
 * @param {number} options.maxWorkers - The maximum number of workers allowed in the pool.
 * @param {(event: MessageEvent, workerIndex: number) => void} options.onMessage - Callback function invoked when a worker sends a message (excluding model loading progress messages, which are handled internally).
 * @param {(event: ErrorEvent, workerIndex: number) => void} options.onError - Callback function invoked when a worker encounters an error.
 * @param {React.RefObject<string[]>} options.jobQueueRef - A ref to an array of job IDs. Jobs are taken from the front of this queue.
 * @param {React.RefObject<T[]>} options.imageListRef - A ref to an array of all job objects. Used to find the job details by ID from the \`jobQueueRef\`.
 * @param {React.RefObject<boolean>} options.isBatchActiveRef - A ref to a boolean indicating whether new jobs should be processed.
 * @param {(job: T, workerIndex: number) => void} options.processJobFn - A function called to send a job to a specific worker for processing.
 * @param {(job: T) => boolean} options.isJobEligibleForProcessing - A predicate function to determine if a job is currently in a state where it can be processed.
 * @param {React.Dispatch<React.SetStateAction<number>>} options.setTriggerProcessQueue - A state setter, likely used to trigger re-evaluation or re-processing of the job queue.
 * @param {string} [options.workerType='Generic'] - An optional string to identify the type of workers being managed, primarily for logging purposes.
 *
 * @returns {WorkerControllerReturn} An object containing refs and functions for interacting with and monitoring the worker pool.
 * @returns {React.RefObject<Worker[]>} return.workerRefs - Ref to the current array of active Worker instances.
 * @returns {React.RefObject<Map<number, string | null>>} return.workerJobAssignments - Ref to a map where keys are worker indices and values are the IDs of jobs currently assigned to them (or null if idle).
 * @returns {React.RefObject<Array<'pending' | 'success' | 'failed'>>} return.workerInitializationStatus - Ref to an array tracking the initialization status of each worker slot up to \`maxWorkers\`.
 * @returns {React.RefObject<boolean[]>} return.workerReadyStatus - Ref to an array tracking whether each worker has reported itself as ready to process jobs.
 * @returns {() => void} return.processNextJob - Function to attempt to dequeue and assign the next eligible job to an available and ready worker.
 * @returns {() => void} return.cleanupWorkers - Function to terminate all managed workers and reset internal state.
 * @returns {{ progress: any; status: string }} return.modelLoadingProgress - An object containing the latest progress data (\`progress\`) and status message (\`status\`) related to model loading within the workers.
 */
export const useWorkerController = <T extends BaseJob>({
  workers,
  maxWorkers,
  onMessage,
  onError,
  jobQueueRef,
  imageListRef,
  isBatchActiveRef,
  processJobFn,
  isJobEligibleForProcessing,
  workerType = 'Generic',
}: WorkerControllerOptions<T>): WorkerControllerReturn => {
  const workerRefs = useRef<Worker[]>([])
  const workerJobAssignments = useRef<Map<number, string | null>>(new Map())
  const workerInitializationStatus = useRef<Array<'pending' | 'success' | 'failed'>>([])
  const workerReadyStatus = useRef<boolean[]>([]) // Track actual worker readiness

  // State for tracking model loading progress
  const [modelLoadingProgressData, setModelLoadingProgressData] =
    useState<ModelLoadingProgressPayload | null>(null)
  const [modelLoadingStatus, setModelLoadingStatus] = useState<string>('Initializing...')

  // Create a custom message handler that wraps the provided onMessage
  // but also captures MODEL_LOADING_PROGRESS messages
  const handleMessage = useCallback(
    (event: MessageEvent, workerIndex: number) => {
      const message = event.data as WorkerMessage | null // Top-level type assertion

      if (!message || !message.type) {
        // Handle cases where event.data might be undefined, null, or not a valid WorkerMessage
        // Pass to original handler if structure is unknown, but ensure it still fits onMessage's expected event type
        onMessage(event, workerIndex)
        return
      }

      const { type, payload } = message

      // Track worker ready status
      if (type === 'WORKER_READY' || type === 'INIT_WORKER_COMPLETE') {
        if (workerIndex < 0 || workerIndex >= workerReadyStatus.current.length) {
          console.warn(
            `[MainThread-WorkerCtrl] ${workerType} Worker ${workerIndex} reported ready, but index is out of bounds for workerReadyStatus. Length: ${workerReadyStatus.current.length}`,
          )
          // Optionally resize or handle this scenario if dynamic worker addition beyond initial maxWorkers is a feature.
        } else {
          console.log(`[MainThread-WorkerCtrl] ${workerType} Worker ${workerIndex} reported ready`)
          workerReadyStatus.current[workerIndex] = true
        }

        if (workerIndex < 0 || workerIndex >= workerInitializationStatus.current.length) {
          console.warn(
            `[MainThread-WorkerCtrl] ${workerType} Worker ${workerIndex} reported ready, but index is out of bounds for workerInitializationStatus. Length: ${workerInitializationStatus.current.length}`,
          )
        } else if (workerInitializationStatus.current[workerIndex] !== 'success') {
          workerInitializationStatus.current[workerIndex] = 'success'
          console.log(
            `[MainThread-WorkerCtrl] ${workerType} Worker ${workerIndex} initialization status set to SUCCESS`,
          )
        }
      }

      // Handle MODEL_LOADING_PROGRESS messages
      if (type === 'MODEL_LOADING_PROGRESS') {
        const progressPayload = payload as ModelLoadingProgressPayload // Assert to specific payload type
        setModelLoadingProgressData(progressPayload)

        // Update status based on progress data
        if (progressPayload && typeof progressPayload === 'object') {
          if (progressPayload.file) {
            setModelLoadingStatus(`Downloading ${progressPayload.file}...`)
          } else if (progressPayload.status) {
            setModelLoadingStatus(progressPayload.status)
          }
        }

        // This message type is handled internally for model progress UI and not passed to the generic onMessage.
        return
      }

      // Handle MODEL_LOADING_STATUS messages
      if (type === 'MODEL_LOADING_STATUS') {
        const statusPayload = payload as ModelLoadingStatusPayload // Assert to specific payload type
        console.log(`[MainThread-WorkerCtrl] Model loading status:`, statusPayload)

        if (statusPayload && typeof statusPayload === 'object') {
          if (statusPayload.loading === false && statusPayload.loaded === true) {
            setModelLoadingStatus('Model loaded successfully')
          } else if (statusPayload.error) {
            setModelLoadingStatus(`Error: ${statusPayload.error}`)
          } else if (statusPayload.loading === true) {
            setModelLoadingStatus('Loading model...')
          }
        }
        // Potentially pass this to onMessage as well, or handle fully here.
        // If not returning, it will fall through to the general onMessage call.
      }

      // Pass the event to the original onMessage handler
      // This ensures messages not specifically handled above (or those that don't return)
      // are still processed by the consumer of the hook.
      onMessage(event, workerIndex)
    },
    [onMessage, workerType], // Removed setTriggerProcessQueue from deps as it's not used in this callback
  )

  // Setup workers with message and error handlers
  useEffect(() => {
    if (typeof window === 'undefined') return

    // If workers array is empty but we already have workers in the ref,
    // don't reinitialize as this might be a transient empty array or part of an HMR update.
    if (workers.length === 0 && workerRefs.current.length > 0 /*&& workerInitialized.current*/) {
      console.log(
        `[MainThread-WorkerCtrl] Empty workers array received but workers already initialized. Skipping.`,
      )
      return
    }

    // If there are no workers, don't initialize anything
    if (workers.length === 0) {
      console.log(`[MainThread-WorkerCtrl] No workers to initialize`)
      return
    }

    console.log(
      `[MainThread-WorkerCtrl] Initializing ${workers.length} workers of type ${workerType}`,
    )

    // Function to attempt re-initialization for a failed worker.
    const retryInitialization = (index: number) => {
      try {
        console.log(
          `[MainThread-WorkerCtrl] Retrying initialization for ${workerType} worker ${index}`,
        )

        // Terminate existing worker at this index, if any, before creating a new one.
        if (workerRefs.current[index]) {
          try {
            console.log(
              `[MainThread-WorkerCtrl] Terminating existing ${workerType} worker ${index} before retry`,
            )
            workerRefs.current[index].terminate()
          } catch (e) {
            console.error(
              `[MainThread-WorkerCtrl] Error terminating existing worker ${index} before retry:`,
              e,
            )
          }
        }

        // Create a new worker instance to replace the failed one.
        // The URL for the worker script is determined by workerType.
        let newWorker: Worker
        const workerName = `${workerType}-worker-${index}-retry`

        if (workerType === 'Segmentation') {
          newWorker = new Worker(
            new URL('../components/engine/segmentation_worker.js', import.meta.url),
            {
              type: 'module',
              name: workerName,
            },
          )
        } else if (workerType === 'Preprocessing') {
          newWorker = new Worker(
            new URL('../components/engine/preprocessing_worker.js', import.meta.url),
            {
              type: 'module',
              name: workerName,
            },
          )
        } else {
          // Assuming Postprocessing or a default
          newWorker = new Worker(
            new URL('../components/engine/postprocessing_worker.js', import.meta.url),
            {
              type: 'module',
              name: workerName,
            },
          )
        }

        // Update references and status for the new worker.
        workerRefs.current[index] = newWorker
        workerInitializationStatus.current[index] = 'pending'
        workerReadyStatus.current[index] = false

        // Set up message and error handlers for the newly created worker.
        newWorker.onmessage = (event) => handleMessage(event, index)
        newWorker.onerror = (event) => {
          workerInitializationStatus.current[index] = 'failed'
          workerReadyStatus.current[index] = false
          onError(event, index)

          // Schedule a final attempt to initialize the worker after a delay.
          setTimeout(() => {
            if (workerInitializationStatus.current[index] === 'failed') {
              console.log(`[MainThread-WorkerCtrl] Second retry for ${workerType} worker ${index}`)
              workerInitializationStatus.current[index] = 'pending'

              // Send init message to the worker
              newWorker.postMessage({
                type: 'INIT_WORKER',
                payload: {
                  workerIndex: index,
                  shouldLoadModel:
                    workerType === 'Segmentation' && index === 0 && workers.length === 1,
                },
              })
            }
          }, 2000)
        }

        // Ensure job assignment slot exists.
        if (!workerJobAssignments.current.has(index)) {
          workerJobAssignments.current.set(index, null)
        }

        // Send initialization message to the new worker after a short delay.
        setTimeout(() => {
          try {
            console.log(`[MainThread-WorkerCtrl] Sending INIT_WORKER message to worker ${index}`)
            newWorker.postMessage({
              type: 'INIT_WORKER',
              payload: {
                workerIndex: index,
                shouldLoadModel:
                  workerType === 'Segmentation' && index === 0 && workers.length === 1,
              },
            })
          } catch (error) {
            console.error(
              `[MainThread-WorkerCtrl] Error sending init message to worker ${index}:`,
              error,
            )
          }
        }, 50)
      } catch (error) {
        console.error(`[MainThread-WorkerCtrl] Error retrying worker ${index}:`, error)
      }
    }

    // Initialize or update worker tracking arrays. These are sized to maxWorkers to accommodate future scaling if needed.
    const newWorkers = [...workers]

    // Update the workerRefs with new workers
    workerRefs.current = newWorkers

    // Update initialization status array, extending if necessary.
    if (workerInitializationStatus.current.length < maxWorkers) {
      // If the array is smaller than maxWorkers, extend it
      workerInitializationStatus.current = [
        ...workerInitializationStatus.current,
        ...new Array(maxWorkers - workerInitializationStatus.current.length).fill('pending'),
      ]
    }

    // Update worker ready status array, extending if necessary.
    if (workerReadyStatus.current.length < maxWorkers) {
      workerReadyStatus.current = [
        ...workerReadyStatus.current,
        ...new Array(maxWorkers - workerReadyStatus.current.length).fill(false),
      ]
    }

    // Mark new workers as 'pending' for initialization and 'false' for ready status.
    newWorkers.forEach((_, index) => {
      workerInitializationStatus.current[index] = 'pending'
      workerReadyStatus.current[index] = false // Start as not ready
    })

    // Setup message and error handlers for each worker.
    newWorkers.forEach((worker, index) => {
      // Use our custom message handler that captures MODEL_LOADING_PROGRESS messages
      worker.onmessage = (event) => handleMessage(event, index)
      worker.onerror = (event) => {
        if (workerInitializationStatus.current[index] !== 'failed') {
          workerInitializationStatus.current[index] = 'failed'
        }
        workerReadyStatus.current[index] = false // Mark as not ready on error
        onError(event, index)

        // After a delay, attempt to re-initialize this worker.
        setTimeout(() => {
          if (workerInitializationStatus.current[index] === 'failed') {
            retryInitialization(index)
          }
        }, 1000)
      }

      // Initialize job assignments for new workers
      if (!workerJobAssignments.current.has(index)) {
        workerJobAssignments.current.set(index, null)
      }

      // Initialize worker with its index and whether it should load the model
      // For segmentation workers, only the first worker (index 0) should load the model
      // in the initializing_first phase. Other workers will load on demand later.
      const shouldLoadModel =
        workerType === 'Segmentation' && index === 0 && newWorkers.length === 1

      // Add a small delay to ensure the worker has fully initialized before sending the first message
      // This can help prevent "message sent too early" issues.
      setTimeout(() => {
        try {
          console.log(`[MainThread-WorkerCtrl] Sending INIT_WORKER message to worker ${index}`)
          worker.postMessage({
            type: 'INIT_WORKER',
            payload: {
              workerIndex: index,
              shouldLoadModel: shouldLoadModel,
            },
          })

          // Add a verification check: if the worker hasn't confirmed readiness shortly after init, resend.
          setTimeout(() => {
            if (!workerReadyStatus.current[index]) {
              console.log(
                `[MainThread-WorkerCtrl] ${workerType} Worker ${index} hasn't confirmed ready, resending init`,
              )
              worker.postMessage({
                type: 'INIT_WORKER',
                payload: {
                  workerIndex: index,
                  shouldLoadModel: shouldLoadModel,
                },
              })

              // If still not ready after resend and a further delay, attempt a full retry with a new worker instance.
              setTimeout(() => {
                if (
                  !workerReadyStatus.current[index] &&
                  workerInitializationStatus.current[index] !== 'success'
                ) {
                  console.log(
                    `[MainThread-WorkerCtrl] ${workerType} Worker ${index} still not ready after second attempt, retrying with new worker`,
                  )
                  retryInitialization(index)
                }
              }, 3000)
            }
          }, 1000) // Check after 1 second
        } catch (error) {
          console.error(
            `[MainThread-WorkerCtrl] ${workerType} Error sending init message to worker ${index}:`,
            error,
          )
        }
      }, 50)

      console.log(
        `[MainThread-WorkerCtrl] ${workerType} Worker ${index} initialized. ShouldLoadModel: ${shouldLoadModel}`,
      )
    })

    // Cleanup function for this effect.
    // This runs if `workers` prop array instance changes or component unmounts.
    return () => {
      console.log(
        `[MainThread-WorkerCtrl] Cleanup in main useEffect for ${workerType}. Current workerRefs:`,
        workerRefs.current.length,
      )
      // The actual termination of workers should be handled by the parent hook that *owns* the worker instances.
      // This hook (useWorkerController) primarily manages listeners and job assignments for the workers it receives.

      // Explicitly remove listeners from the old workers before workerRefs.current is updated by the effect's body.
      workerRefs.current.forEach((oldWorker, idx) => {
        if (oldWorker) {
          // This ensures that messages from detached workers do not trigger handlers.
          console.log(
            `[MainThread-WorkerCtrl] Removing listeners from old ${workerType} worker ${idx}`,
          )
          oldWorker.onmessage = null
          oldWorker.onerror = null
        }
      })
    }
  }, [workers, maxWorkers, handleMessage, onError, workerType])

  /**
   * Processes the next available job from the queue.
   * This function iterates through the available worker slots. For each slot,
   * it checks if the corresponding worker is initialized successfully and is currently idle.
   * If an idle worker is found and there are jobs in the `jobQueueRef`, it dequeues a job ID.
   * It then attempts to find the actual job object in `imageListRef` using this ID.
   * If the job is found and `isJobEligibleForProcessing` returns true, the job is assigned
   * to the worker, and `processJobFn` is called to start processing.
   * Warnings are logged if a job is skipped due to its status or if a job ID from
   * the queue doesn't correspond to any job in `imageListRef`.
   */
  const processNextJob = useCallback(() => {
    console.log(
      `[MainThread-WorkerCtrl] processNextJob called. Batch active: ${isBatchActiveRef.current}, Queue length: ${jobQueueRef.current.length}`,
    )

    if (!isBatchActiveRef.current || jobQueueRef.current.length === 0) {
      console.log(`[MainThread-WorkerCtrl] Skipping processing: batch inactive or empty queue`)
      return // Only process if batch is active and queue is not empty.
    }

    const workerStatusStr = workerInitializationStatus.current
      .map(
        (status, idx) =>
          `Worker ${idx}: ${status}${workerReadyStatus.current[idx] ? ' (Ready)' : ' (Not Ready)'}`,
      )
      .join(', ')

    console.log(
      `[MainThread-WorkerCtrl] Checking ${maxWorkers} workers for assignment. Worker statuses: [${workerStatusStr}]`,
    )

    console.log(
      `[MainThread-WorkerCtrl] ${workerType} Worker refs count: ${workerRefs.current.length}, Initialized: ${workerRefs.current.length > 0}`,
    )

    // Ensure we only iterate up to the actual number of currently instantiated workers.
    const effectiveMaxWorkers = Math.min(maxWorkers, workerRefs.current.length)

    for (let i = 0; i < effectiveMaxWorkers; i++) {
      // Verify the worker instance exists at this index.
      if (!workerRefs.current[i]) {
        console.warn(`[MainThread-WorkerCtrl] ${workerType} Worker at index ${i} does not exist`)
        continue
      }

      // Check if worker is initialized successfully, reported as ready, and currently idle.
      if (
        workerInitializationStatus.current[i] === 'success' &&
        workerReadyStatus.current[i] === true &&
        workerJobAssignments.current.get(i) === null
      ) {
        console.log(
          `[MainThread-WorkerCtrl] ${workerType} Worker ${i} is initialized, ready, and idle`,
        )

        if (jobQueueRef.current.length > 0) {
          const nextJobId = jobQueueRef.current.shift()
          if (!nextJobId) {
            console.log(
              `[MainThread-WorkerCtrl] Unexpectedly got null job ID from queue despite length > 0`,
            )
            continue // Should ideally not happen if queue length > 0.
          }

          console.log(
            `[MainThread-WorkerCtrl] ${workerType} Processing job ${nextJobId} with worker ${i}`,
          )
          const jobToProcess = imageListRef.current.find((job) => job.id === nextJobId)

          // Ensure the job exists and is eligible for processing.
          if (jobToProcess && isJobEligibleForProcessing(jobToProcess)) {
            console.log(
              `[MainThread-WorkerCtrl] Found eligible job ${nextJobId} (${jobToProcess.status}) for worker ${i}`,
            )
            try {
              // Mark the job as assigned to this worker
              workerJobAssignments.current.set(i, nextJobId)
              // Try to process the job
              processJobFn(jobToProcess, i)
              console.log(
                `[MainThread-WorkerCtrl] ${workerType} Job ${nextJobId} successfully assigned to worker ${i}`,
              )
            } catch (error) {
              console.error(
                `[MainThread-WorkerCtrl] Error assigning job ${nextJobId} to worker ${i}:`,
                error,
              )
              // Return the job to the front of the queue for a later retry.
              if (!jobQueueRef.current.includes(nextJobId)) {
                jobQueueRef.current.unshift(nextJobId)
              }
              // Clear the assignment since processing failed to start.
              workerJobAssignments.current.set(i, null)
            }
          } else if (jobToProcess) {
            // Job exists but is not in a processable state (e.g., already completed, errored out).
            console.warn(
              `[MainThread-WorkerCtrl] Job ${nextJobId} in queue skipped for worker ${i}. Status: ${jobToProcess.status}`,
            )
            // If more jobs are in the queue, try assigning another job to this worker slot immediately.
            if (jobQueueRef.current.length > 0) i--
          } else {
            console.warn(
              `[MainThread-WorkerCtrl] Job ${nextJobId} from queue not found in imageList.`,
            )
          }
        } else {
          break // No more jobs in the queue
        }
      }
    }
  }, [
    isBatchActiveRef,
    jobQueueRef,
    imageListRef,
    maxWorkers,
    isJobEligibleForProcessing,
    processJobFn,
    workerType,
  ])

  /**
   * Terminate all workers and clean up resources
   */
  const cleanupWorkers = useCallback(() => {
    console.log(`[MainThread-WorkerCtrl] Cleaning up workers`)
    workerRefs.current.forEach((worker, index) => {
      if (worker) {
        worker.terminate()
        console.log(`[MainThread-WorkerCtrl] Worker ${index} terminated`)
      }
    })
    workerRefs.current = []
    workerJobAssignments.current.clear()
    jobQueueRef.current = []
    workerInitializationStatus.current = []
    workerReadyStatus.current = []
    // workerInitialized.current = false;
  }, [jobQueueRef])

  return {
    workerRefs,
    workerJobAssignments,
    workerInitializationStatus,
    workerReadyStatus,
    processNextJob,
    cleanupWorkers,
    modelLoadingProgress: {
      progress: modelLoadingProgressData,
      status: modelLoadingStatus,
    },
  }
}
