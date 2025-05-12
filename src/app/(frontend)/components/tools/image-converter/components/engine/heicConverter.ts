import convert from 'heic-convert/browser'

/**
 * Convert a HEIC file to JPEG format in the browser
 * @param file The HEIC file to convert
 * @param format The output format (JPEG or PNG)
 * @param quality The quality for JPEG format (0-1)
 * @returns A Promise resolving to a data URL of the converted image
 */
export const clientSideHeicConvertor = async (
  file: File,
  format: 'JPEG' | 'PNG' = 'JPEG',
  quality: number = 0.9,
): Promise<string> => {
  // Convert quality from 0-100 to 0-1 scale
  const normalizedQuality = quality > 1 ? quality / 100 : quality

  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Convert the HEIC to JPEG/PNG using heic-convert browser version
    const convertedImageBuffer = await convert({
      buffer: new Uint8Array(arrayBuffer), // Convert ArrayBuffer to Uint8Array
      format: format, // The output format
      quality: normalizedQuality, // JPEG quality (between 0-1)
    })

    // Convert the result buffer to a data URL
    const blob = new Blob([convertedImageBuffer], {
      type: format === 'JPEG' ? 'image/jpeg' : 'image/png',
    })

    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Client-side HEIC conversion error:', error)
    throw new Error(
      `Failed to convert HEIC file: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
