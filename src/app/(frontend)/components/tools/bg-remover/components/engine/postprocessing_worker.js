/**
 * Post-processing Web Worker for Image Background Removal.
 *
 * This worker is responsible for taking an original image and a segmentation mask
 * (which indicates the foreground) and producing a new image with the background removed
 * (i.e., made transparent) or replaced with a specified color or image.
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
 *   - `backgroundColor`: Optional hex color string (e.g., '#FFFFFF') to replace the background with.
 *     If null or undefined, the background will be made transparent.
 *   - `backgroundColorAlpha`: Optional alpha value for the background color.
 *   - `backgroundImageUrl`: Optional image URL to use as background. Takes precedence over backgroundColor.
 *   - `backgroundImageAlpha`: Optional alpha value for the background image.
 *
 * Output Message ('PROCESSING_RESULT'):
 *   - Sent back to the main thread upon completion or error.
 *   - Success Payload: `{ transparentImageDataUrl: string, jobId: string }`
 *     - `transparentImageDataUrl`: A PNG Data URL of the image with background removed or replaced.
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
 *        the corresponding pixel in the original image is either made transparent (alpha = 0),
 *        replaced with the specified background color, or replaced with pixels from the background image.
 *     d. The modified image is converted to a PNG Blob, then to a Data URL.
 *  4. Sends the resulting Data URL (or an error message) back to the main thread.
 */
let workerIndex = -1

// Helper function to convert hex color to RGB values
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null

  // Remove # if present
  hex = hex.replace('#', '')

  // Handle 3-digit hex codes
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  if (hex.length !== 6) return null

  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  return { r, g, b }
}

// Helper function to apply a segmentation mask to an image, making the background transparent, colored, or replaced with an image.
async function applyMaskToImage(
  maskDataUrl,
  originalBlobUrl,
  backgroundColor = null,
  backgroundColorAlpha = 1.0,
  backgroundImageUrl = null,
  backgroundImageAlpha = 1.0,
) {
  try {
    // Prioritize transparency. If the user wants a transparent background, nothing else matters.
    // Case 1: A background image is provided but is fully transparent (alpha is 0).
    // Case 2: Transparent preset is selected (no background color AND no background image).
    // Case 3: A background color is provided, but it's fully transparent (alpha is 0).
    const isBackgroundImageTransparent = backgroundImageUrl && backgroundImageAlpha === 0
    const isBackgroundColorTransparent = backgroundColor && backgroundColorAlpha === 0
    const isTransparentPreset = !backgroundColor && !backgroundImageUrl

    if (isBackgroundImageTransparent || isTransparentPreset || isBackgroundColorTransparent) {
      backgroundColor = null
      backgroundImageUrl = null
      backgroundImageAlpha = 0
      backgroundColorAlpha = 0
    }

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

    // Load background image only if provided and not fully transparent
    let backgroundImageBitmap = null
    if (backgroundImageUrl && backgroundImageAlpha > 0) {
      try {
        const backgroundResponse = await fetch(backgroundImageUrl)
        if (backgroundResponse.ok) {
          const backgroundBlob = await backgroundResponse.blob()
          backgroundImageBitmap = await createImageBitmap(backgroundBlob)
        }
      } catch (error) {
        console.warn(
          `[PostprocessingWorker-${workerIndex}] Failed to load background image:`,
          error,
        )
        // Continue without background image, will fall back to color or transparency
      }
    }

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

    // Prepare background image data if available
    let backgroundPixelData = null
    if (backgroundImageBitmap) {
      const backgroundCanvas = new OffscreenCanvas(canvas.width, canvas.height)
      const backgroundCtx = backgroundCanvas.getContext('2d')
      backgroundCtx.drawImage(backgroundImageBitmap, 0, 0, canvas.width, canvas.height)
      backgroundPixelData = backgroundCtx.getImageData(0, 0, canvas.width, canvas.height).data
    }

    // Parse background color if provided and no background image
    const bgColor = !backgroundImageBitmap && backgroundColor ? hexToRgb(backgroundColor) : null

    // Clamp alpha values between 0 and 1
    const bgImageAlphaClamped = Math.max(0, Math.min(1, backgroundImageAlpha))
    const bgColorAlphaClamped = Math.max(0, Math.min(1, backgroundColorAlpha))

    // Iterate through each pixel. If the corresponding mask pixel is dark (e.g., part of the background),
    // either set the original image pixel's alpha to 0 (transparent), replace with background color, or replace with background image.
    for (let i = 0; i < data.length; i += 4) {
      const maskValue = maskPixelData[i] // Using R channel of mask (grayscale, so R=G=B)
      if (maskValue < 128) {
        // Threshold: values below 128 are considered background.
        if (backgroundPixelData) {
          // Replace background with background image pixels
          // First remove original background completely, then apply background image with alpha
          const bgR = backgroundPixelData[i]
          const bgG = backgroundPixelData[i + 1]
          const bgB = backgroundPixelData[i + 2]

          // Apply background image with alpha transparency
          // Alpha controls how opaque the background image is (0 = transparent, 1 = opaque)
          data[i] = bgR // Red
          data[i + 1] = bgG // Green
          data[i + 2] = bgB // Blue
          data[i + 3] = Math.round(255 * bgImageAlphaClamped) // Alpha based on background image alpha
        } else if (bgColor) {
          // Replace background with specified color, applying backgroundColorAlpha
          data[i] = bgColor.r // Red
          data[i + 1] = bgColor.g // Green
          data[i + 2] = bgColor.b // Blue
          data[i + 3] = bgColorAlphaClamped * 255 // Apply color alpha
        } else {
          // Make background transparent
          data[i + 3] = 0 // Set alpha channel to 0 for transparency.
        }
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
    const {
      segmentationResult,
      originalBlobUrl,
      jobId,
      backgroundColor,
      backgroundColorAlpha,
      backgroundImageUrl,
      backgroundImageAlpha,
    } = payload

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
      backgroundColor ? `Background color: ${backgroundColor}` : 'Transparent background',
      backgroundColorAlpha !== undefined
        ? `Color alpha: ${backgroundColorAlpha}`
        : 'Default color alpha',
      backgroundImageUrl ? `Background image: ${backgroundImageUrl}` : 'No background image',
      backgroundImageAlpha !== undefined
        ? `Image alpha: ${backgroundImageAlpha}`
        : 'Default image alpha',
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

      const resultImageDataUrl = await applyMaskToImage(
        maskDataUrl,
        originalBlobUrl,
        backgroundColor,
        backgroundColorAlpha,
        backgroundImageUrl,
        backgroundImageAlpha,
      )

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
