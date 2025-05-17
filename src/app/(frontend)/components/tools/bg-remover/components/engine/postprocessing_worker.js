/**
 * Post-processing Web Worker for Image Background Removal.
 *
 * This worker is responsible for taking an original image and a segmentation mask
 * (which indicates the foreground) and producing a new image with the background removed
 * (i.e., made transparent).
 *
 * Message Handling:
 *  - Listens for messages from the main thread.
 *  - Main operational message: 'PROCESS_IMAGE'.
 *  - Initialization message: 'INIT_WORKER' to set a worker-specific index for logging.
 *  - Test message: 'TEST_WORKER' to confirm worker responsiveness.
 *
 * 'PROCESS_IMAGE' Message Payload:
 *   - `jobId`: A unique identifier for the image processing task.
 *   - `originalBlobUrl`: URL of the original image (typically a preprocessed version).
 *   - `segmentationResult`: The output from the segmentation model. This can be:
 *     1. New Format (Object): `{ mask_base64: string }` - A base64 encoded PNG string of the mask.
 *     2. Legacy Format (Array): `[{ mask: { data: Uint8Array, width: number, height: number, channels?: number } }]`
 *        - `data`: Raw pixel data of the mask (can be grayscale or RGBA).
 *        - `width`, `height`: Dimensions of the mask.
 *        The worker handles converting this legacy format into a usable mask image.
 *
 * Output Message ('PROCESSING_RESULT'):
 *   - Sent back to the main thread upon completion or error.
 *   - Success Payload: `{ transparentImageDataUrl: string, jobId: string }`
 *     - `transparentImageDataUrl`: A PNG Data URL of the image with background removed.
 *   - Error Payload: `{ error: string, jobId: string }`
 *     - `error`: A message describing the error that occurred.
 *
 * Workflow for 'PROCESS_IMAGE':
 *  1. Receives the original image URL and the segmentation mask data.
 *  2. If the mask is in the legacy format, it's converted into an image.
 *  3. The `applyMaskToImage` function is called:
 *     a. Fetches and decodes the original image and the mask image.
 *     b. Creates an offscreen canvas and draws the original image.
 *     c. Iterates through the mask pixels: if a mask pixel indicates background (e.g., < 128 intensity),
 *        the corresponding pixel in the original image is made transparent by setting its alpha to 0.
 *     d. The modified image is converted to a PNG Blob, then to a Data URL.
 *  4. Sends the resulting Data URL (or an error message) back to the main thread.
 */
let workerIndex = -1

// Helper function to apply a segmentation mask to an image, making the background transparent.
async function applyMaskToImage(maskDataUrl, originalBlobUrl) {
  try {
    // Load the original image from its blob URL.
    const originalResponse = await fetch(originalBlobUrl)
    if (!originalResponse.ok) {
      throw new Error(`Failed to fetch original image: ${originalResponse.status}`)
    }
    const originalBlob = await originalResponse.blob()
    const originalImageBitmap = await createImageBitmap(originalBlob)

    // Load the mask image from its data URL.
    const maskResponse = await fetch(maskDataUrl)
    if (!maskResponse.ok) {
      throw new Error(`Failed to fetch mask image from data URL: ${maskResponse.status}`)
    }
    const maskBlob = await maskResponse.blob()
    const maskImageBitmap = await createImageBitmap(maskBlob)

    const canvas = new OffscreenCanvas(originalImageBitmap.width, originalImageBitmap.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(originalImageBitmap, 0, 0)

    // Get the pixel data of the drawn original image.
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // To apply the mask, draw the mask onto a temporary canvas and get its pixel data.
    // This ensures the mask is scaled to the original image dimensions.
    const maskCanvas = new OffscreenCanvas(canvas.width, canvas.height)
    const maskCtx = maskCanvas.getContext('2d')
    maskCtx.drawImage(maskImageBitmap, 0, 0, canvas.width, canvas.height)
    const maskPixelData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data

    // Iterate through each pixel. If the corresponding mask pixel is dark (e.g., part of the background),
    // set the original image pixel's alpha to 0 (transparent).
    for (let i = 0; i < data.length; i += 4) {
      const maskValue = maskPixelData[i] // Using R channel of mask (grayscale, so R=G=B)
      if (maskValue < 128) {
        // Threshold: values below 128 are considered background.
        data[i + 3] = 0 // Set alpha channel to 0 for transparency.
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Convert the processed canvas content to a PNG Blob.
    const resultBlob = await canvas.convertToBlob({
      type: 'image/png',
      quality: 1.0, // Max quality for PNG.
    })

    // Convert the Blob to a Data URL.
    const resultDataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(resultBlob)
    })

    return resultDataUrl
  } catch (error) {
    console.error(`[PostprocessingWorker-${workerIndex}] Error applying mask:`, error)
    throw error
  }
}

// Listen for messages from the main thread
self.onmessage = async (event) => {
  const { type, payload } = event.data

  if (type === 'INIT_WORKER') {
    // Initialize worker with an index for logging purposes.
    workerIndex = payload?.workerIndex ?? -1
    console.log(
      `[PostprocessingWorker-${workerIndex}] Worker initialized with index: ${workerIndex}`,
    )
    self.postMessage({ type: 'WORKER_READY', payload: { workerIndex } })
  } else if (type === 'TEST_WORKER') {
    // Respond to a test message to confirm the worker is alive and responsive.
    self.postMessage({ type: 'WORKER_READY', payload: { workerIndex } })
  } else if (type === 'PROCESS_IMAGE') {
    const { segmentationResult, originalBlobUrl, jobId } = payload

    if (!jobId || !originalBlobUrl) {
      console.error(
        `[PostprocessingWorker-${workerIndex}] Missing jobId or originalBlobUrl:`,
        payload,
      )
      self.postMessage({
        type: 'PROCESSING_RESULT',
        payload: {
          error: 'Missing jobId or originalBlobUrl for mask application',
          jobId: payload?.jobId,
        },
      })
      return
    }

    if (!segmentationResult) {
      console.error(
        `[PostprocessingWorker-${workerIndex}] Missing segmentationResult for job ${jobId}`,
      )
      self.postMessage({
        type: 'PROCESSING_RESULT',
        payload: {
          error: 'Missing segmentation result for mask application',
          jobId,
        },
      })
      return
    }

    console.log(
      `[PostprocessingWorker-${workerIndex}] Segmentation result structure for job ${jobId}:`,
      Object.keys(segmentationResult),
      segmentationResult.mask_base64 ? 'Has mask_base64' : 'No mask_base64',
      Array.isArray(segmentationResult) ? 'Is array' : 'Not array',
    )

    try {
      console.log(
        `[PostprocessingWorker-${workerIndex}] Starting post-processing for job: ${jobId}`,
      )

      let maskDataUrl

      // Determine mask format and extract/convert mask data to a Data URL.
      if (segmentationResult?.mask_base64) {
        // New format: mask is a base64 encoded PNG.
        maskDataUrl = `data:image/png;base64,${segmentationResult.mask_base64}`
      } else if (Array.isArray(segmentationResult) && segmentationResult[0]?.mask?.data) {
        // Legacy format: mask data needs conversion to an image.
        const { mask } = segmentationResult[0]
        const canvas = new OffscreenCanvas(mask.width, mask.height)
        const ctx = canvas.getContext('2d')

        const numPixels = mask.width * mask.height
        const imageDataArray = new Uint8ClampedArray(numPixels * 4)

        // Convert mask data (potentially grayscale) to RGBA for ImageData.
        if (mask.data.length === numPixels * 4) {
          // Data is already RGBA.
          imageDataArray.set(mask.data)
        } else if (mask.data.length === numPixels) {
          // Data is grayscale; convert to RGBA (R=G=B=value, A=255).
          for (let i = 0; i < numPixels; i++) {
            const maskValue = mask.data[i]
            imageDataArray[i * 4 + 0] = maskValue // R
            imageDataArray[i * 4 + 1] = maskValue // G
            imageDataArray[i * 4 + 2] = maskValue // B
            imageDataArray[i * 4 + 3] = 255 // A (opaque)
          }
        } else {
          console.error(
            `[PostprocessingWorker-${workerIndex}] Unexpected mask data length for job ${jobId}. Expected ${numPixels} (grayscale) or ${numPixels * 4} (RGBA), but got ${mask.data.length}. Mask dimensions: ${mask.width}x${mask.height}.`,
            mask,
          )
          throw new Error(
            `Unexpected mask data length. Expected ${numPixels} or ${numPixels * 4}, got ${mask.data.length}.`,
          )
        }

        const imageData = new ImageData(imageDataArray, mask.width, mask.height)
        ctx.putImageData(imageData, 0, 0)

        // Convert the canvas with the mask to a PNG Data URL.
        const blob = await canvas.convertToBlob({ type: 'image/png' })
        maskDataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
      } else {
        throw new Error('Mask data is missing or in an invalid format')
      }

      if (!maskDataUrl) {
        throw new Error('Mask data is missing or invalid')
      }

      const resultImageDataUrl = await applyMaskToImage(maskDataUrl, originalBlobUrl)

      console.log(
        `[PostprocessingWorker-${workerIndex}] Post-processing complete for job: ${jobId}`,
      )

      self.postMessage({
        type: 'PROCESSING_RESULT',
        payload: {
          transparentImageDataUrl: resultImageDataUrl,
          jobId,
        },
      })
    } catch (error) {
      console.error(
        `[PostprocessingWorker-${workerIndex}] Error during post-processing for job: ${jobId}`,
        error,
      )

      self.postMessage({
        type: 'PROCESSING_RESULT',
        payload: {
          error: `Post-processing error: ${error.message}`,
          jobId: jobId,
        },
      })
    }
  } else {
    console.warn(`[PostprocessingWorker-${workerIndex}] Unknown message type: ${type}`, payload)
  }
}

export {} // Add a dummy export to satisfy ESM detection
