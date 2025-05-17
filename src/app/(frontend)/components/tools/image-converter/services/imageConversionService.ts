import { SupportedFormat } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { ImageInfo } from '../types'

/**
 * Determines the original filename, size, and extension of an image,
 * taking into account whether the original source was a HEIC file
 * that might have been converted for processing.
 *
 * @param selectedImage - The ImageInfo object representing the image being processed.
 * @param isHeicSource - A boolean indicating if the original source file was HEIC.
 * @param sourceExtension - The file extension of the source image (e.g., 'jpg', 'png', 'heic').
 * @returns An object containing the determined original filename, size, extension, and metadata.
 */
export function getSourceImageInfo(
  selectedImage: ImageInfo,
  isHeicSource: boolean,
  sourceExtension: string,
) {
  let filename: string
  let size: number
  let extension: string
  const metadata = selectedImage.metadata || null // Include metadata if available

  // Determine the original file information based on whether it was an original HEIC source
  if (isHeicSource && selectedImage.originalType === 'image/heic') {
    // Case: Original file was HEIC.
    // If it was converted (e.g., to JPG for browser compatibility),
    // we restore the original HEIC filename and extension.
    // The size used here is from the ImageInfo object, which might be the converted size.
    filename = selectedImage.name.replace(/\.jpg$/, '.heic') // Assuming HEIC was converted to JPG
    size = selectedImage.size // Use size from ImageInfo (potentially converted size)
    extension = 'HEIC' // Show original extension
  } else {
    // Case: Original file was not HEIC, or it was HEIC but not processed
    // in the specific HEIC-to-JPG conversion path handled above.
    // Use the filename and size from the original File object.
    filename = selectedImage.name // Use filename from ImageInfo
    size = selectedImage.file.size // Use size from original File object
    extension = sourceExtension.toUpperCase() // Use the provided source extension
  }

  // Return the determined original file information
  return {
    filename,
    size,
    extension,
    metadata,
  }
}

/**
 * Client-side HEIC conversion - uses the browser version of heic-convert
 * @param file The HEIC file to convert
 * @returns A Promise resolving to a JPEG File object
 */
export const processHeicFile = async (file: File): Promise<File> => {
  try {
    // Dynamically import our client-side converter to reduce bundle size in pages that don't need it
    const { clientSideHeicConvertor: clientSideHeicConvertor } = await import(
      '@/frontend/components/tools/image-converter/components/engine/heicConverter'
    )

    // Convert the HEIC file using the client-side converter
    const objectUrl = await clientSideHeicConvertor(file, 'JPEG', 90)

    // Convert the object URL to a File object
    const response = await fetch(objectUrl)
    const blob = await response.blob()

    // Create a File object with the proper name and type
    const jpegFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
    })

    // Release the object URL to free memory
    URL.revokeObjectURL(objectUrl)

    return jpegFile
  } catch (error) {
    console.error('HEIC conversion error:', error)
    throw new Error(
      `Failed to convert HEIC: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Get accurate file size estimate for the target format
 */
export const estimateFileSize = async (
  sourceBlob: Blob,
  sourceFormat: SupportedFormat,
  targetFormat: SupportedFormat,
  quality: number = 90,
): Promise<number> => {
  // For quick estimation without actual conversion
  const sourceSizeBytes = sourceBlob.size

  // Simple estimation factors with quick calculation
  if (targetFormat === 'image/jpeg') {
    // JPEG - quality has significant impact
    return Math.round(sourceSizeBytes * (0.2 + (quality / 100) * 0.6))
  } else if (targetFormat === 'image/png') {
    // PNG - typically larger than JPEG but not affected by quality
    return Math.round(sourceSizeBytes * (sourceFormat === 'image/jpeg' ? 1.2 : 1.0))
  } else if (targetFormat === 'image/webp') {
    // WebP - typically smaller than JPEG, quality has impact
    return Math.round(sourceSizeBytes * (0.15 + (quality / 100) * 0.5))
  } else if (targetFormat === 'image/gif') {
    // GIF - typically smaller for photos due to color reduction
    return Math.round(sourceSizeBytes * 0.8)
  }

  // Default - no change in size
  return sourceSizeBytes
}

/**
 * Simplified file size estimation without sample conversion
 * This is much faster but less accurate
 */
export const getQuickFileSize = (
  sourceSizeBytes: number,
  sourceFormat: SupportedFormat,
  targetFormat: SupportedFormat,
  quality: number = 90,
): number => {
  // Simple estimation factors with quick calculation
  if (targetFormat === 'image/jpeg') {
    // JPEG - quality has significant impact
    return Math.round(sourceSizeBytes * (0.2 + (quality / 100) * 0.6))
  } else if (targetFormat === 'image/png') {
    // PNG - typically larger than JPEG but not affected by quality
    return Math.round(sourceSizeBytes * (sourceFormat === 'image/jpeg' ? 1.2 : 1.0))
  } else if (targetFormat === 'image/webp') {
    // WebP - typically smaller than JPEG, quality has impact
    return Math.round(sourceSizeBytes * (0.15 + (quality / 100) * 0.5))
  } else if (targetFormat === 'image/gif') {
    // GIF - typically smaller for photos due to color reduction
    return Math.round(sourceSizeBytes * 0.8)
  }

  // Default - no change in size
  return sourceSizeBytes
}

/**
 * Generate a unique ID for image processing using UUID v4
 * @returns A string unique ID with an 'img_' prefix
 */
export const generateImageId = (): string => {
  return `img_${uuidv4()}_${Date.now()}`
}
