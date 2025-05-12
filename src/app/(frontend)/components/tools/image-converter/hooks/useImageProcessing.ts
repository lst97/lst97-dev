'use client'

import React, { useCallback } from 'react'
import { ImageInfo, SupportedFormat } from '../types'
import { generateImageId } from '../services/imageConversionService'
import { getConversionPath, convertImageThroughPath } from '../components/engine'

export const useImageProcessing = ({
  images,
  setImages,
  targetFormat,
  quality,
}: {
  images: ImageInfo[]
  setImages: React.Dispatch<React.SetStateAction<ImageInfo[]>>
  targetFormat: SupportedFormat
  quality: number
}) => {
  // Convert a single image
  const convertSingleImage = useCallback(
    async (imageToConvert: ImageInfo): Promise<ImageInfo> => {
      try {
        // Get the source format
        const sourceFormat = (imageToConvert.originalType || imageToConvert.type) as SupportedFormat

        // Get conversion path
        const conversionPath = getConversionPath(sourceFormat, targetFormat)

        // If conversion path is empty or only contains the source format, no conversion needed
        if (
          conversionPath.length === 0 ||
          (conversionPath.length === 1 && conversionPath[0] === sourceFormat)
        ) {
          return {
            ...imageToConvert,
            convertError: 'No conversion needed: source and target formats are the same',
            isConverting: false,
          }
        }

        // Get a blob from the image file or create one from the preview
        let sourceBlob: Blob

        if (imageToConvert.file instanceof Blob) {
          sourceBlob = imageToConvert.file
        } else {
          // Create a blob from the image preview
          const img = document.createElement('img')
          img.src = imageToConvert.preview

          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })

          // Create canvas to get image data
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            throw new Error('Could not get canvas context')
          }

          ctx.drawImage(img, 0, 0)

          // Get image as blob for conversion
          sourceBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Failed to get image data'))
            }, sourceFormat)
          })
        }

        // Convert the image through the conversion path
        const convertedBlob = await convertImageThroughPath(sourceBlob, conversionPath, quality)

        // Create an object URL from the converted blob
        const url = URL.createObjectURL(convertedBlob)

        // Create a File object for size information
        const convertedFile = new File(
          [convertedBlob],
          `${imageToConvert.name.split('.')[0]}.${targetFormat.split('/')[1]}`,
          { type: targetFormat },
        )

        return {
          ...imageToConvert,
          convertedUrl: url,
          isConverting: false,
          file: convertedFile, // Update file with the converted one for accurate size reporting
        }
      } catch (err) {
        console.error('Conversion error:', err)
        return {
          ...imageToConvert,
          convertError: 'Failed to convert: ' + (err instanceof Error ? err.message : String(err)),
          isConverting: false,
        }
      }
    },
    [targetFormat, quality],
  )

  // Convert the selected image
  const convertSelectedImage = useCallback(
    async (selectedImage: ImageInfo) => {
      if (!selectedImage) return

      // Update state to show converting
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id
            ? { ...img, isConverting: true, convertError: undefined }
            : img,
        ),
      )

      // Convert the image
      const updated = await convertSingleImage(selectedImage)

      // Update state with result
      setImages((prev) => prev.map((img) => (img.id === updated.id ? updated : img)))
    },
    [convertSingleImage, setImages],
  )

  // Convert all images
  const convertAllImages = useCallback(
    async (
      isProcessing: boolean,
      setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
      setIsProcessing(true)

      // Mark all images as converting
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isConverting: true,
          convertError: undefined,
        })),
      )

      // Process images in batches to avoid overloading the browser
      const batchSize = 3
      const batches = Math.ceil(images.length / batchSize)

      for (let i = 0; i < batches; i++) {
        const startIdx = i * batchSize
        const endIdx = Math.min(startIdx + batchSize, images.length)
        const batch = images.slice(startIdx, endIdx)

        // Convert batch in parallel
        const results = await Promise.all(batch.map((img) => convertSingleImage(img)))

        // Update state with converted batch
        setImages((prev) => {
          const updated = [...prev]
          results.forEach((result) => {
            const idx = updated.findIndex((img) => img.id === result.id)
            if (idx !== -1) {
              updated[idx] = result
            }
          })
          return updated
        })
      }

      setIsProcessing(false)
    },
    [images, convertSingleImage, setImages],
  )

  // Process HEIC file with proper error handling
  const processFile = useCallback(async (file: File): Promise<ImageInfo | null> => {
    const reader = new FileReader()

    try {
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve({
            id: generateImageId(),
            file,
            preview: reader.result as string,
            name: file.name,
            size: file.size,
            type: file.type,
          })
        }
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
      throw new Error(
        `Error processing file ${file.name}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }, [])

  return {
    convertSingleImage,
    convertSelectedImage,
    convertAllImages,
    processFile,
  }
}
