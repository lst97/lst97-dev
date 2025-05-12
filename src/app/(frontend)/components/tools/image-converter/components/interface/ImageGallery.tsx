'use client'

import React from 'react'
import { FaTimes } from 'react-icons/fa'
import { ImageThumbnail } from './ImageThumbnail'
import { ImageInfo } from '../../types'
import PixelScrollArea from '@/frontend/components/ui/ScrollArea'

type ImageGalleryProps = {
  images: ImageInfo[]
  selectedImageId: string | null
  scrollToId: string | null
  setSelectedImageId: (id: string) => void
  setScrollToId: (id: string | null) => void
  removeImage: (id: string) => void
  clearAllImages: () => void
  triggerFileInput: () => void
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  selectedImageId,
  scrollToId,
  setSelectedImageId,
  setScrollToId,
  removeImage,
  clearAllImages,
}) => {
  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-10">
      {/* Gallery controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-['Press_Start_2P']">Uploaded Images ({images.length})</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={clearAllImages}
            className=" p-3 flex items-center justify-center gap-2 transition-all border-border hover:border-error border-4 hover:translate-x-[2px] hover:text-error  font-['Press_Start_2P'] text-sm hover:cursor-pointer"
          >
            <FaTimes />
            Clear All
          </button>
        </div>
      </div>

      {/* Thumbnails grid with PixelScrollArea */}
      <div className="relative mb-8 border-2 border-[var(--color-border)] bg-background-color/5">
        <PixelScrollArea
          className="w-full"
          maxHeight="min(320px, calc(100vh - 400px))"
          type="always"
          scrollbarClassName="opacity-100"
          style={{
            height: 'min(320px, calc(100vh - 400px))',
            minHeight: '200px',
          }}
        >
          <div className="p-4 pr-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image) => (
                <ImageThumbnail
                  key={image.id}
                  image={image}
                  isSelected={image.id === selectedImageId}
                  onSelect={() => setSelectedImageId(image.id)}
                  onRemove={() => removeImage(image.id)}
                  scrollRef={(el) => {
                    // Scroll to this element if it's the one that should be scrolled to
                    if (scrollToId === image.id && el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                      setScrollToId(null)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </PixelScrollArea>
      </div>
    </div>
  )
}
