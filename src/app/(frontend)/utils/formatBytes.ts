/**
 * Formats bytes to a human-readable format using the filesize library
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
import { filesize } from 'filesize'

/**
 * Format bytes to a human-readable string
 * @param bytes The number of bytes to format
 * @param decimals Number of decimal places (defaults to 2)
 * @returns A formatted string like "1.25 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  return filesize(bytes, {
    round: decimals,
    standard: 'jedec', // Use JEDEC standard (KB, MB, GB)
    base: 10, // Use base 10 for easier human understanding
    locale: true, // Use locale-specific formatting when available
  }) as string
}
