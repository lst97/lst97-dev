'use client'

import React from 'react'
import Image from 'next/image'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { ImageInfo } from '../../types'

type ImageThumbnailProps = {
  image: ImageInfo
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  scrollRef: (el: HTMLDivElement | null) => void
}

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  image,
  isSelected,
  onSelect,
  onRemove,
  scrollRef,
}) => {
  return (
    <div
      id={`thumbnail-${image.id}`}
      ref={scrollRef}
      onClick={onSelect}
      className={`relative rounded-sm overflow-hidden cursor-pointer transition-all border-2 border-dashed
        ${isSelected ? 'border-border border-solid border-4 shadow-lg' : 'border-border hover:border-accent-color/70'}
      `}
    >
      <div className="aspect-square relative">
        <Image src={image.preview} alt={image.name} fill className="object-cover" />
      </div>
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="h-6 w-6 flex items-center justify-center shadow-lg bg-black/50 text-white hover:bg-error transition-colors"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
      {image.convertedUrl && (
        <div className="absolute bottom-2 right-2">
          <div className="h-6 w-6 flex items-center justify-center rounded-full bg-accent-color text-white">
            <FaCheck className="text-xs" />
          </div>
        </div>
      )}
      {image.isConverting && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
