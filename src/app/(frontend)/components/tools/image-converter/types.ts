export type SupportedFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/heic'

// Technical metadata from EXIF
export type TechnicalMetadata = {
  dateTimeOriginal?: string
  make?: string
  model?: string
  xResolution?: string | number
  yResolution?: string | number
  resolutionUnit?: string | number
  aperture?: string | number
  shutterSpeed?: string | number
  iso?: string | number
  focalLength?: string | number
  orientation?: string | number
  flash?: string | number
  software?: string
  [key: string]: string | number | undefined
}

// Descriptive metadata from IPTC/XMP
export type DescriptiveMetadata = {
  caption?: string
  keywords?: string | string[]
  creator?: string
  copyright?: string
  headline?: string
  city?: string
  state?: string
  country?: string
  rating?: string | number
  [key: string]: string | string[] | number | undefined
}

// GPS information
export type GpsMetadata = {
  latitude?: string | number
  latitudeRef?: string
  longitude?: string | number
  longitudeRef?: string
  altitude?: string | number
  [key: string]: string | number | undefined
}

// Complete metadata structure
export type ImageMetadata = {
  technical: TechnicalMetadata
  descriptive: DescriptiveMetadata
  gps: GpsMetadata | null
}

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
  convertedUrl?: string
  width?: number
  height?: number
  metadata?: ImageMetadata // Add metadata field
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
  metadata?: ImageMetadata // Add metadata field
}

export type ImageDimensions = {
  width: number
  height: number
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
  metadata?: ImageMetadata // Add metadata field
  error?: string
}
