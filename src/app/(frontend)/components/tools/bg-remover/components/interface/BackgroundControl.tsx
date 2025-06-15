'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  BackgroundModeToggle,
  ColorPreview,
  PresetColors,
  CustomColorPicker,
  ColorHistory,
  ImageUpload,
  BackgroundMode,
  PRESET_COLORS,
  COLOR_HISTORY_KEY,
  MAX_HISTORY_ITEMS,
} from './background'

type BackgroundControlProps = {
  onBackgroundColorChange: (color: string | null, alpha?: number) => void
  onApplyBackgroundColor: (color: string | null, alpha?: number) => void
  onBackgroundImageChange: (imageUrl: string | null, alpha?: number) => void
  onApplyBackgroundImage: (imageUrl: string | null, alpha?: number) => void
  disabled?: boolean
  hasCompletedImages?: boolean
}

/**
 * @property {(color: string | null, alpha?: number) => void} onBackgroundColorChange - Callback when background color changes (e.g., color picker, preset selection).
 * @property {(color: string | null, alpha?: number) => void} onApplyBackgroundColor - Callback to apply the selected background color, triggering reprocessing of completed images.
 * @property {(imageUrl: string | null, alpha?: number) => void} onBackgroundImageChange - Callback when background image changes (e.g., image upload).
 * @property {(imageUrl: string | null, alpha?: number) => void} onApplyBackgroundImage - Callback to apply the selected background image, triggering reprocessing of completed images.
 * @property {boolean} [disabled=false] - Whether the controls should be disabled.
 * @property {boolean} [hasCompletedImages=false] - Indicates if there are images that have completed processing, affecting 'Apply' button visibility.
 */
export const BackgroundControl: React.FC<BackgroundControlProps> = ({
  onBackgroundColorChange,
  onApplyBackgroundColor,
  onBackgroundImageChange,
  onApplyBackgroundImage,
  disabled = false,
  hasCompletedImages = false,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [customColor, setCustomColor] = useState<string>('#F8F9FA')
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<string | null>(null)
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('color')
  const [imageAlpha, setImageAlpha] = useState<number>(1.0)
  const [colorAlpha, setColorAlpha] = useState<number>(1.0)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Load color history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(COLOR_HISTORY_KEY)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        if (Array.isArray(parsedHistory)) {
          setColorHistory(parsedHistory)
        }
      }
    } catch (error) {
      console.warn('Failed to load color history:', error)
    }
  }, [])

  // Save color history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(colorHistory))
    } catch (error) {
      console.warn('Failed to save color history:', error)
    }
  }, [colorHistory])

  // Cleanup background image URL when component unmounts
  useEffect(() => {
    return () => {
      if (selectedBackgroundImage) {
        URL.revokeObjectURL(selectedBackgroundImage)
      }
    }
  }, [selectedBackgroundImage])

  const generateAlphaPreview = useCallback(async () => {
    if (!selectedBackgroundImage || !previewCanvasRef.current) return

    setIsGeneratingPreview(true)

    try {
      const canvas = previewCanvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setIsGeneratingPreview(false)
        return
      }

      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        canvas.width = 288
        canvas.height = 216

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = imageAlpha
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1.0

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setPreviewImageUrl((prevUrl) => {
                if (prevUrl) {
                  URL.revokeObjectURL(prevUrl)
                }
                return URL.createObjectURL(blob)
              })
            }
            setIsGeneratingPreview(false)
          },
          'image/png',
          0.9,
        )
      }

      img.onerror = () => {
        console.warn('Failed to load image for preview.')
        setIsGeneratingPreview(false)
      }

      img.src = selectedBackgroundImage
    } catch (error) {
      console.warn('Failed to generate alpha preview:', error)
      setIsGeneratingPreview(false)
    }
  }, [selectedBackgroundImage, imageAlpha])

  // Generate preview with alpha when image or alpha changes
  useEffect(() => {
    if (selectedBackgroundImage && previewCanvasRef.current) {
      const timeoutId = setTimeout(() => {
        generateAlphaPreview()
      }, 50)

      return () => clearTimeout(timeoutId)
    }
  }, [selectedBackgroundImage, imageAlpha, generateAlphaPreview])

  // Cleanup the final preview URL when the component unmounts
  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl)
      }
    }
  }, [previewImageUrl])

  const addToHistory = (color: string) => {
    if (!color || color.length < 4) return

    setColorHistory((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== color.toLowerCase())
      return [color, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }

  const handleCustomColorApply = () => {
    if (!customColor || customColor.length < 4) return

    setBackgroundMode('color')
    setSelectedColor(customColor)
    setSelectedBackgroundImage(null)
    onBackgroundColorChange(customColor, colorAlpha)
    onBackgroundImageChange(null)
    onApplyBackgroundColor(customColor, colorAlpha)
    addToHistory(customColor)
  }

  const handlePresetColorSelect = (color: string | null) => {
    setBackgroundMode('color')
    setSelectedColor(color)
    setSelectedBackgroundImage(null)

    if (color === null) {
      setColorAlpha(0)
      onBackgroundColorChange(color, 0)
    } else {
      const newAlpha = selectedColor === null ? 1.0 : colorAlpha
      setColorAlpha(newAlpha)
      setCustomColor(color)
      onBackgroundColorChange(color, newAlpha)
    }

    onBackgroundImageChange(null)
  }

  const handlePresetColorApply = () => {
    setBackgroundMode('color')

    if (selectedColor === null) {
      setColorAlpha(0)
      onBackgroundColorChange(null, 0)
      onBackgroundImageChange(null)
      onApplyBackgroundColor(null, 0)
    } else {
      onBackgroundColorChange(selectedColor, colorAlpha)
      onBackgroundImageChange(null)
      onApplyBackgroundColor(selectedColor, colorAlpha)
    }
  }

  const handleCustomColorInputChange = (color: string) => {
    setCustomColor(color)
    if (selectedColor !== null && !PRESET_COLORS.some((preset) => preset.value === selectedColor)) {
      setSelectedColor(null)
    }
  }

  const handleHistoryColorSelect = (color: string) => {
    setBackgroundMode('color')
    setCustomColor(color)
    setSelectedColor(color)
    setSelectedBackgroundImage(null)
    onBackgroundColorChange(color, colorAlpha)
    onBackgroundImageChange(null)
    addToHistory(color)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }

    if (selectedBackgroundImage) {
      URL.revokeObjectURL(selectedBackgroundImage)
    }

    const imageUrl = URL.createObjectURL(file)
    setBackgroundImageFile(file)
    setSelectedBackgroundImage(imageUrl)
    setBackgroundMode('image')
    setSelectedColor(null)

    onBackgroundImageChange(imageUrl, imageAlpha)
    onBackgroundColorChange(null)
  }

  const handleImageApply = () => {
    if (!selectedBackgroundImage) return

    setBackgroundMode('image')
    onApplyBackgroundImage(selectedBackgroundImage, imageAlpha)
  }

  const handleRemoveImage = () => {
    if (selectedBackgroundImage) {
      URL.revokeObjectURL(selectedBackgroundImage)
    }
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl)
    }
    setSelectedBackgroundImage(null)
    setBackgroundImageFile(null)
    setPreviewImageUrl(null)
    onBackgroundImageChange(null)

    setSelectedColor(null)
    setBackgroundMode('color')
    onBackgroundColorChange(null)
  }

  const clearHistory = () => {
    setColorHistory([])
  }

  const hasUnappliedCustomColor: boolean =
    !!customColor && customColor !== selectedColor && customColor.length >= 4

  return (
    <div>
      <p className="font-['Press_Start_2P'] text-xs mb-4 opacity-70">
        Choose a background color, upload an image, or keep transparent
      </p>

      <BackgroundModeToggle
        backgroundMode={backgroundMode}
        onModeChange={setBackgroundMode}
        disabled={disabled}
      />

      {backgroundMode === 'color' ? (
        <>
          <ColorPreview selectedColor={selectedColor} alpha={colorAlpha} />

          <PresetColors
            selectedColor={selectedColor}
            backgroundMode={backgroundMode}
            onPresetColorSelect={handlePresetColorSelect}
            onPresetColorApply={handlePresetColorApply}
            hasCompletedImages={hasCompletedImages}
            disabled={disabled}
          />

          <CustomColorPicker
            customColor={customColor}
            hasUnappliedCustomColor={hasUnappliedCustomColor}
            hasCompletedImages={hasCompletedImages}
            onCustomColorInputChange={handleCustomColorInputChange}
            onCustomColorApply={handleCustomColorApply}
            disabled={disabled}
            alpha={colorAlpha}
            alphaDisabled={selectedColor === null} // Disable alpha slider when transparent preset is selected
            onAlphaChange={(alpha) => {
              setColorAlpha(alpha)
              onBackgroundColorChange(customColor, alpha)
            }}
          />

          <ColorHistory
            colorHistory={colorHistory}
            selectedColor={selectedColor}
            backgroundMode={backgroundMode}
            onHistoryColorSelect={handleHistoryColorSelect}
            onClearHistory={clearHistory}
            disabled={disabled}
          />
        </>
      ) : (
        <>
          <ImageUpload
            selectedBackgroundImage={selectedBackgroundImage}
            backgroundImageFile={backgroundImageFile}
            imageAlpha={imageAlpha}
            previewImageUrl={previewImageUrl}
            isGeneratingPreview={isGeneratingPreview}
            hasCompletedImages={hasCompletedImages}
            onImageUpload={handleImageUpload}
            onImageApply={handleImageApply}
            onRemoveImage={handleRemoveImage}
            onAlphaChange={(alpha) => {
              setImageAlpha(alpha)
              if (selectedBackgroundImage) {
                onBackgroundImageChange(selectedBackgroundImage, alpha)
              }
            }}
            disabled={disabled}
          />
        </>
      )}

      <canvas ref={previewCanvasRef} className="hidden" width={288} height={216} />
    </div>
  )
}
