'use client'

import React from 'react'
import Image from 'next/image'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

type ImagePreviewWithNavProps = {
  preview: string
  navigateToPreviousImage: () => void
  navigateToNextImage: () => void
  currentIndex: number
  totalImages: number
}

export const ImagePreviewWithNav: React.FC<ImagePreviewWithNavProps> = ({
  preview,
  navigateToPreviousImage,
  navigateToNextImage,
  currentIndex,
  totalImages,
}) => {
  return (
    <div className="md:col-span-7 space-y-4">
      <h3 className="text-xl font-['Press_Start_2P'] text-center">Source Image</h3>

      <div className="relative max-w-md mx-auto aspect-square border-4 border-border rounded-none overflow-hidden bg-background-color/50 p-1 group shadow-[4px_4px_0px_#000]">
        <Image src={preview} alt="Source image" fill className="object-contain" />

        {/* Navigation overlays */}
        {totalImages > 1 && (
          <>
            <button
              onClick={navigateToPreviousImage}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed border-2 border-border"
            >
              <FaArrowLeft className="text-white" />
            </button>
            <button
              onClick={navigateToNextImage}
              disabled={currentIndex === totalImages - 1}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed border-2 border-border"
            >
              <FaArrowRight className="text-white" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-sm font-['Press_Start_2P'] text-xs border-2 border-border">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>
    </div>
  )
}
