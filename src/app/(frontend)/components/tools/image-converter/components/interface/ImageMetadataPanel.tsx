'use client'

import React, { useState } from 'react'
import { FaImage, FaInfoCircle, FaCamera } from 'react-icons/fa'
import { BiDetail } from 'react-icons/bi'
import { formatIconMap } from './FormatIcons'
import { SupportedFormat, ImageMetadata } from '../../types'
import { formatBytes } from '@/frontend/utils/formatBytes'
import { PixelScrollArea } from '@/frontend/components/ui'

// Map technical metadata keys to more user-friendly labels
const technicalLabels: Record<string, string> = {
  dateTimeOriginal: 'Date Taken',
  make: 'Camera Make',
  model: 'Camera Model',
  xResolution: 'X Resolution',
  yResolution: 'Y Resolution',
  resolutionUnit: 'Resolution Unit',
  aperture: 'Aperture',
  shutterSpeed: 'Shutter Speed',
  iso: 'ISO',
  focalLength: 'Focal Length',
  orientation: 'Orientation',
  flash: 'Flash',
  software: 'Software',
  exposureProgram: 'Exposure Program',
  meteringMode: 'Metering Mode',
  whiteBalance: 'White Balance',
  digitalZoom: 'Digital Zoom',
  sceneType: 'Scene Type',
}

// Map descriptive metadata keys to more user-friendly labels
const descriptiveLabels: Record<string, string> = {
  caption: 'Caption',
  keywords: 'Keywords',
  creator: 'Creator',
  copyright: 'Copyright',
  headline: 'Headline',
  city: 'City',
  state: 'State/Province',
  country: 'Country',
  rating: 'Rating',
  credit: 'Credit',
  source: 'Source',
  objectName: 'Object Name',
  transmissionRef: 'Transmission Ref',
  dateCreated: 'Date Created',
}

type ImageMetadataPanelProps = {
  title: string
  filename: string
  size: number | string
  format: string
  dimensions: string | { width: number; height: number } | null
  formatMime: string
  metadata?: ImageMetadata | null
  isExtracting?: boolean
  isEstimate?: boolean
}

export const ImageMetadataPanel: React.FC<ImageMetadataPanelProps> = ({
  title,
  filename,
  size,
  format,
  dimensions,
  formatMime,
  metadata,
  isExtracting = false,
  isEstimate = false,
}) => {
  const [showMetadata, setShowMetadata] = useState<boolean>(false)
  const [metadataCategory, setMetadataCategory] = useState<'technical' | 'descriptive'>('technical')

  // Convert size if it's a number (bytes)
  const displaySize = typeof size === 'number' ? formatBytes(size) : size.toString()
  const displayFormat = format.toUpperCase()

  // Format dimensions for display
  const displayDimensions = isExtracting
    ? 'Calculating...'
    : typeof dimensions === 'string'
      ? dimensions
      : dimensions
        ? `${dimensions.width} × ${dimensions.height}`
        : 'Unknown'

  // Format metadata value based on its type
  const formatMetadataValue = (value: unknown): string => {
    if (value === undefined || value === null) return 'N/A'
    if (Array.isArray(value)) return value.join(', ')
    return String(value)
  }

  // Check if we have metadata to display
  const hasMetadata =
    metadata &&
    (Object.keys(metadata.technical || {}).length > 0 ||
      Object.keys(metadata.descriptive || {}).length > 0)

  // Get proper label for a metadata key
  const getMetadataLabel = (category: 'technical' | 'descriptive', key: string): string => {
    const labels = category === 'technical' ? technicalLabels : descriptiveLabels
    return (
      labels[key] ||
      key
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .charAt(0)
        .toUpperCase() +
        key
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .slice(1)
    )
  }

  return (
    <div className="space-y-4 w-full">
      <h4 className="text-lg font-['Press_Start_2P'] text-center">{title}</h4>
      <div className="p-4 bg-background-color/30 border-4 border-border rounded-none shadow-[4px_4px_0px_#000]">
        <div className="flex items-center justify-center p-2 mb-3 bg-background-color rounded-none border-2 border-border">
          <span className="mr-2">
            {formatMime && formatIconMap[formatMime as SupportedFormat] ? (
              formatIconMap[formatMime as SupportedFormat]
            ) : (
              <FaImage className="text-2xl" />
            )}
          </span>
          <span className="font-['Press_Start_2P'] text-sm">{displayFormat}</span>
        </div>

        <div className="space-y-3 font-['Press_Start_2P'] text-xs">
          <div className="flex justify-between items-start">
            <span className="font-medium">Filename:</span>
            <span className="ml-2 break-words text-right max-w-[200px]">{filename}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">{isEstimate ? 'Est. Size:' : 'Size:'}</span>
            <span className="flex items-center">
              {displaySize}
              {isEstimate && (
                <FaInfoCircle
                  className="ml-1 text-xs opacity-50 cursor-help"
                  title="This is an estimate. Actual size may vary depending on image content."
                />
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Format:</span>
            <span>{displayFormat}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Dimensions:</span>
            <span className="flex items-center">
              {displayDimensions}
              {isExtracting && (
                <span className="ml-2 animate-spin inline-block w-3 h-3 border-2 border-accent-color border-t-transparent rounded-full"></span>
              )}
            </span>
          </div>

          {/* Metadata toggle button */}
          {hasMetadata && (
            <div className="pt-2 mt-2 border-t-2 border-border">
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="w-full flex items-center justify-between text-accent-color hover:text-accent-color/80 transition-colors p-1 border-2 border-border bg-card-background/50"
              >
                <span className="flex items-center">
                  <FaInfoCircle className="mr-1" />
                  <span>Image Metadata</span>
                </span>
                <span>{showMetadata ? '▲' : '▼'}</span>
              </button>

              {showMetadata && (
                <div className="mt-3 space-y-3">
                  {/* Category tabs */}
                  <div className="flex text-[8px] mb-1">
                    <button
                      onClick={() => setMetadataCategory('technical')}
                      className={`flex-1 p-1 flex items-center justify-start px-2 ${
                        metadataCategory === 'technical'
                          ? 'bg-accent-color text-card-background'
                          : 'bg-card-background/50'
                      }`}
                    >
                      <FaCamera className="mr-1" /> TECHNICAL
                    </button>
                    <button
                      onClick={() => setMetadataCategory('descriptive')}
                      className={`flex-1 p-1 flex items-center justify-start px-2 ${
                        metadataCategory === 'descriptive'
                          ? 'bg-accent-color text-card-background'
                          : 'bg-card-background/50'
                      }`}
                      disabled={
                        !metadata?.descriptive || Object.keys(metadata.descriptive).length === 0
                      }
                    >
                      <BiDetail className="mr-1" /> INFO
                    </button>
                  </div>

                  {/* Technical metadata */}
                  {metadataCategory === 'technical' && metadata?.technical && (
                    <div className="bg-card-background/30 p-2 text-[10px]">
                      <PixelScrollArea
                        className="w-full"
                        maxHeight="180px"
                        type="always"
                        scrollbarClassName="opacity-100"
                        style={{
                          height: '180px',
                          minHeight: '100px',
                        }}
                      >
                        <div className="pr-4">
                          <table className="w-full border-separate border-spacing-y-2">
                            <tbody>
                              {Object.entries(metadata.technical)
                                .sort(([keyA], [keyB]) => {
                                  // Sort common camera/photo metadata first
                                  const primaryKeys = [
                                    'make',
                                    'model',
                                    'dateTimeOriginal',
                                    'software',
                                    'aperture',
                                    'shutterSpeed',
                                    'iso',
                                    'focalLength',
                                  ]
                                  const indexA = primaryKeys.indexOf(keyA)
                                  const indexB = primaryKeys.indexOf(keyB)

                                  if (indexA !== -1 && indexB !== -1) return indexA - indexB
                                  if (indexA !== -1) return -1
                                  if (indexB !== -1) return 1
                                  return keyA.localeCompare(keyB)
                                })
                                .map(([key, value]) => (
                                  <tr key={key}>
                                    <td className="font-medium pr-2 align-top w-1/3 whitespace-nowrap">
                                      {getMetadataLabel('technical', key)}:
                                    </td>
                                    <td className="break-words align-top w-2/3">
                                      {formatMetadataValue(value)}
                                    </td>
                                  </tr>
                                ))}
                              {Object.keys(metadata.technical).length === 0 && (
                                <tr>
                                  <td colSpan={2} className="text-center opacity-70">
                                    No technical metadata available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </PixelScrollArea>
                    </div>
                  )}

                  {/* Descriptive metadata */}
                  {metadataCategory === 'descriptive' && metadata?.descriptive && (
                    <div className="bg-card-background/30 p-2 text-[10px]">
                      <PixelScrollArea
                        className="w-full"
                        maxHeight="180px"
                        type="always"
                        scrollbarClassName="opacity-100"
                        style={{
                          height: '180px',
                          minHeight: '100px',
                        }}
                      >
                        <div className="pr-4">
                          <table className="w-full border-separate border-spacing-y-2">
                            <tbody>
                              {Object.entries(metadata.descriptive)
                                .sort(([keyA], [keyB]) => {
                                  // Sort important descriptive fields first
                                  const primaryKeys = [
                                    'caption',
                                    'creator',
                                    'copyright',
                                    'keywords',
                                  ]
                                  const indexA = primaryKeys.indexOf(keyA)
                                  const indexB = primaryKeys.indexOf(keyB)

                                  if (indexA !== -1 && indexB !== -1) return indexA - indexB
                                  if (indexA !== -1) return -1
                                  if (indexB !== -1) return 1
                                  return keyA.localeCompare(keyB)
                                })
                                .map(([key, value]) => (
                                  <tr key={key}>
                                    <td className="font-medium pr-2 align-top w-1/3 whitespace-nowrap">
                                      {getMetadataLabel('descriptive', key)}:
                                    </td>
                                    <td className="break-words align-top w-2/3">
                                      {formatMetadataValue(value)}
                                    </td>
                                  </tr>
                                ))}
                              {Object.keys(metadata.descriptive).length === 0 && (
                                <tr>
                                  <td colSpan={2} className="text-center opacity-70">
                                    No descriptive metadata available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </PixelScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
