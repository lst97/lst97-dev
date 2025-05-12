'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FaFileDownload, FaFileArchive, FaSpinner, FaTrash } from 'react-icons/fa'
import { ImageInfo, SupportedFormat } from '../../types'
import { formatIconMap } from './FormatIcons'
import { formatBytes } from '@/app/(frontend)/utils/formatBytes'
import { PixelCheckbox, PixelScrollArea } from '@/app/(frontend)/components/ui'

type ConvertedImageGalleryProps = {
  images: ImageInfo[]
  targetFormat: SupportedFormat
  quality: number
  downloadImage: (image: ImageInfo) => void
  downloadAllImages: () => void
  downloadSelectedImages: (selectedImageIds: string[]) => void
  clearAllConvertedImages: () => void
  isZipping?: boolean
}

// Image Card component to avoid code duplication
const ImageCard = ({
  image,
  targetFormat,
  quality,
  showQuality,
  isSelected,
  onSelect,
  onDownload,
}: {
  image: ImageInfo
  targetFormat: SupportedFormat
  quality: number
  showQuality: boolean
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onDownload: (image: ImageInfo) => void
}) => {
  return (
    <div
      key={`converted-${image.id}`}
      className={`
        border-4 border-border
        ${
          isSelected
            ? ' bg-background/40 shadow-[6px_6px_0px_#000]'
            : ' bg-background/20 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000]'
        } 
        rounded-none overflow-hidden transition-all duration-200
        ${isSelected ? 'relative' : ''}
      `}
    >
      <div
        className="relative aspect-square bg-background/50 p-1 group cursor-pointer"
        onClick={(e) => {
          // Only handle click if it's not on the checkbox (to avoid double toggle)
          if (!(e.target as HTMLElement).closest('.checkbox-container')) {
            onSelect(image.id, !isSelected)
          }
        }}
      >
        {/* Checkbox for multi-select in top-left corner */}
        <div
          className="absolute top-2 left-2 z-10 opacity-80 hover:opacity-100 transition-opacity checkbox-container"
          onClick={(e) => e.stopPropagation()}
        >
          <PixelCheckbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(image.id, checked)}
            className="bg-background/80"
          />
        </div>

        <Image
          src={image.convertedUrl!}
          alt={`Converted ${image.name}`}
          fill
          className="object-contain"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 bg-accent-color rounded-none flex items-center justify-center mr-3 border-2 border-border">
            {formatIconMap[targetFormat]}
          </div>
          <div>
            <div className="font-['Press_Start_2P'] text-xs">
              {targetFormat.split('/')[1].toUpperCase()}
            </div>
            {showQuality && (
              <div className="text-xs font-['Press_Start_2P'] mt-1">Quality: {quality}%</div>
            )}
          </div>
        </div>

        <div className="space-y-3 font-['Press_Start_2P'] text-xs border-t-2 border-b-2 border-border/20 py-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Filename:</span>
            <span className="ml-2 truncate max-w-[150px] text-right">
              {image.name.split('.')[0]}.{targetFormat.split('/')[1]}
            </span>
          </div>
          {image.file && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Size:</span>
              <span>{formatBytes(image.file.size)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDownload(image)}
            className="p-2 bg-accent-color rounded-none font-['Press_Start_2P'] text-xs flex items-center gap-2 
              border-4 border-border shadow-[4px_4px_0px_#000]
              hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
              active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            <FaFileDownload />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

export const ConvertedImageGallery: React.FC<ConvertedImageGalleryProps> = ({
  images,
  targetFormat,
  quality,
  downloadImage,
  downloadAllImages,
  downloadSelectedImages,
  clearAllConvertedImages,
  isZipping = false,
}) => {
  // Only show images that have been converted
  const convertedImages = images.filter((img) => img.convertedUrl)

  // State for tracking selected images
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  // Check if quality should be shown based on format
  const showQuality = ['image/jpeg', 'image/webp'].includes(targetFormat)

  // Reset selections when images change
  useEffect(() => {
    setSelectedImages(new Set())
    setSelectAll(false)
  }, [images])

  // Handle select all checkbox change
  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      // Select all images
      setSelectedImages(new Set(convertedImages.map((img) => img.id)))
    } else {
      // Deselect all images
      setSelectedImages(new Set())
    }
  }

  // Handle individual checkbox change
  const handleSelectImage = (imageId: string, checked: boolean) => {
    const newSelectedImages = new Set(selectedImages)

    if (checked) {
      newSelectedImages.add(imageId)
    } else {
      newSelectedImages.delete(imageId)
    }

    setSelectedImages(newSelectedImages)

    // Update selectAll state based on whether all images are selected
    setSelectAll(newSelectedImages.size === convertedImages.length)
  }

  // Handle clear all images
  const handleClearAll = () => {
    clearAllConvertedImages()
    // Reset selection state
    setSelectedImages(new Set())
    setSelectAll(false)
  }

  // Download selected images as ZIP
  const handleDownloadSelected = () => {
    downloadSelectedImages(Array.from(selectedImages))
  }

  if (convertedImages.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="border-t-4 border-border pt-8"
    >
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-['Press_Start_2P']">Converted Images</h3>

          {/* Select All Checkbox */}
          <div className="ml-4 flex items-center">
            <PixelCheckbox
              checked={selectAll}
              onCheckedChange={handleSelectAllChange}
              label="Select All"
              labelClassName="text-xs"
            />

            {/* Selected count */}
            {selectedImages.size > 0 && (
              <span className="ml-4 font-['Press_Start_2P'] text-xs">
                {selectedImages.size} selected
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Clear All Button */}
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-error/50 rounded-none font-['Press_Start_2P'] text-sm flex items-center gap-2 transition-all 
              border-4 border-border shadow-[4px_4px_0px_#000]
              hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
              active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            <FaTrash />
            Clear All
          </button>

          {/* Download Selected as ZIP button (only shown when images are selected) */}
          {selectedImages.size > 0 && (
            <button
              onClick={handleDownloadSelected}
              disabled={isZipping}
              className="px-4 py-2 bg-info/50 rounded-none font-['Press_Start_2P'] text-sm flex items-center gap-2 transition-all 
                disabled:opacity-50 disabled:cursor-not-allowed
                border-4 border-border shadow-[4px_4px_0px_#000]
                hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              {isZipping ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <FaFileArchive />
                  Download Selected
                </>
              )}
            </button>
          )}

          {/* Download All as ZIP (original button) */}
          <button
            onClick={downloadAllImages}
            disabled={isZipping}
            className="px-4 py-2 bg-accent-color rounded-none font-['Press_Start_2P'] text-sm flex items-center gap-2 transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed
              border-4 border-border shadow-[4px_4px_0px_#000]
              hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
              active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            {isZipping ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating ZIP...
              </>
            ) : (
              <>
                <FaFileArchive />
                Download All as ZIP
              </>
            )}
          </button>
        </div>
      </div>

      {/* Always use PixelScrollArea for the image grid */}
      <div className="relative border-2 border-[var(--color-border)] bg-background-color/5">
        <PixelScrollArea
          className="w-full"
          maxHeight={convertedImages.length > 3 ? 'min(600px, calc(100vh - 350px))' : 'auto'}
          type="always"
          scrollbarClassName="opacity-100"
          style={{
            height: convertedImages.length > 3 ? 'min(600px, calc(100vh - 350px))' : 'auto',
            minHeight: convertedImages.length > 3 ? '400px' : 'auto',
          }}
        >
          <div className="pt-2 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-2 pr-8">
              {convertedImages.map((image) => (
                <ImageCard
                  key={`card-${image.id}`}
                  image={image}
                  targetFormat={targetFormat}
                  quality={quality}
                  showQuality={showQuality}
                  isSelected={selectedImages.has(image.id)}
                  onSelect={handleSelectImage}
                  onDownload={downloadImage}
                />
              ))}
            </div>
          </div>
        </PixelScrollArea>
      </div>
    </motion.div>
  )
}
