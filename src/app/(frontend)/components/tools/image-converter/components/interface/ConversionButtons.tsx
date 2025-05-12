'use client'

import React from 'react'
import { FaExchangeAlt } from 'react-icons/fa'

type ConversionButtonsProps = {
  convertSelectedImage: () => void
  convertAllImages: () => void
  isSelectedImageConverting: boolean
  isAllImagesProcessing: boolean
  isDisabled: boolean
}

export const ConversionButtons: React.FC<ConversionButtonsProps> = ({
  convertSelectedImage,
  convertAllImages,
  isSelectedImageConverting,
  isAllImagesProcessing,
  isDisabled,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <button
        onClick={convertSelectedImage}
        disabled={isSelectedImageConverting || isDisabled}
        className="p-3 rounded-none font-['Press_Start_2P'] text-sm flex items-center justify-center gap-2 transition-all
          bg-accent-color hover:bg-accent-color/80
          disabled:opacity-50 disabled:cursor-not-allowed
          border-4 border-border shadow-[4px_4px_0px_#000]
          hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
          active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
      >
        {isSelectedImageConverting ? (
          <>Converting...</>
        ) : (
          <>
            <FaExchangeAlt />
            Convert Selected Image
          </>
        )}
      </button>

      <button
        onClick={convertAllImages}
        disabled={isAllImagesProcessing}
        className="p-3 border-4 border-border bg-border text-white rounded-none font-['Press_Start_2P'] text-sm flex items-center justify-center gap-2 transition-all
          hover:bg-accent-color/10 bg-background-color
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-[4px_4px_0px_#000]
          hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
          active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
      >
        {isAllImagesProcessing ? (
          <>Processing All Images...</>
        ) : (
          <>
            <FaExchangeAlt />
            Convert All Images
          </>
        )}
      </button>
    </div>
  )
}
