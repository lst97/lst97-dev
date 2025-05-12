'use client'

import { useCallback } from 'react'
import { ImageInfo, SupportedFormat } from '../types'
import { generateImageId, processHeicFile } from '../services/imageConversionService'

// Simple HEIC file check
const isHeicFile = (file: File): boolean => {
  // Check by extension
  if (file.name.toLowerCase().endsWith('.heic')) {
    return true
  }

  // Check by MIME type
  return file.type === 'image/heic' || file.type === 'image/heif'
}

export const useFileHandler = (
  setImages: React.Dispatch<React.SetStateAction<ImageInfo[]>>,
  setGlobalError: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  // Process a file into an ImageInfo object
  const processFile = useCallback(
    async (
      file: File,
      originalType?: SupportedFormat,
      originalSize?: number,
    ): Promise<ImageInfo> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            resolve({
              id: generateImageId(),
              file,
              preview: reader.result as string,
              name: file.name,
              size: originalSize || file.size, // Use original size if provided
              type: file.type,
              originalType, // Pass the original type (if specified)
            })
          } else {
            reject(new Error(`Failed to read file: ${file.name}`))
          }
        }
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
        reader.readAsDataURL(file)
      })
    },
    [],
  )

  // Handle the files that are dropped or selected
  const handleFiles = useCallback(
    async (files: File[]) => {
      setGlobalError(null)

      // Filter files and handle special formats
      const processFiles = async () => {
        const results: ImageInfo[] = []
        const errors: string[] = []

        for (const file of files) {
          try {
            // Check if file is HEIC
            const isHeic = isHeicFile(file)

            // Handle HEIC files specially
            if (isHeic) {
              try {
                // Store the original file size before conversion
                const originalSize = file.size

                // Process the HEIC file to convert it to JPEG using the client-side converter
                // processHeicFile now uses the Python implementation internally
                const jpegFile = await processHeicFile(file)

                // Read the converted JPEG file - pass 'image/heic' as the original type and original size
                const imageInfo = await processFile(jpegFile, 'image/heic', originalSize)

                results.push(imageInfo)
              } catch (error) {
                console.error('Error processing HEIC file:', error)
                const errorMessage = error instanceof Error ? error.message : String(error)
                errors.push(`Error processing HEIC file ${file.name}: ${errorMessage}`)
              }
            }
            // Handle regular image files
            else if (file.type.startsWith('image/')) {
              const imageInfo = await processFile(file)
              results.push(imageInfo)
            } else {
              // Not an image file
              errors.push(`${file.name} is not a supported image type`)
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            errors.push(`Error processing ${file.name}: ${errorMessage}`)
          }
        }

        // Update error state if needed
        if (errors.length > 0) {
          setGlobalError(`Some files couldn't be processed: ${errors.join(', ')}`)
        }

        // Add processed images to state
        if (results.length > 0) {
          setImages((prevImages) => [...prevImages, ...results])
        } else if (errors.length > 0) {
          setGlobalError(`No valid images were found in the selection: ${errors.join(', ')}`)
        } else {
          setGlobalError('No valid images were found in the selection')
        }
      }

      processFiles()
    },
    [setGlobalError, setImages, processFile],
  )

  return {
    handleFiles,
  }
}
