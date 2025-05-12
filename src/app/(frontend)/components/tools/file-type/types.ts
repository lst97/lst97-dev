// File processing status
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'error'

// A file being processed
export type ProcessingFile = {
  id: string
  file: File
  name: string
  size: number
  status: ProcessingStatus
  error?: string
  progressPercent?: number
}

// Import detection result types from engine
import { MagikaDetectionResult } from './engine/magika'
import { FileTypeDetectionResult } from './engine/fileType'

// Result from file type detection
export type DetectionResult = {
  id: string
  fileName: string
  fileSize: number
  detectedType: {
    label: string
    description: string
    mime_type: string
    group: string
    is_text: boolean
    extensions?: string[]
  }
  score: number
  confidence?: 'high' | 'medium' | 'low'
  warningMessage?: string
  magikaResult?: MagikaDetectionResult
  fileTypeResult?: FileTypeDetectionResult
}
