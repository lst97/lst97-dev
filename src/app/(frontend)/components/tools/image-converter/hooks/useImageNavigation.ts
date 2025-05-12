'use client'

import { useCallback } from 'react'
import { ImageInfo } from '../types'

export const useImageNavigation = (
  images: ImageInfo[],
  selectedImageId: string | null,
  setSelectedImageId: React.Dispatch<React.SetStateAction<string | null>>,
  setScrollToId: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  // Navigate to previous image
  const navigateToPreviousImage = useCallback(() => {
    if (!selectedImageId || images.length <= 1) return

    const currentIndex = images.findIndex((img) => img.id === selectedImageId)
    if (currentIndex > 0) {
      const prevImageId = images[currentIndex - 1].id
      setSelectedImageId(prevImageId)
      setScrollToId(prevImageId)
    }
  }, [selectedImageId, images, setSelectedImageId, setScrollToId])

  // Navigate to next image
  const navigateToNextImage = useCallback(() => {
    if (!selectedImageId || images.length <= 1) return

    const currentIndex = images.findIndex((img) => img.id === selectedImageId)
    if (currentIndex < images.length - 1) {
      const nextImageId = images[currentIndex + 1].id
      setSelectedImageId(nextImageId)
      setScrollToId(nextImageId)
    }
  }, [selectedImageId, images, setSelectedImageId, setScrollToId])

  // Remove an image from the list
  const removeImage = useCallback(
    (id: string) => {
      if (selectedImageId === id) {
        const currentIndex = images.findIndex((img) => img.id === id)
        const remainingImages = images.filter((img) => img.id !== id)

        // Select the next image, or the previous if there's no next
        if (remainingImages.length > 0) {
          const newIndex =
            currentIndex < remainingImages.length ? currentIndex : remainingImages.length - 1
          setSelectedImageId(remainingImages[newIndex].id)
        } else {
          setSelectedImageId(null)
        }
      }
    },
    [selectedImageId, images, setSelectedImageId],
  )

  return {
    navigateToPreviousImage,
    navigateToNextImage,
    removeImage,
  }
}
