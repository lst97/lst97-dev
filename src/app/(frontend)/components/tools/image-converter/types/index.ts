export type SupportedFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/heic'

export type ImageInfo = {
  id: string
  file: File
  name: string
  size: number
  type: string
  originalType?: string
  preview: string
  isConverting?: boolean
  convertError?: string
  width?: number
  height?: number
  metadata?: ImageMetadata
}

export type ProcessingFileStatus =
  | 'queued'
  | 'reading'
  | 'converting_heic'
  | 'generating_preview'
  | 'extracting_metadata'
  | 'completed'
  | 'error'

export type ProcessingFile = {
  id: string
  file: File
  status: ProcessingFileStatus
  progressPercent?: number
  previewUrl?: string
  name: string
  size: number
  type: string
  width?: number
  height?: number
  error?: string
  imageInfo?: ImageInfo
  originalType?: string
  metadata?: ImageMetadata
}

export type ImageDimensions = {
  width: number
  height: number
}

// Image metadata types
export type GpsCoordinates = {
  latitude?: number
  longitude?: number
  altitude?: number
  latitudeRef?: string
  longitudeRef?: string
  dateStamp?: string
  timeStamp?: string
}

export type ImageMetadata = {
  // Technical information
  technical: {
    make?: string
    model?: string
    software?: string
    dateTimeOriginal?: string
    dateTime?: string
    xResolution?: number
    yResolution?: number
    resolutionUnit?: string
    aperture?: number
    shutterSpeed?: string
    exposureTime?: string
    fNumber?: number
    iso?: number
    isoSpeedRatings?: number
    focalLength?: string
    focalLengthIn35mmFilm?: number
    orientation?: string
    flash?: string
    exposureProgram?: string
    meteringMode?: string
    whiteBalance?: string
    digitalZoom?: number
    digitalZoomRatio?: number
    sceneType?: string
    sceneCaptureType?: string
    contrast?: string
    saturation?: string
    sharpness?: string
    [key: string]: string | number | undefined
  }
  // Descriptive information
  descriptive: {
    title?: string
    creator?: string
    copyright?: string
    caption?: string
    keywords?: string[]
    headline?: string
    subject?: string
    city?: string
    state?: string
    country?: string
    rating?: number
    credit?: string
    source?: string
    objectName?: string
    transmissionRef?: string
    dateCreated?: string
    description?: string
    [key: string]: string[] | string | number | undefined
  }
  // GPS information
  gps?: GpsCoordinates
}

// Worker response types
export type HeicWorkerResponse = {
  success: boolean
  id: string
  convertedFile?: Blob
  error?: string
}

export type MetadataWorkerResponse = {
  success: boolean
  id: string
  dimensions: ImageDimensions
  error?: string
}
