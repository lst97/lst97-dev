'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

import { ImageInfo, SupportedFormat } from './types'
import { UploadSection } from './components/interface/UploadSection'
import { ImageGallery } from './components/interface/ImageGallery'
import { ConversionInterface } from './components/interface/ConversionInterface'
import { ConvertedImageGallery } from './components/interface/ConvertedImageGallery'
import FileUploadProgressList from './components/interface/FileUploadProgressList'
import ProcessingNotice from './components/interface/ProcessingNotice'
import {
  useDownloadHandler,
  useImageNavigation,
  useFileProcessor,
  useImageProcessing,
} from './hooks'

export const ImageConverter: React.FC = () => {
  const [images, setImages] = useState<ImageInfo[]>([])
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('image/webp')
  const [quality, setQuality] = useState<number>(90)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [scrollToId, setScrollToId] = useState<string | null>(null)
  const [formatManuallySelected, setFormatManuallySelected] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get the currently selected image
  const selectedImage = selectedImageId ? images.find((img) => img.id === selectedImageId) : null

  // Get the current index of the selected image
  const currentIndex = selectedImageId ? images.findIndex((img) => img.id === selectedImageId) : -1

  // File processing hook with parallel processing and progress tracking
  const {
    processingFiles,
    handleFiles: processFiles,
    clearProcessingFiles,
    cancelProcessing,
  } = useFileProcessor({
    onFilesProcessed: (newImages) => {
      setImages((prev) => [...prev, ...newImages])
    },
    onError: (error) => {
      setGlobalError(error)
    },
  })

  // Function to handle files with the new processor
  const handleFiles = useCallback(
    (files: File[]) => {
      setGlobalError(null)
      processFiles(files)
    },
    [processFiles],
  )

  // Image processing hook
  const { convertSelectedImage: convertImageFn, convertAllImages: convertAllImagesFn } =
    useImageProcessing({ images, setImages, targetFormat, quality })

  // Download handling hook
  const {
    downloadImage,
    downloadAllImages,
    downloadSelectedImages: hookDownloadSelectedImages,
    isZipping,
  } = useDownloadHandler(targetFormat)

  // Image navigation hook
  const { navigateToPreviousImage, navigateToNextImage, removeImage } = useImageNavigation(
    images,
    selectedImageId,
    setSelectedImageId,
    setScrollToId,
  )

  // New function to clear all converted images
  const clearAllConvertedImages = useCallback(() => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        convertedUrl: undefined,
        convertError: undefined,
      })),
    )
  }, [])

  // New function to download selected images
  const downloadSelectedImages = useCallback(
    (selectedImageIds: string[]) => {
      hookDownloadSelectedImages(images, selectedImageIds)
    },
    [hookDownloadSelectedImages, images],
  )

  // Auto-select the first image when images change
  useEffect(() => {
    if (images.length > 0 && !selectedImageId) {
      setSelectedImageId(images[0].id)
    } else if (images.length === 0) {
      setSelectedImageId(null)
    }
  }, [images.length, selectedImageId, images])

  // Function to handle manual format selection
  const handleTargetFormatChange = (format: SupportedFormat) => {
    setTargetFormat(format)
    setFormatManuallySelected(true)
  }

  // Auto-set target format ONLY when the selectedImage changes
  useEffect(() => {
    // Don't do anything if no image is selected or manual selection happened
    if (!selectedImage || formatManuallySelected) {
      return
    }

    // Get source format
    const sourceFormat = (selectedImage.originalType || selectedImage.type) as SupportedFormat

    // Handle HEIC files specially - always default to JPEG for HEIC files
    if (sourceFormat === 'image/heic') {
      setTargetFormat('image/jpeg')
      return
    }

    // Get current target format from state to avoid dependency
    // This prevents the effect from re-running when targetFormat changes
    const currentTargetFormat = targetFormat

    // Choose a different format if source and target are the same
    if (sourceFormat === currentTargetFormat) {
      if (sourceFormat === 'image/jpeg') {
        setTargetFormat('image/webp')
      } else if (sourceFormat === 'image/png') {
        setTargetFormat('image/jpeg')
      } else if (sourceFormat === 'image/webp') {
        setTargetFormat('image/png')
      } else if (sourceFormat === 'image/gif') {
        setTargetFormat('image/webp')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, formatManuallySelected])

  // Create a ref to track the last selected image ID
  const lastSelectedImageIdRef = useRef<string | null>(null)

  // Reset the manual selection flag ONLY when selecting a new image
  useEffect(() => {
    // Skip if no image selected or if manual flag is already false
    if (!selectedImageId || formatManuallySelected === false) return

    // Only reset if the selected image ID actually changed
    if (selectedImageId !== lastSelectedImageIdRef.current) {
      setFormatManuallySelected(false)
      // Update ref with current ID
      lastSelectedImageIdRef.current = selectedImageId
    }
  }, [selectedImageId, formatManuallySelected])

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const { files } = e.dataTransfer
    if (files && files.length > 0) {
      handleFiles(Array.from(files))
    }
  }

  // Remove an image with UI update
  const handleRemoveImage = (id: string) => {
    removeImage(id)
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  // Clear all images
  const clearAllImages = () => {
    setImages([])
    setSelectedImageId(null)
    clearProcessingFiles()
    cancelProcessing()
  }

  // Wrapper for converting the selected image
  const handleConvertSelectedImage = useCallback(async () => {
    if (!selectedImage) return
    await convertImageFn(selectedImage)
  }, [selectedImage, convertImageFn])

  // Wrapper for converting all images
  const handleConvertAllImages = useCallback(async () => {
    await convertAllImagesFn(isProcessing, setIsProcessing)
  }, [convertAllImagesFn, isProcessing])

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Determine if processing notice should be shown
  const isProcessingInProgress = processingFiles.some(
    (file) => file.status !== 'completed' && file.status !== 'error',
  )

  const activeProcessingCount = processingFiles.filter(
    (file) => file.status !== 'completed' && file.status !== 'error',
  ).length

  return (
    <div className="bg-card w-full max-w-6xl mx-auto p-8 border-4 border-border shadow-[8px_8px_0_#000] rounded-none px-2 md:px-8">
      <h2 className="text-2xl font-['Press_Start_2P'] mb-8 text-center">Image Converter</h2>

      {/* Upload section */}
      <UploadSection
        onFileUpload={handleFiles}
        dragActive={dragActive}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
      />

      {/* Processing notice for potential UI lag */}
      <ProcessingNotice isVisible={isProcessingInProgress} fileCount={activeProcessingCount} />

      {/* File processing progress */}
      <FileUploadProgressList files={processingFiles} />

      {/* Error message */}
      {globalError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border-4 border-red-400 text-red-700 font-['Press_Start_2P'] text-sm shadow-[4px_4px_0px_#000]"
        >
          {globalError}
        </motion.div>
      )}

      {/* Image gallery display */}
      {images.length > 0 && (
        <ImageGallery
          images={images}
          selectedImageId={selectedImageId}
          scrollToId={scrollToId}
          setSelectedImageId={setSelectedImageId}
          setScrollToId={setScrollToId}
          removeImage={handleRemoveImage}
          clearAllImages={clearAllImages}
          triggerFileInput={triggerFileInput}
        />
      )}

      {/* Conversion interface */}
      {selectedImage && (
        <ConversionInterface
          selectedImage={selectedImage}
          targetFormat={targetFormat}
          setTargetFormat={handleTargetFormatChange}
          quality={quality}
          setQuality={setQuality}
          convertSelectedImage={handleConvertSelectedImage}
          convertAllImages={handleConvertAllImages}
          isProcessing={isProcessing || isZipping}
          navigateToPreviousImage={navigateToPreviousImage}
          navigateToNextImage={navigateToNextImage}
          currentIndex={currentIndex}
          totalImages={images.length}
        />
      )}

      {/* Converted images section */}
      {images.some((img) => img.convertedUrl) && (
        <ConvertedImageGallery
          images={images}
          targetFormat={targetFormat}
          quality={quality}
          downloadImage={downloadImage}
          downloadAllImages={() => downloadAllImages(images)}
          downloadSelectedImages={downloadSelectedImages}
          clearAllConvertedImages={clearAllConvertedImages}
          isZipping={isZipping}
        />
      )}
    </div>
  )
}
