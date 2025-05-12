'use client'

// Importing dynamically to avoid server-side import issues
import { FileTypeResult } from 'file-type'

/**
 * Interface for our file-type detection result
 */
export interface FileTypeDetectionResult {
  label: string
  description?: string
  mime_type: string
  group?: string
  extensions?: string[]
  isSupported: boolean
  rawResult?: FileTypeResult
}

/**
 * FileTypeEngine for file type detection using the file-type package
 */
export class FileTypeEngine {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private fileTypeModule: any = null
  private initialized = false
  private initializing = false

  /**
   * Initialize the file-type engine if not already done
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true
    if (this.initializing) {
      // Wait for initialization to complete if already in progress
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return this.initialized
    }

    this.initializing = true
    try {
      // Dynamic import to avoid server-side import issues
      this.fileTypeModule = await import('file-type')
      this.initialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize file-type package:', error)
      return false
    } finally {
      this.initializing = false
    }
  }

  /**
   * Detect the file type using file-type package
   * @param file The file to analyze
   */
  async detectFileType(file: File): Promise<FileTypeDetectionResult | null> {
    try {
      if (!this.initialized) {
        const success = await this.initialize()
        if (!success) {
          throw new Error('Failed to initialize file-type engine')
        }
      }

      // Read file as ArrayBuffer
      const buffer = await file.arrayBuffer()

      // Process with file-type
      const result = await this.fileTypeModule.fileTypeFromBuffer(buffer)

      if (!result) {
        // No detection - file-type couldn't identify the file
        return {
          label: 'unknown',
          mime_type: 'application/octet-stream',
          description: 'Unknown binary data',
          group: 'unknown',
          extensions: [],
          isSupported: false,
        }
      }

      return {
        label: result.ext,
        mime_type: result.mime,
        description: this.getDescriptionFromMime(result.mime),
        group: this.getGroupFromMime(result.mime),
        extensions: [result.ext],
        isSupported: true,
        rawResult: result,
      }
    } catch (error) {
      console.error(`Error detecting file type with file-type:`, error)
      return null
    }
  }

  /**
   * Get a human-readable description from MIME type
   * @param mimeType The MIME type
   * @returns A human-readable description
   */
  private getDescriptionFromMime(mimeType: string): string {
    const mimeDescriptions: Record<string, string> = {
      'application/pdf': 'PDF document',
      'application/zip': 'ZIP archive',
      'application/x-rar-compressed': 'RAR archive',
      'application/x-7z-compressed': '7-Zip archive',
      'application/x-tar': 'TAR archive',
      'application/x-gzip': 'GZIP archive',
      'image/jpeg': 'JPEG image',
      'image/png': 'PNG image',
      'image/gif': 'GIF image',
      'image/webp': 'WebP image',
      'image/svg+xml': 'SVG image',
      'audio/mpeg': 'MP3 audio',
      'audio/wav': 'WAV audio',
      'audio/ogg': 'OGG audio',
      'audio/flac': 'FLAC audio',
      'video/mp4': 'MP4 video',
      'video/quicktime': 'MOV video',
      'video/webm': 'WebM video',
      'video/x-matroska': 'MKV video',
      'application/msword': 'Microsoft Word document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'Microsoft Word document (DOCX)',
      'application/vnd.ms-excel': 'Microsoft Excel spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'Microsoft Excel spreadsheet (XLSX)',
      'application/vnd.ms-powerpoint': 'Microsoft PowerPoint presentation',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        'Microsoft PowerPoint presentation (PPTX)',
      'text/plain': 'Plain text document',
      'text/html': 'HTML document',
      'text/css': 'CSS stylesheet',
      'application/javascript': 'JavaScript code',
      'application/json': 'JSON document',
      'application/xml': 'XML document',
    }

    const category = mimeType.split('/')[0]
    const subtype = mimeType.split('/')[1]

    if (mimeDescriptions[mimeType]) {
      return mimeDescriptions[mimeType]
    } else if (category === 'application') {
      return `${subtype.toUpperCase()} file`
    } else if (category === 'image') {
      return `${subtype.toUpperCase()} image`
    } else if (category === 'audio') {
      return `${subtype.toUpperCase()} audio`
    } else if (category === 'video') {
      return `${subtype.toUpperCase()} video`
    } else if (category === 'text') {
      return `${subtype.toUpperCase()} text`
    } else {
      return `${mimeType} file`
    }
  }

  /**
   * Get a file group from its MIME type
   * @param mimeType The MIME type
   * @returns The file group (video, audio, image, etc.)
   */
  private getGroupFromMime(mimeType: string): string {
    const category = mimeType.split('/')[0]
    const subtype = mimeType.split('/')[1]

    if (category === 'image') {
      return 'image'
    } else if (category === 'audio') {
      return 'audio'
    } else if (category === 'video') {
      return 'video'
    } else if (category === 'text') {
      if (subtype === 'html' || subtype === 'css' || subtype === 'javascript') {
        return 'code'
      }
      return 'text'
    } else if (category === 'application') {
      if (
        ['zip', 'x-rar-compressed', 'x-7z-compressed', 'x-tar', 'x-gzip', 'x-bzip2'].includes(
          subtype,
        )
      ) {
        return 'archive'
      } else if (
        [
          'pdf',
          'msword',
          'vnd.openxmlformats-officedocument.wordprocessingml.document',
          'vnd.ms-excel',
          'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'vnd.ms-powerpoint',
          'vnd.openxmlformats-officedocument.presentationml.presentation',
        ].includes(subtype)
      ) {
        return 'document'
      } else if (['javascript', 'json', 'xml'].includes(subtype)) {
        return 'code'
      }
    }

    return 'unknown'
  }
}

export default FileTypeEngine
