/**
 * Web Worker for Image Preprocessing.
 *
 * This worker script handles image preprocessing tasks off the main thread to prevent UI freezes.
 * It listens for messages from the main thread, processes images, and sends results back.
 *
 * Supported Message Types:
 *  - 'INIT_WORKER': Initializes the worker with a unique index. Responds with 'WORKER_READY'.
 *  - 'TEST_WORKER': A simple test message to check worker responsiveness. Responds with 'WORKER_READY'.
 *  - 'PREPROCESS_IMAGE': The core message type for image processing.
 *    - Expects a payload containing `jobId` and one of `imageBlob`, `imageDataUrl`, or `originalBlobUrl`.
 *    - Processes the image by:
 *      1. Creating an `ImageBitmap` from the provided image source.
 *      2. Drawing the `ImageBitmap` onto an `OffscreenCanvas`.
 *      3. Converting the `OffscreenCanvas` content to a PNG Blob.
 *      4. Reading the Blob as a Data URL.
 *    - Responds with 'PREPROCESSING_RESULT' containing either `preprocessedImageUrl` and `jobId` on success,
 *      or an `error` message and `jobId` on failure.
 *
 * The worker also posts 'WORKER_STARTUP_COMPLETE' when it's initialized and ready to receive messages.
 * Error handling is implemented throughout the process, and any caught errors during message handling
 * or image processing will result in an error message being posted back to the main thread.
 *
 * @param {MessageEvent} event - The message event received by the worker.
 * @param {object} event.data - The data payload from the main thread.
 * @param {string} event.data.type - The type of message (e.g., 'INIT_WORKER', 'PREPROCESS_IMAGE').
 * @param {object} event.data.payload - The payload specific to the message type.
 */

// Log when the worker script is initially parsed and executed
console.log('[PreprocessingWorker] Script loaded and initialized.')

// Keep track of worker ID, primarily for logging purposes
let workerIndex = -1

// Add event listener immediately to ensure no messages are missed
self.addEventListener('message', handleMessage)

// Send a ready message on startup
self.postMessage({ type: 'WORKER_STARTUP_COMPLETE' })

/**
 * Main message handler for the worker. Routes messages to appropriate handlers.
 * @param {MessageEvent} event - The incoming message event.
 */
function handleMessage(event) {
  try {
    const { type, payload } = event.data || {}
    // Log every message received for debugging, including worker index if available
    console.log(
      `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Received message: type='${type}', jobId='${payload?.jobId || 'N/A'}'`,
    )

    if (type === 'INIT_WORKER') {
      workerIndex = payload?.workerIndex ?? -1 // Use -1 or a default if not provided
      console.log(
        `[PreprocessingWorker-${workerIndex}] Worker instance initialized with index: ${workerIndex}`,
      )
      self.postMessage({ type: 'WORKER_READY', payload: { workerIndex } })
      // Confirm that initialization specific to INIT_WORKER is complete.
      // Note: WORKER_STARTUP_COMPLETE is sent when the script first loads. This could be an additional ready signal.
      // self.postMessage({ type: 'INIT_COMPLETE', payload: { workerIndex } }); // Example of a more specific ready signal
      return
    }

    if (type === 'TEST_WORKER') {
      console.log(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Responding to TEST_WORKER.`,
      )
      self.postMessage({ type: 'WORKER_READY', payload: { workerIndex } })
      return
    }

    if (type === 'PREPROCESS_IMAGE') {
      handlePreprocessImage(payload)
    } else if (type) {
      console.warn(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Received unknown message type: ${type}`,
      )
    }
  } catch (error) {
    console.error(
      `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Critical error in handleMessage:`,
      error,
    )
    // Attempt to notify main thread about the error, if jobId is available
    if (event.data?.payload?.jobId) {
      self.postMessage({
        type: 'PREPROCESSING_RESULT',
        payload: {
          error: `Error in worker message handler: ${error.message}`,
          jobId: event.data.payload.jobId,
        },
      })
    }
  }
}

/**
 * Handles 'PREPROCESS_IMAGE' messages. It takes image data (Blob, Data URL, or URL),
 * creates an ImageBitmap, draws it to an OffscreenCanvas,
 * converts the canvas to a PNG Data URL, and posts the result.
 * @param {object} payload - The message payload.
 * @param {string} payload.jobId - Unique identifier for the image processing job.
 * @param {Blob} [payload.imageBlob] - The image blob to process.
 * @param {string} [payload.imageDataUrl] - The image data URL to process.
 * @param {string} [payload.originalBlobUrl] - URL to fetch the image blob if not directly provided.
 */
async function handlePreprocessImage(payload) {
  // Initial log for starting the preprocessing task
  console.log(
    `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Starting PREPROCESS_IMAGE for job: ${payload?.jobId || 'Unknown Job ID'}`,
  )

  // Check for required data in the payload
  if (!payload || !payload.jobId) {
    self.postMessage({
      type: 'PREPROCESSING_RESULT',
      payload: {
        error: 'Insufficient data for preprocessing (jobId missing).',
        jobId: payload?.jobId,
      },
    })
    return
  }

  const { jobId, imageBlob, imageDataUrl, originalBlobUrl } = payload

  try {
    // Use either the directly provided imageBlob, imageDataUrl or fetch from originalBlobUrl
    let imageBitmap

    if (imageDataUrl) {
      console.log(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Creating ImageBitmap from Data URL for job ${jobId}.`,
      )
      try {
        // For data URLs, we need to create an Image and then convert to ImageBitmap
        imageBitmap = await createImageBitmapFromDataUrl(imageDataUrl)
        console.log(
          `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] ImageBitmap created from Data URL for job ${jobId}, dimensions: ${imageBitmap.width}x${imageBitmap.height}.`,
        )
      } catch (error) {
        console.error(
          `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Error creating ImageBitmap from Data URL for job ${jobId}:`,
          error,
        )
        throw new Error(`Failed to create ImageBitmap from data URL: ${error.message}`)
      }
    } else if (imageBlob) {
      console.log(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Creating ImageBitmap from Blob for job ${jobId}, size: ${imageBlob.size} bytes.`,
      )
      try {
        imageBitmap = await createImageBitmap(imageBlob)
        console.log(
          `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] ImageBitmap created from Blob for job ${jobId}, dimensions: ${imageBitmap.width}x${imageBitmap.height}.`,
        )
      } catch (error) {
        console.error(
          `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Error creating ImageBitmap from Blob for job ${jobId}:`,
          error,
        )
        throw new Error(`Failed to create ImageBitmap from blob: ${error.message}`)
      }
    } else if (originalBlobUrl) {
      console.log(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Fetching image from URL for job ${jobId}: ${originalBlobUrl}`,
      )
      try {
        const response = await fetch(originalBlobUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`)
        }
        const blob = await response.blob()
        console.log(
          `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Image fetched from URL for job ${jobId}, size: ${blob.size} bytes. Creating ImageBitmap.`,
        )
        imageBitmap = await createImageBitmap(blob)
        console.log(
          `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] ImageBitmap created from fetched URL for job ${jobId}, dimensions: ${imageBitmap.width}x${imageBitmap.height}.`,
        )
      } catch (error) {
        console.error(
          `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Error fetching or processing image from URL for job ${jobId}:`,
          error,
        )
        throw new Error(`Failed to fetch or process image from URL: ${error.message}`)
      }
    } else {
      throw new Error('No image data provided (no blob, data URL, or URL)')
    }

    // Now use the imageBitmap we created
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      // Clean up bitmap if context creation fails as it's unmanaged memory
      imageBitmap.close()
      throw new Error('Failed to get OffscreenCanvas context.')
    }

    ctx.drawImage(imageBitmap, 0, 0)
    // Clean up bitmap after drawing it to the canvas, as it's no longer needed
    imageBitmap.close()
    console.log(
      `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Image drawn to OffscreenCanvas for job ${jobId}.`,
    )

    try {
      // Convert the canvas content to a Blob, then to a Data URL
      const preprocessedImageBlob = await canvas.convertToBlob({ type: 'image/png' }) // Specify PNG for consistency
      console.log(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Canvas converted to PNG Blob for job ${jobId}, size: ${preprocessedImageBlob.size} bytes.`,
      )

      const reader = new FileReader()
      const preprocessedImageUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = (e) => {
          console.error(
            `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] FileReader error for job ${jobId}:`,
            e,
          )
          reject(
            new Error(
              `FileReader error: ${e.target?.error?.message || 'Unknown FileReader error'}`,
            ),
          )
        }
        reader.readAsDataURL(preprocessedImageBlob)
      })
      console.log(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Blob converted to Data URL for job ${jobId}. Length: ${preprocessedImageUrl.length}`,
      )

      // Log success before posting the message
      console.log(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Successfully preprocessed image for job ${jobId}. Posting result.`,
      )

      // Send the result without a transfer list to avoid issues
      self.postMessage({
        type: 'PREPROCESSING_RESULT',
        payload: {
          preprocessedImageUrl,
          jobId,
        },
      })
    } catch (error) {
      console.error(
        `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Error converting canvas to data URL:`,
        error,
      )
      throw new Error(`Failed to convert canvas to data URL: ${error.message}`)
    }
  } catch (error) {
    console.error(
      `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Error processing image for Job ID: ${jobId}:`,
      error,
    )
    self.postMessage({
      type: 'PREPROCESSING_RESULT',
      payload: { error: `Preprocessing Worker error (Job ${jobId}): ${error.message}`, jobId },
    })
  }
}

/**
 * Helper function to create an ImageBitmap from a data URL.
 * This involves fetching the data URL to convert it into a Blob,
 * then creating an ImageBitmap from that Blob.
 * @param {string} dataUrl - The data URL to convert.
 * @returns {Promise<ImageBitmap>} - A promise that resolves to the ImageBitmap.
 * @throws Will throw an error if fetching the data URL or creating the ImageBitmap fails.
 */
async function createImageBitmapFromDataUrl(dataUrl) {
  console.log(
    `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] createImageBitmapFromDataUrl: Fetching data URL.`,
  )
  try {
    // Create a blob from the data URL
    const response = await fetch(dataUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch data URL: ${response.status} ${response.statusText}`)
    }
    const blob = await response.blob()
    console.log(
      `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] createImageBitmapFromDataUrl: Data URL fetched as Blob (size: ${blob.size}, type: ${blob.type}). Creating ImageBitmap.`,
    )
    // Create an ImageBitmap from the blob
    const imageBitmap = await createImageBitmap(blob)
    console.log(
      `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] createImageBitmapFromDataUrl: ImageBitmap created (dimensions: ${imageBitmap.width}x${imageBitmap.height}).`,
    )
    return imageBitmap
  } catch (error) {
    console.error(
      `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Error in createImageBitmapFromDataUrl:`,
      error,
    )
    throw error // Re-throw to be caught by the caller
  }
}

// Log any unhandled promise rejections or other uncaught errors in the worker
self.addEventListener('error', (event) => {
  console.error(
    `[PreprocessingWorker${workerIndex !== -1 ? '-' + workerIndex : ''}] Uncaught error in worker:`,
    event.message,
    event.error,
  )
})

// Dummy export to satisfy ESM detection in some environments.
// This can be removed if the project's build process or environment doesn't require it.
export {}
