'use client'

import { useState, useEffect } from 'react'
import { ImageMetadata, ImageDimensions } from '../types'
import { extractImageMetadata, extractDimensionsFromImage } from '../services/imageMetadata'

/**
 * Hook to extract metadata and dimensions from an image file
 * @param file The image file to extract metadata from
 * @param previewUrl Optional preview URL to extract dimensions as fallback
 * @returns Object containing dimensions, metadata and loading state
 */
export function useImageMetadata(
  file?: File | null,
  previewUrl?: string,
): {
  dimensions: ImageDimensions | null
  metadata: ImageMetadata | null
  isExtracting: boolean
} {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
  const [isExtracting, setIsExtracting] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true

    // Reset state when file changes
    setMetadata(null)
    setDimensions(null)

    if (!file) {
      setIsExtracting(false)
      return
    }

    const extractMetadata = async () => {
      setIsExtracting(true)

      try {
        // Extract metadata and dimensions from the file
        const result = await extractImageMetadata(file)

        if (isMounted) {
          setMetadata(result.metadata)

          // If dimensions were found in metadata, use them
          if (result.dimensions.width > 0 && result.dimensions.height > 0) {
            setDimensions(result.dimensions)
          }
          // If no dimensions were found and we have a preview URL, extract dimensions from it
          else if (previewUrl) {
            try {
              const imageDimensions = await extractDimensionsFromImage(previewUrl)
              if (isMounted) {
                setDimensions(imageDimensions)
              }
            } catch (err) {
              console.warn('Failed to extract dimensions from preview image:', err)
            }
          }
        }
      } catch (error) {
        console.error('Error extracting metadata:', error)

        // Try to extract dimensions from preview as fallback
        if (previewUrl && isMounted) {
          try {
            const imageDimensions = await extractDimensionsFromImage(previewUrl)
            if (isMounted) {
              setDimensions(imageDimensions)
            }
          } catch (err) {
            console.warn('Failed to extract dimensions from preview image:', err)
          }
        }
      } finally {
        if (isMounted) {
          setIsExtracting(false)
        }
      }
    }

    extractMetadata()

    return () => {
      isMounted = false
    }
  }, [file, previewUrl])

  return { dimensions, metadata, isExtracting }
}
