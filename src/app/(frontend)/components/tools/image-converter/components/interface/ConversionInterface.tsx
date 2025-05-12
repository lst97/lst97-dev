'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ImageInfo, SupportedFormat } from '../../types'
import { useImageMetadata } from '../../hooks/useImageMetadata'
import { getSourceImageInfo } from '../../services'
import { ImagePreviewWithNav } from './ImagePreviewWithNav'
import { ImageMetadataPanel } from './ImageMetadataPanel'
import { FormatSelectionPanel } from './FormatSelectionPanel'
import { QualityControl } from './QualityControl'
import { ConversionButtons } from './ConversionButtons'

type ConversionInterfaceProps = {
  selectedImage: ImageInfo
  targetFormat: SupportedFormat
  setTargetFormat: (format: SupportedFormat) => void
  quality: number
  setQuality: (quality: number) => void
  convertSelectedImage: () => void
  convertAllImages: () => void
  isProcessing: boolean
  navigateToPreviousImage: () => void
  navigateToNextImage: () => void
  currentIndex: number
  totalImages: number
}

// Common formats to display as buttons
const COMMON_FORMATS: SupportedFormat[] = ['image/jpeg', 'image/png', 'image/webp']

// Formats that support quality setting
const QUALITY_SUPPORTED_FORMATS: SupportedFormat[] = ['image/jpeg', 'image/webp']

export const ConversionInterface: React.FC<ConversionInterfaceProps> = ({
  selectedImage,
  targetFormat,
  setTargetFormat,
  quality,
  setQuality,
  convertSelectedImage,
  convertAllImages,
  isProcessing,
  navigateToPreviousImage,
  navigateToNextImage,
  currentIndex,
  totalImages,
}) => {
  // Get image metadata using custom hook
  const { dimensions, metadata, isExtracting } = useImageMetadata(
    selectedImage?.file,
    selectedImage.preview,
  )

  // Determine the actual source format
  const sourceFormat = selectedImage.originalType || (selectedImage.type as SupportedFormat)

  // Check if this is a HEIC file converted to JPEG
  const sourceFileName = selectedImage.name
  const sourceExtension = sourceFileName.split('.').pop()?.toLowerCase() || ''
  const isHeicSource = sourceFormat === 'image/heic' || sourceExtension === 'heic'

  // Get original file info
  const originalMetadata = useMemo(
    () => getSourceImageInfo(selectedImage, isHeicSource, sourceExtension),
    [selectedImage, isHeicSource, sourceExtension],
  )

  // For display in the UI
  const displayTargetFormat = targetFormat.split('/')[1].toUpperCase()

  // Check if quality should be shown
  const showQuality = QUALITY_SUPPORTED_FORMATS.includes(targetFormat)

  // Simplify the estimated file size calculation
  const estimatedFileSize = useMemo(() => {
    // Use original metadata size if available, otherwise use file size
    const sourceSizeBytes = originalMetadata?.size ?? selectedImage.file.size

    // Simplified estimation logic that responds quickly to quality changes
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
  }, [originalMetadata?.size, selectedImage.file.size, targetFormat, sourceFormat, quality])

  // Prepare format options for the PixelSelect dropdown
  const additionalFormatOptions = useMemo(() => {
    const allFormats = [{ value: 'image/gif', label: 'GIF' }]

    return allFormats
      .filter((format) => !COMMON_FORMATS.includes(format.value as SupportedFormat))
      .map((format) => ({
        ...format,
        disabled: (format.value === sourceFormat && !isHeicSource) || format.value === 'image/heic',
      }))
  }, [sourceFormat, isHeicSource])

  // Whether the convert button should be disabled
  const isConvertButtonDisabled = sourceFormat === targetFormat && !isHeicSource

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t-4 border-border pt-8 mb-8"
    >
      {/* Main content grid with three columns: source, arrow, target */}
      <div className="w-full grid grid-cols-1 md:grid-cols-11 gap-4 mb-6">
        {/* Left column (5/11) - Source image preview and metadata */}
        <div className="md:col-span-5 space-y-6">
          {/* Source image with navigation */}
          <div className="lg:h-[650px] md:h-[450px]">
            <ImagePreviewWithNav
              preview={selectedImage.preview}
              navigateToPreviousImage={navigateToPreviousImage}
              navigateToNextImage={navigateToNextImage}
              currentIndex={currentIndex}
              totalImages={totalImages}
            />
          </div>

          {/* Source file information */}
          <ImageMetadataPanel
            title="Source File Information"
            filename={originalMetadata?.filename || sourceFileName}
            size={originalMetadata?.size || selectedImage.file.size}
            format={originalMetadata?.extension || sourceExtension}
            dimensions={dimensions}
            formatMime={sourceFormat}
            metadata={metadata || selectedImage.metadata || originalMetadata?.metadata}
            isExtracting={isExtracting}
          />
        </div>

        {/* Middle column (1/11) - Arrow */}
        <div className="md:col-span-1 flex justify-center items-center">
          <div className="hidden md:flex h-full items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="round"
              className="text-accent-color"
              style={{
                imageRendering: 'pixelated',
                filter: 'drop-shadow(2px 2px 0 #000)',
              }}
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>

        {/* Right column (5/11) - Target format selection and information */}
        <div className="md:col-span-5 space-y-6">
          {/* Format selection panel */}
          <FormatSelectionPanel
            targetFormat={targetFormat}
            onFormatChange={setTargetFormat}
            sourceFormat={sourceFormat}
            isHeicSource={isHeicSource}
            commonFormats={COMMON_FORMATS}
            additionalFormats={additionalFormatOptions}
          />

          {/* Target file information */}
          <ImageMetadataPanel
            title="Target Format Information"
            filename={`${(originalMetadata?.filename || sourceFileName).replace(/\.[^/.]+$/, '')}.${targetFormat.split('/')[1]}`}
            size={estimatedFileSize}
            format={displayTargetFormat}
            dimensions={dimensions}
            formatMime={targetFormat}
            isExtracting={isExtracting}
            isEstimate={true}
          />

          {/* Quality slider - only shown for formats that support it */}
          {showQuality && <QualityControl quality={quality} setQuality={setQuality} />}
        </div>
      </div>

      {/* Error message for selected image */}
      {selectedImage.convertError && (
        <div className="mt-6 p-4 bg-red-100 border-4 border-red-400 text-red-700 font-['Press_Start_2P'] text-sm shadow-[4px_4px_0px_#000]">
          {selectedImage.convertError}
        </div>
      )}

      {/* Convert buttons */}
      <ConversionButtons
        convertSelectedImage={convertSelectedImage}
        convertAllImages={convertAllImages}
        isSelectedImageConverting={selectedImage.isConverting ?? false}
        isAllImagesProcessing={isProcessing}
        isDisabled={isConvertButtonDisabled}
      />
    </motion.div>
  )
}
