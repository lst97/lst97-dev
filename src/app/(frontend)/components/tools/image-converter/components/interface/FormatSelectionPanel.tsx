'use client'

import React from 'react'
import { SupportedFormat } from '../../types'
import { formatIconMap } from './FormatIcons'
import { PixelSelect } from '@/frontend/components/ui/Inputs'

type FormatOption = {
  value: string
  label: string
  disabled?: boolean
}

type FormatSelectionPanelProps = {
  targetFormat: SupportedFormat
  onFormatChange: (format: SupportedFormat) => void
  sourceFormat: string
  isHeicSource: boolean
  commonFormats: SupportedFormat[]
  additionalFormats: FormatOption[]
}

export const FormatSelectionPanel: React.FC<FormatSelectionPanelProps> = ({
  targetFormat,
  onFormatChange,
  sourceFormat,
  isHeicSource,
  commonFormats,
  additionalFormats,
}) => {
  // For the dropdown, derive its value directly from targetFormat
  const selectedOtherFormat = !commonFormats.includes(targetFormat) ? targetFormat : ''

  // Handle format button selection
  const handleFormatButtonClick = (format: SupportedFormat) => {
    // Don't change if trying to convert to same format as source (except for HEIC)
    if (format === sourceFormat && !isHeicSource) return

    // Propagate the change up
    onFormatChange(format)
  }

  // Handle other format dropdown selection
  const handleOtherFormatChange = (value: string) => {
    // Clear existing format and select the new one
    if (value) {
      const newFormat = value as SupportedFormat
      // Propagate the change up
      onFormatChange(newFormat)
    } else if (commonFormats.length > 0) {
      // If clearing the dropdown, default to first common format
      const defaultFormat = commonFormats[0]
      onFormatChange(defaultFormat)
    }
  }

  return (
    <div className="space-y-4 lg:h-[650px] md:h-[450px]">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-full flex flex-col gap-4">
          <h4 className="text-lg font-['Press_Start_2P'] text-center">Target Format Selection</h4>

          {/* Common format selection as buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {commonFormats.map((format) => (
              <button
                key={format}
                onClick={() => handleFormatButtonClick(format)}
                disabled={format === sourceFormat && !isHeicSource}
                className={`p-3 flex items-center justify-center gap-2 transition-all 
              border-4 shadow-[4px_4px_0px_#000] font-['Press_Start_2P'] text-sm cursor-pointer
              ${
                format === targetFormat
                  ? 'bg-amber-100 border-border text-black border-solid shadow-[2px_2px_0px_#000] translate-x-[2px] translate-y-[2px]'
                  : 'bg-background-color/70 border-border text-text-color hover:border-accent-color hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
              }
              ${format === sourceFormat && !isHeicSource ? 'opacity-50 cursor-not-allowed' : ''}
            `}
              >
                {formatIconMap[format]}
                <span>{format.split('/')[1].toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="w-full">
          {/* Advanced format selection as dropdown */}
          {additionalFormats.length > 0 && (
            <div className="mb-4">
              <PixelSelect
                label="Other Formats"
                options={additionalFormats.map((opt) => ({
                  ...opt,
                  disabled: opt.disabled || (opt.value === sourceFormat && !isHeicSource),
                }))}
                value={selectedOtherFormat}
                onChange={handleOtherFormatChange}
                placeholder="Select other format"
                fullWidth
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
