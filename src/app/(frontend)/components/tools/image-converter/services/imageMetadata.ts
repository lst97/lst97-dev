'use client'

import * as ExifReader from 'exifreader'
import { GpsMetadata, ImageDimensions, ImageMetadata, ProcessingFile } from '../types'

// Define interfaces for ExifReader tag objects
interface ExifTag {
  id?: number
  value: unknown
  description?: string
}

/**
 * Extracts image dimensions and metadata from an image file
 * @param file The image file to extract metadata from
 * @returns A promise that resolves to the image dimensions and metadata
 */
export async function extractImageMetadata(
  file: File,
): Promise<{ dimensions: ImageDimensions; metadata: ImageMetadata | null }> {
  try {
    // Load the tags with expanded option to keep groups separate
    const tags = await ExifReader.load(file, { expanded: true, async: true })

    // Initialize metadata object with basic structure
    const metadata: ImageMetadata = {
      technical: {},
      descriptive: {},
      gps: null,
    }

    // Try to extract dimensions from EXIF or file information
    let width = 0
    let height = 0

    // First try to get dimensions from Exif metadata (more accurate for original image)
    if (tags.exif && tags.exif.PixelXDimension && tags.exif.PixelYDimension) {
      width =
        typeof tags.exif.PixelXDimension.value === 'number' ? tags.exif.PixelXDimension.value : 0
      height =
        typeof tags.exif.PixelYDimension.value === 'number' ? tags.exif.PixelYDimension.value : 0
    }
    // Fallback to file dimensions if available
    else if (tags.file && tags.file['Image Width'] && tags.file['Image Height']) {
      width =
        typeof tags.file['Image Width'].value === 'number' ? tags.file['Image Width'].value : 0
      height =
        typeof tags.file['Image Height'].value === 'number' ? tags.file['Image Height'].value : 0
    }

    // Extract technical information (primarily from Exif)
    if (tags.exif) {
      // Date and time
      if (tags.exif.DateTimeOriginal) {
        metadata.technical.dateTimeOriginal = String(
          tags.exif.DateTimeOriginal.description || tags.exif.DateTimeOriginal.value,
        )
      } else if (tags.exif.DateTime) {
        metadata.technical.dateTimeOriginal = String(
          tags.exif.DateTime.description || tags.exif.DateTime.value,
        )
      }

      // Camera make and model
      if (tags.exif.Make) {
        metadata.technical.make = String(tags.exif.Make.description || tags.exif.Make.value)
      }
      if (tags.exif.Model) {
        metadata.technical.model = String(tags.exif.Model.description || tags.exif.Model.value)
      }

      // Resolution
      if (tags.exif.XResolution) {
        metadata.technical.xResolution =
          tags.exif.XResolution.description ||
          (Array.isArray(tags.exif.XResolution.value)
            ? `${tags.exif.XResolution.value[0]}/${tags.exif.XResolution.value[1]}`
            : tags.exif.XResolution.value)
      }
      if (tags.exif.YResolution) {
        metadata.technical.yResolution =
          tags.exif.YResolution.description ||
          (Array.isArray(tags.exif.YResolution.value)
            ? `${tags.exif.YResolution.value[0]}/${tags.exif.YResolution.value[1]}`
            : tags.exif.YResolution.value)
      }
      if (tags.exif.ResolutionUnit) {
        metadata.technical.resolutionUnit = String(
          tags.exif.ResolutionUnit.description || tags.exif.ResolutionUnit.value,
        )
      }

      // Exposure settings
      if (tags.exif.FNumber) {
        metadata.technical.aperture =
          tags.exif.FNumber.description ||
          (Array.isArray(tags.exif.FNumber.value)
            ? `${tags.exif.FNumber.value[0]}/${tags.exif.FNumber.value[1]}`
            : tags.exif.FNumber.value)
      }
      if (tags.exif.ExposureTime) {
        metadata.technical.shutterSpeed =
          tags.exif.ExposureTime.description ||
          (Array.isArray(tags.exif.ExposureTime.value)
            ? `${tags.exif.ExposureTime.value[0]}/${tags.exif.ExposureTime.value[1]}`
            : tags.exif.ExposureTime.value)
      }
      if (tags.exif.ISOSpeedRatings) {
        metadata.technical.iso =
          tags.exif.ISOSpeedRatings.description ||
          (Array.isArray(tags.exif.ISOSpeedRatings.value)
            ? tags.exif.ISOSpeedRatings.value[0]
            : tags.exif.ISOSpeedRatings.value)
      }
      if (tags.exif.FocalLength) {
        metadata.technical.focalLength =
          tags.exif.FocalLength.description ||
          (Array.isArray(tags.exif.FocalLength.value)
            ? `${tags.exif.FocalLength.value[0]}/${tags.exif.FocalLength.value[1]}`
            : tags.exif.FocalLength.value)
      }

      // Orientation
      if (tags.exif.Orientation) {
        metadata.technical.orientation = String(
          tags.exif.Orientation.description || tags.exif.Orientation.value,
        )
      }

      // Flash
      if (tags.exif.Flash) {
        metadata.technical.flash = String(tags.exif.Flash.description || tags.exif.Flash.value)
      }

      // Software
      if (tags.exif.Software) {
        metadata.technical.software = String(
          tags.exif.Software.description || tags.exif.Software.value,
        )
      }
    }

    // Extract GPS information (if available)
    if (tags.gps) {
      const gpsInfo: GpsMetadata = {}

      // When using ExifReader with expanded:true, GPS coordinates are pre-calculated and available directly
      if (typeof tags.gps.Latitude !== 'undefined') {
        gpsInfo.latitude = tags.gps.Latitude
        gpsInfo.latitudeRef = 'N'
        if (tags.gps.Latitude < 0) {
          gpsInfo.latitude = Math.abs(tags.gps.Latitude)
          gpsInfo.latitudeRef = 'S'
        }
      }

      if (typeof tags.gps.Longitude !== 'undefined') {
        gpsInfo.longitude = tags.gps.Longitude
        gpsInfo.longitudeRef = 'E'
        if (tags.gps.Longitude < 0) {
          gpsInfo.longitude = Math.abs(tags.gps.Longitude)
          gpsInfo.longitudeRef = 'W'
        }
      }

      if (typeof tags.gps.Altitude !== 'undefined') {
        gpsInfo.altitude = tags.gps.Altitude
      }

      // Only add GPS data if we have actual coordinates
      if (gpsInfo.latitude !== undefined && gpsInfo.longitude !== undefined) {
        metadata.gps = gpsInfo as GpsMetadata
      }
    }

    // Extract descriptive information (from IPTC)
    if (tags.iptc) {
      // IPTC caption/abstract
      if (tags.iptc['Caption/Abstract']) {
        metadata.descriptive.caption = String(
          tags.iptc['Caption/Abstract'].description || tags.iptc['Caption/Abstract'].value,
        )
      }

      // Keywords - special handling as it can be different formats
      if (tags.iptc.Keywords) {
        try {
          // For keywords, we'll use a simple approach by checking for array first
          const keywords = tags.iptc.Keywords as ExifTag | ExifTag[]

          if (Array.isArray(keywords)) {
            // Extract values from each item if possible
            const keywordValues: string[] = []
            for (let i = 0; i < keywords.length; i++) {
              const item = keywords[i]
              if (item) {
                // Try to get description or value
                try {
                  if (item.description) keywordValues.push(String(item.description))
                  else if (item.value) keywordValues.push(String(item.value))
                  else if (typeof item === 'string') keywordValues.push(item)
                  else keywordValues.push(String(item))
                } catch (err) {
                  console.warn('Error processing keyword item:', err)
                }
              }
            }

            if (keywordValues.length > 0) {
              metadata.descriptive.keywords = keywordValues
            }
          } else if (keywords && (keywords.description || keywords.value)) {
            // Single keyword object with description/value
            metadata.descriptive.keywords = String(keywords.description || keywords.value)
          } else if (keywords && typeof keywords === 'string') {
            // Direct string value
            metadata.descriptive.keywords = keywords
          }
        } catch (err) {
          console.warn('Error processing IPTC Keywords:', err)
        }
      }

      // Creator/author
      if (tags.iptc['By-line']) {
        metadata.descriptive.creator = String(
          tags.iptc['By-line'].description || tags.iptc['By-line'].value,
        )
      }

      // Copyright
      if (tags.iptc['Copyright Notice']) {
        metadata.descriptive.copyright = String(
          tags.iptc['Copyright Notice'].description || tags.iptc['Copyright Notice'].value,
        )
      }

      // Headline
      if (tags.iptc.Headline) {
        metadata.descriptive.headline = String(
          tags.iptc.Headline.description || tags.iptc.Headline.value,
        )
      }

      // Location information
      if (tags.iptc.City) {
        metadata.descriptive.city = String(tags.iptc.City.description || tags.iptc.City.value)
      }
      if (tags.iptc['Province/State']) {
        metadata.descriptive.state = String(
          tags.iptc['Province/State'].description || tags.iptc['Province/State'].value,
        )
      }
      if (tags.iptc['Country/Primary Location Name']) {
        metadata.descriptive.country = String(
          tags.iptc['Country/Primary Location Name'].description ||
            tags.iptc['Country/Primary Location Name'].value,
        )
      }
    }

    // XMP data (may overlap with IPTC but can contain additional info)
    if (tags.xmp) {
      // Only set if not already set from IPTC
      if (!metadata.descriptive.caption && tags.xmp.Description) {
        const xmpDescription = tags.xmp.Description as ExifTag
        metadata.descriptive.caption = String(
          xmpDescription.description ||
            (typeof xmpDescription.value === 'object'
              ? JSON.stringify(xmpDescription.value)
              : xmpDescription.value),
        )
      }

      if (!metadata.descriptive.creator && tags.xmp.Creator) {
        const xmpCreator = tags.xmp.Creator as ExifTag
        metadata.descriptive.creator = String(
          xmpCreator.description ||
            (typeof xmpCreator.value === 'object'
              ? JSON.stringify(xmpCreator.value)
              : xmpCreator.value),
        )
      }

      if (!metadata.descriptive.copyright && tags.xmp.Rights) {
        const xmpRights = tags.xmp.Rights as ExifTag
        metadata.descriptive.copyright = String(
          xmpRights.description ||
            (typeof xmpRights.value === 'object'
              ? JSON.stringify(xmpRights.value)
              : xmpRights.value),
        )
      }

      // XMP-specific tags
      if (tags.xmp.Rating) {
        const xmpRating = tags.xmp.Rating as ExifTag
        const ratingValue = xmpRating.description || xmpRating.value
        metadata.descriptive.rating =
          typeof ratingValue === 'number' ? ratingValue : String(ratingValue)
      }

      // Additional XMP location data
      if (!metadata.descriptive.city && tags.xmp.City) {
        const xmpCity = tags.xmp.City as ExifTag
        metadata.descriptive.city = String(
          xmpCity.description ||
            (typeof xmpCity.value === 'object' ? JSON.stringify(xmpCity.value) : xmpCity.value),
        )
      }

      if (!metadata.descriptive.state && tags.xmp.State) {
        const xmpState = tags.xmp.State as ExifTag
        metadata.descriptive.state = String(
          xmpState.description ||
            (typeof xmpState.value === 'object' ? JSON.stringify(xmpState.value) : xmpState.value),
        )
      }

      if (!metadata.descriptive.country && tags.xmp.Country) {
        const xmpCountry = tags.xmp.Country as ExifTag
        metadata.descriptive.country = String(
          xmpCountry.description ||
            (typeof xmpCountry.value === 'object'
              ? JSON.stringify(xmpCountry.value)
              : xmpCountry.value),
        )
      }
    }

    // Check if metadata has any information
    const hasMetadata =
      Object.keys(metadata.technical).length > 0 ||
      Object.keys(metadata.descriptive).length > 0 ||
      metadata.gps !== null

    return {
      dimensions: { width, height },
      metadata: hasMetadata ? metadata : null,
    }
  } catch (error) {
    console.warn('Error extracting metadata:', error)
    return {
      dimensions: { width: 0, height: 0 },
      metadata: null,
    }
  }
}

/**
 * Extracts dimensions from an image using the browser's Image API
 * This is used as a fallback when EXIF extraction fails
 */
export function extractDimensionsFromImage(src: string): Promise<ImageDimensions> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
    }
    img.src = src
  })
}

/**
 * Extract metadata from a processing file using its preview URL
 */
export async function extractMetadataFromImage(
  processingFile: ProcessingFile,
): Promise<{ dimensions: ImageDimensions; metadata: ImageMetadata | null }> {
  try {
    // If we have a file, try to extract EXIF/IPTC/XMP metadata directly
    if (processingFile.file) {
      const result = await extractImageMetadata(processingFile.file)

      // If we got dimensions from metadata, use them
      if (result.dimensions.width > 0 && result.dimensions.height > 0) {
        return result
      }
    }

    // Fallback: extract dimensions from preview if metadata extraction failed to provide dimensions
    if (processingFile.previewUrl) {
      try {
        const dimensions = await extractDimensionsFromImage(processingFile.previewUrl)
        return {
          dimensions,
          metadata: null,
        }
      } catch (dimensionError) {
        console.error('Error extracting dimensions from preview:', dimensionError)
      }
    }

    // Return default values if all extraction methods failed
    return {
      dimensions: { width: 0, height: 0 },
      metadata: null,
    }
  } catch (error) {
    console.error('Error in extractMetadataFromImage:', error)
    return {
      dimensions: { width: 0, height: 0 },
      metadata: null,
    }
  }
}
