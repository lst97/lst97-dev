/**
 * Utility functions for file handling in the background remover tool
 */

/**
 * Estimate the file size of an image from its data URL
 * @param dataUrl The data URL string representation of the image
 * @returns The estimated file size in bytes
 */
export function getFileSizeFromDataUrl(dataUrl: string): number {
  // For data URLs, we need to remove the metadata part and decode the base64
  const base64String = dataUrl.split(',')[1]

  if (!base64String) {
    return 0
  }

  // Calculate size: base64 uses 4 characters to represent 3 bytes
  // So the decoded size is 3/4 of the base64 string length
  const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0
  return Math.floor((base64String.length * 3) / 4) - padding
}
