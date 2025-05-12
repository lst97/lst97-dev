'use client'

import { useCallback, useState } from 'react'
import { ImageInfo, SupportedFormat } from '../types'
import JSZip from 'jszip'

export const useDownloadHandler = (targetFormat: SupportedFormat) => {
  const [isZipping, setIsZipping] = useState(false)

  // Get correct file extension based on format
  const getExtension = useCallback((format: SupportedFormat) => {
    const parts = format.split('/')
    if (parts.length !== 2) return 'unknown'

    // Return the specific extension
    return parts[1]
  }, [])

  // Get Blob from URL
  const getBlobFromUrl = useCallback(async (url: string): Promise<Blob> => {
    // If it's a blob URL or data URL
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      // For blob URLs, fetch the blob directly
      if (url.startsWith('blob:')) {
        const response = await fetch(url)
        return await response.blob()
      }

      // For data URLs, convert to blob
      const parts = url.split(';base64,')
      if (parts.length === 2) {
        const contentType = parts[0].split(':')[1]
        const raw = window.atob(parts[1])
        const uInt8Array = new Uint8Array(raw.length)

        for (let i = 0; i < raw.length; i++) {
          uInt8Array[i] = raw.charCodeAt(i)
        }

        return new Blob([uInt8Array], { type: contentType })
      }
    }

    throw new Error('Unsupported URL format')
  }, [])

  // Download a single converted image
  const downloadImage = useCallback(
    async (image: ImageInfo) => {
      if (!image.convertedUrl) return

      try {
        // Get appropriate file extension
        const extension = getExtension(targetFormat)
        const filename = image.name.split('.')[0] || 'converted'

        // Create download link
        const a = document.createElement('a')
        a.href = image.convertedUrl
        a.download = `${filename}.${extension}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error downloading image:', error)
        alert('Failed to download image. Please try again.')
      }
    },
    [targetFormat, getExtension],
  )

  // Create and download ZIP with specified images
  const createAndDownloadZip = useCallback(
    async (imagesToZip: ImageInfo[], zipFilename = 'converted_images.zip') => {
      if (imagesToZip.length === 0) {
        console.warn('No images to download')
        return
      }

      setIsZipping(true)

      try {
        const zip = new JSZip()
        const extension = getExtension(targetFormat)
        let successCount = 0
        let errorCount = 0

        // Add each image to the ZIP file
        for (const image of imagesToZip) {
          if (!image.convertedUrl) continue

          const filename = image.name.split('.')[0] || 'converted'
          const fullFilename = `${filename}.${extension}`

          try {
            // Get blob from URL for better compression
            const blob = await getBlobFromUrl(image.convertedUrl)

            // Add the file to the ZIP
            zip.file(fullFilename, blob)
            successCount++
          } catch (error) {
            console.error(`Error adding ${filename} to ZIP:`, error)
            errorCount++
            // Skip this file but continue with others
          }
        }

        // If no files were successfully added, show error
        if (successCount === 0) {
          throw new Error('Failed to add any images to the ZIP file')
        }

        // Generate the ZIP file
        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        })

        // Create a download link for the ZIP
        const zipUrl = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = zipUrl
        a.download = zipFilename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // Clean up
        URL.revokeObjectURL(zipUrl)

        // Report any errors
        if (errorCount > 0) {
          console.warn(`${errorCount} files could not be added to the ZIP`)
        }

        return successCount
      } catch (error) {
        console.error('Error creating ZIP file:', error)
        alert('Error creating ZIP file. Some images may download individually.')

        // Fallback to individual downloads if zipping fails completely
        imagesToZip.forEach((img, index) => {
          if (img.convertedUrl) {
            setTimeout(() => {
              downloadImage(img)
            }, index * 300)
          }
        })

        return 0
      } finally {
        setIsZipping(false)
      }
    },
    [downloadImage, targetFormat, getBlobFromUrl, getExtension],
  )

  // Download all converted images as a ZIP archive
  const downloadAllImages = useCallback(
    async (images: ImageInfo[]) => {
      const convertedImages = images.filter((img) => img.convertedUrl)
      await createAndDownloadZip(convertedImages, 'converted_images.zip')
    },
    [createAndDownloadZip],
  )

  // Download selected images as a ZIP archive
  const downloadSelectedImages = useCallback(
    async (images: ImageInfo[], selectedIds: string[]) => {
      if (selectedIds.length === 0) return

      const selectedImages = images.filter(
        (img) => img.convertedUrl && selectedIds.includes(img.id),
      )

      if (selectedImages.length === 0) {
        console.warn('No converted images found in selection')
        return
      }

      // Create a more descriptive filename based on selection
      const zipFilename =
        selectedImages.length === 1
          ? `${selectedImages[0].name.split('.')[0]}.zip`
          : `selected_images_${selectedImages.length}.zip`

      await createAndDownloadZip(selectedImages, zipFilename)
    },
    [createAndDownloadZip],
  )

  return {
    downloadImage,
    downloadAllImages,
    downloadSelectedImages,
    isZipping,
  }
}
