// src/app/(frontend)/components/tools/bg-remover/components/engine/segmentation_worker.js
/**
 * @file segmentation_worker.js
 * This web worker handles background image segmentation using the Hugging Face Transformers.js library.
 * It operates off-thread to prevent UI freezes during model loading and processing.
 *
 * Main Responsibilities:
 *  - Initialize and load the 'briaai/RMBG-1.4' image segmentation model.
 *  - Process images sent from the main thread to remove their backgrounds.
 *  - Communicate status updates (model loading, processing progress, errors) back to the main thread.
 *
 * Communication with Main Thread:
 *   Receives messages of type:
 *     - 'INIT_WORKER': Initializes the worker with an index and optionally pre-loads the model.
 *     - 'LOAD_MODEL': Explicitly requests the worker to load the segmentation model.
 *     - 'PROCESS_IMAGE': Requests the worker to segment an image provided as a data URL.
 *     - 'TEST_WORKER': A simple message to check if the worker is responsive.
 *
 *   Posts messages of type:
 *     - 'WORKER_READY': Confirms the worker has initialized (and after a 'TEST_WORKER' message).
 *     - 'MODEL_LOADING_STATUS': Indicates the start, success, or failure of model loading.
 *     - 'MODEL_LOADING_PROGRESS': Provides progress updates during model download/setup.
 *     - 'MODEL_LOAD_ATTEMPTED': Confirms an attempt to load the model was made (after 'LOAD_MODEL').
 *     - 'PROCESSING_RESULT': Sends back the segmentation result (mask) or an error.
 *
 * Each worker instance is assigned a 'workerIndex' for easier logging and debugging in scenarios
 * where multiple workers might be instantiated.
 */
import { pipeline, env } from '@huggingface/transformers'

// Optional: Increase log level for transformers.js for more detailed insights
// env.logLevel = 'info';

let segmenter = null
let modelLoadingPromise = null
let workerIndex = -1 // Store the worker index for better logging

// Function to initialize the model, ensuring it's only attempted once concurrently per worker
async function initializeModel() {
  // If model is already loaded, return it
  if (segmenter) {
    console.log(
      `[SegmentationWorker-${workerIndex}] Model (briaai/RMBG-1.4) already loaded. Reusing instance.`,
    )
    return segmenter
  }
  // If model is currently loading, return the existing promise
  if (modelLoadingPromise) {
    console.log(
      `[SegmentationWorker-${workerIndex}] Model (briaai/RMBG-1.4) is currently loading. Waiting for existing promise.`,
    )
    return modelLoadingPromise
  }

  // Start loading the model
  console.log(
    `[SegmentationWorker-${workerIndex}] Initiating loading sequence for model: briaai/RMBG-1.4`,
  )
  modelLoadingPromise = (async () => {
    try {
      self.postMessage({ type: 'MODEL_LOADING_STATUS', payload: { loading: true, error: null } })
      console.log(
        `[SegmentationWorker-${workerIndex}] Attempting to load model: briaai/RMBG-1.4. Transformers.js will use browser cache if available.`,
      )

      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.proxy = false // Recommended for stability and performance in web workers
        console.log(
          `[SegmentationWorker-${workerIndex}] ONNX WASM proxy disabled for briaai/RMBG-1.4.`,
        )
      }

      const newSegmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
        dtype: 'fp32',
        progress_callback: (() => {
          let lastSentTime = 0
          const throttleInterval = 500 // 500 ms

          return (progress) => {
            const now = Date.now()
            const isFinalUpdate =
              progress.status === 'ready' ||
              (typeof progress.progress === 'number' && progress.progress >= 100)

            if (isFinalUpdate || now - lastSentTime > throttleInterval) {
              if (lastSentTime === 0) {
                // First progress update for this load attempt
                console.log(
                  `[SegmentationWorker-${workerIndex}] Model loading progress callback initiated. First update:`,
                  progress,
                )
              }
              self.postMessage({
                type: 'MODEL_LOADING_PROGRESS',
                payload: progress,
              })
              lastSentTime = now
            }
          }
        })(),
      })
      segmenter = newSegmenter
      self.postMessage({
        type: 'MODEL_LOADING_STATUS',
        payload: { loading: false, loaded: true, error: null },
      })
      console.log(
        `[SegmentationWorker-${workerIndex}] Segmentation model (briaai/RMBG-1.4) loaded successfully.`,
      )
      return segmenter
    } catch (error) {
      console.error(
        `[SegmentationWorker-${workerIndex}] Error loading model (briaai/RMBG-1.4):`,
        error,
      )
      self.postMessage({
        type: 'MODEL_LOADING_STATUS',
        payload: { loading: false, loaded: false, error: error.message },
      })
      segmenter = null
      throw error
    } finally {
      modelLoadingPromise = null
    }
  })()
  return modelLoadingPromise
}

self.onmessage = async (event) => {
  const { type, payload } = event.data

  if (type === 'INIT_WORKER') {
    workerIndex = payload.workerIndex
    console.log(
      `[SegmentationWorker-${workerIndex}] Worker initialized with index: ${workerIndex}.`,
    )
    self.postMessage({ type: 'WORKER_READY', payload: { workerIndex } })
    console.log(`[SegmentationWorker-${workerIndex}] WORKER_READY message sent.`)

    if (payload.shouldLoadModel) {
      console.log(`[SegmentationWorker-${workerIndex}] Received instruction to pre-load model.`)
      initializeModel().catch(() => {
        // Error is already logged and messaged by initializeModel
        console.error(
          `[SegmentationWorker-${workerIndex}] Model pre-load failed for briaai/RMBG-1.4.`,
        )
      })
    } else {
      console.log(
        `[SegmentationWorker-${workerIndex}] Not pre-loading model, awaiting further instructions.`,
      )
    }
  } else if (type === 'TEST_WORKER') {
    console.log(`[SegmentationWorker-${workerIndex}] Received TEST_WORKER message. Responding.`)
    self.postMessage({ type: 'WORKER_READY', payload: { workerIndex } })
  } else if (type === 'LOAD_MODEL') {
    console.log(
      `[SegmentationWorker-${workerIndex}] Received explicit request (LOAD_MODEL) to load model.`,
    )
    try {
      await initializeModel()
      // initializeModel already posts MODEL_LOADING_STATUS
      console.log(
        `[SegmentationWorker-${workerIndex}] Model load attempt finished. Posting MODEL_LOAD_ATTEMPTED.`,
      )
      self.postMessage({
        type: 'MODEL_LOAD_ATTEMPTED',
        payload: { workerIndex, loaded: !!segmenter },
      })
    } catch (err) {
      console.error(
        `[SegmentationWorker-${workerIndex}] Explicit model load (LOAD_MODEL) failed for briaai/RMBG-1.4. Error: ${err.message}`,
      )
      // Error already logged by initializeModel, message MODEL_LOAD_ATTEMPTED about failure
      self.postMessage({
        type: 'MODEL_LOAD_ATTEMPTED',
        payload: { workerIndex, error: err.message, loaded: false },
      })
    }
  } else if (type === 'PROCESS_IMAGE') {
    if (!payload || !payload.imageDataUrl || !payload.originalBlobUrl || !payload.jobId) {
      const errorMsg = `[SegmentationWorker-${workerIndex}] Insufficient data for PROCESS_IMAGE. Missing: ${!payload.imageDataUrl ? 'imageDataUrl ' : ''}${!payload.originalBlobUrl ? 'originalBlobUrl ' : ''}${!payload.jobId ? 'jobId' : ''}`
      console.error(errorMsg)
      self.postMessage({
        type: 'PROCESSING_RESULT',
        payload: {
          error: 'Insufficient data received by worker.',
          originalBlobUrl: payload?.originalBlobUrl,
          jobId: payload?.jobId,
        },
      })
      return
    }

    const { imageDataUrl, originalBlobUrl, jobId } = payload
    console.log(`[SegmentationWorker-${workerIndex}] Received PROCESS_IMAGE for Job ID: ${jobId}.`)

    try {
      const currentSegmenter = await initializeModel()
      if (!currentSegmenter) {
        const modelErrorMsg = `[SegmentationWorker-${workerIndex}] Model not available for processing Job ID: ${jobId}. Initialization may have failed.`
        console.error(modelErrorMsg)
        self.postMessage({
          type: 'PROCESSING_RESULT',
          payload: { error: 'Model not available in worker.', originalBlobUrl, jobId },
        })
        return
      }

      console.log(
        `[SegmentationWorker-${workerIndex}] Starting image segmentation for Job ID: ${jobId} using model briaai/RMBG-1.4.`,
      )

      const result = await currentSegmenter(imageDataUrl, {
        return_mask: true,
      })

      console.log(
        `[SegmentationWorker-${workerIndex}] Segmentation complete for Job ID: ${jobId}. Preparing to send result.`,
      )
      self.postMessage({ type: 'PROCESSING_RESULT', payload: { result, originalBlobUrl, jobId } })
      console.log(`[SegmentationWorker-${workerIndex}] Result sent for Job ID: ${jobId}.`)
    } catch (error) {
      console.error(
        `[SegmentationWorker-${workerIndex}] Error processing image for Job ID: ${jobId} with briaai/RMBG-1.4:`,
        error,
      )
      self.postMessage({
        type: 'PROCESSING_RESULT',
        payload: {
          error: `Worker error during segmentation (Job ${jobId}): ${error.message}`,
          originalBlobUrl,
          jobId,
        },
      })
    }
  } else {
    console.warn(
      `[SegmentationWorker-${workerIndex}] Received unknown message type: '${type}' with payload:`,
      payload,
    )
  }
}
