'use client'

import React, { useRef } from 'react'
import { FaUpload, FaTimes } from 'react-icons/fa'
import { PixelSlider } from '@/frontend/components/ui/Slider'

type ImageUploadProps = {
  selectedBackgroundImage: string | null
  backgroundImageFile: File | null
  imageAlpha: number
  previewImageUrl: string | null
  isGeneratingPreview: boolean
  hasCompletedImages: boolean
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageApply: () => void
  onRemoveImage: () => void
  onAlphaChange: (alpha: number) => void
  disabled?: boolean
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedBackgroundImage,
  backgroundImageFile,
  imageAlpha,
  previewImageUrl,
  isGeneratingPreview,
  hasCompletedImages,
  onImageUpload,
  onImageApply,
  onRemoveImage,
  onAlphaChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mb-6">
      <h4 className="font-['Press_Start_2P'] text-sm mb-3">Upload Background Image</h4>

      {!selectedBackgroundImage ? (
        <div className="border-2 border-dashed border-border p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            disabled={disabled}
            className="hidden"
            id="background-image-upload"
          />
          <label
            htmlFor="background-image-upload"
            className={`
              inline-flex flex-col items-center gap-3 cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <FaUpload className="text-4xl text-accent-color" />
            <span className="font-['Press_Start_2P'] text-xs">Click to upload image</span>
            <span className="font-['Press_Start_2P'] text-[10px] opacity-70">
              Supports JPG, PNG, GIF, WebP
            </span>
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-border p-4 bg-card border-dashed">
            {/* Responsive layout: Stack on mobile, side-by-side on larger screens */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Image preview - responsive sizing */}
              <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                <div
                  className="relative w-64 h-48 sm:w-72 sm:h-54 lg:w-48 lg:h-36 border-2 border-border overflow-hidden"
                  style={{
                    backgroundImage: previewImageUrl
                      ? `url(${previewImageUrl})`
                      : `url(${selectedBackgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Foreground SVG Demo Object */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      d="M50 10 L61.8 35.4 L90.2 38.2 L68.2 58 L73.6 86.4 L50 72.8 L26.4 86.4 L31.8 58 L9.8 38.2 L38.2 35.4 Z"
                      fill="#888888"
                      stroke="#333333"
                      strokeWidth="2"
                      transform="scale(1.2) translate(-8, -5)"
                    />
                    <path
                      d="M50 10 L61.8 35.4 L90.2 38.2 L68.2 58 L73.6 86.4 L50 72.8 L26.4 86.4 L31.8 58 L9.8 38.2 L38.2 35.4 Z"
                      fill="rgba(255, 255, 255, 0.8)"
                      stroke="white"
                      strokeWidth="0.5"
                      transform="scale(1.18) translate(-7.5, -6)"
                    />
                  </svg>

                  {/* Loading overlay */}
                  {isGeneratingPreview && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  <button
                    onClick={onRemoveImage}
                    disabled={disabled}
                    className={`
                      absolute top-1 right-1 p-1 border border-border shadow-[1px_1px_0px_#000] 
                      hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] 
                      transition-all bg-red-500 text-white text-xs
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title="Remove image"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Controls container - responsive height and layout */}
              <div className="flex-1 flex flex-col justify-between min-h-48 sm:min-h-54 lg:min-h-36 lg:h-36 min-w-0 p-2">
                {/* File name at the top - compact */}
                <div>
                  <div className="font-['Press_Start_2P'] text-xs font-bold truncate leading-tight text-center lg:text-left">
                    {backgroundImageFile?.name || 'Background Image'}
                  </div>
                </div>

                {/* Alpha control in the middle - more compact */}
                <div className="flex-1 flex flex-col justify-center py-2">
                  <div className="text-center lg:text-left mb-2">
                    <span className="font-['Press_Start_2P'] text-xs text-[var(--color-text)]">
                      Transparency: {Math.round((1 - imageAlpha) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Press_Start_2P'] text-xs opacity-70 whitespace-nowrap hidden sm:inline">
                      Opaque
                    </span>
                    <div className="flex-1">
                      <PixelSlider
                        value={[Math.round((1 - imageAlpha) * 100)]}
                        onValueChange={(values) => {
                          const transparency = values[0] / 100
                          const alpha = 1 - transparency
                          onAlphaChange(alpha)
                        }}
                        min={0}
                        max={100}
                        step={1}
                        disabled={disabled}
                        fullWidth={true}
                        className="h-6"
                      />
                    </div>
                    <span className="font-['Press_Start_2P'] text-xs opacity-70 whitespace-nowrap hidden sm:inline">
                      Clear
                    </span>
                  </div>

                  {/* Mobile labels below slider */}
                  <div className="flex justify-between mt-1 sm:hidden">
                    <span className="font-['Press_Start_2P'] text-[10px] opacity-70">Opaque</span>
                    <span className="font-['Press_Start_2P'] text-[10px] opacity-70">Clear</span>
                  </div>
                </div>

                {/* File metadata at the bottom - more compact */}
                <div className="mt-2">
                  <div className="font-['Press_Start_2P'] text-[9px] opacity-70 leading-tight text-center lg:text-left">
                    {backgroundImageFile
                      ? `${(backgroundImageFile.size / 1024 / 1024).toFixed(1)}MB`
                      : 'Unknown'}{' '}
                    • {backgroundImageFile?.type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasCompletedImages && (
            <div className="mt-4 text-center">
              <button
                onClick={onImageApply}
                disabled={disabled || !selectedBackgroundImage}
                className={`
                  px-6 py-3 border-2 border-border shadow-[2px_2px_0px_#000] 
                  transition-all font-['Press_Start_2P'] text-xs
                  bg-border text-white
                  ${
                    disabled || !selectedBackgroundImage
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  }
                `}
              >
                Apply Background Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
