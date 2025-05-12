import { SupportedFormat } from '../../types'
import GIF from 'gif.js'

/**
 * Convert an image using Canvas API for common formats (PNG, JPG, GIF)
 * @param sourceBlob The source image blob
 * @param targetFormat The target format to convert to
 * @param quality The quality for lossy formats (0-100)
 * @returns A Promise resolving to a Blob of the converted image
 */
export const convertImageFormat = async (
  sourceBlob: Blob,
  targetFormat: SupportedFormat,
  quality: number = 90,
): Promise<Blob> => {
  // Normalize quality to 0-1 range for canvas
  const normalizedQuality = quality > 1 ? quality / 100 : quality

  try {
    // Create an image element and load the source blob
    const img = document.createElement('img')
    const sourceUrl = URL.createObjectURL(sourceBlob)

    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = sourceUrl
    })

    // Create a canvas to draw the image
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      URL.revokeObjectURL(sourceUrl)
      throw new Error('Could not get canvas context')
    }

    // Draw the image to the canvas
    ctx.drawImage(img, 0, 0)

    // Free memory
    URL.revokeObjectURL(sourceUrl)

    // If target format is GIF, use gif.js
    if (targetFormat === 'image/gif') {
      return createGif(canvas, img.width, img.height)
    }

    // Convert canvas to the target format blob
    const convertedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to convert image'))
        },
        targetFormat,
        normalizedQuality,
      )
    })

    return convertedBlob
  } catch (error) {
    console.error('Image conversion error:', error)
    throw new Error(
      `Failed to convert image: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Create a GIF from a canvas
 * @param canvas The canvas element containing the image
 * @param width The width of the canvas/gif
 * @param height The height of the canvas/gif
 * @returns A Promise resolving to a Blob containing the GIF
 */
export const createGif = async (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const gif = new GIF({
        workers: 2,
        quality: 10, // Lower means better quality but larger files
        width: width,
        height: height,
        workerScript: '/workers/gif.worker.js',
        dither: true, // Enable dithering for better color transitions
        transparent: null, // No transparency by default
        background: '#ffffff', // White background
      })

      // Add the frame from canvas
      gif.addFrame(canvas, {
        copy: true,
        delay: 200,
        dispose: 2, // Dispose previous frame for cleaner rendering
      })

      // Finalize the GIF
      gif.on('finished', (blob: Blob) => {
        resolve(blob)
      })

      // Render the GIF
      gif.render()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Determines the conversion path from source to target format
 * @param sourceFormat The source image format
 * @param targetFormat The target format to convert to
 * @returns Array representing the conversion path
 */
export const getConversionPath = (
  sourceFormat: SupportedFormat,
  targetFormat: SupportedFormat,
): SupportedFormat[] => {
  // If formats are the same, no conversion needed
  if (sourceFormat === targetFormat) {
    return []
  }

  // Define optimal conversion paths for different formats
  const conversionChains: Record<string, Record<string, SupportedFormat[]>> = {
    'image/jpeg': {
      'image/png': ['image/png'],
      'image/webp': ['image/webp'],
      'image/gif': ['image/png', 'image/gif'], // JPEG -> PNG -> GIF
    },
    'image/png': {
      'image/jpeg': ['image/jpeg'],
      'image/webp': ['image/webp'],
      'image/gif': ['image/gif'], // PNG -> GIF directly
    },
    'image/webp': {
      'image/jpeg': ['image/jpeg'],
      'image/png': ['image/png'],
      'image/gif': ['image/png', 'image/gif'], // WEBP -> PNG -> GIF
    },
    'image/heic': {
      'image/jpeg': ['image/jpeg'],
      'image/png': ['image/png'],
      'image/webp': ['image/webp'],
      'image/gif': ['image/png', 'image/gif'], // HEIC -> PNG -> GIF
    },
    'image/gif': {
      'image/jpeg': ['image/jpeg'],
      'image/png': ['image/png'],
      'image/webp': ['image/webp'],
    },
  }

  // Check if we have a defined conversion chain
  if (conversionChains[sourceFormat]?.[targetFormat]) {
    return conversionChains[sourceFormat][targetFormat]
  }

  // Default fallback: direct conversion
  return [sourceFormat, targetFormat]
}

/**
 * Converts an image through a specified conversion path
 * @param sourceBlob The source image blob
 * @param conversionPath Array of formats representing the conversion path
 * @param quality The quality for lossy formats (0-100)
 * @returns A Promise resolving to a Blob of the converted image
 */
export const convertImageThroughPath = async (
  sourceBlob: Blob,
  conversionPath: SupportedFormat[],
  quality: number = 90,
): Promise<Blob> => {
  // If path is empty or only has one format, return the original
  if (conversionPath.length <= 1) {
    return sourceBlob
  }

  let currentBlob = sourceBlob

  // Go through each step in the conversion path
  for (let i = 1; i < conversionPath.length; i++) {
    const targetFormat = conversionPath[i]
    currentBlob = await convertImageFormat(currentBlob, targetFormat, quality)
  }

  return currentBlob
}
