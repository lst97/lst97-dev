'use client'

import MagikaEngine, { MagikaDetectionResult, isMagikaSupportedType } from './magika'
import FileTypeEngine, { FileTypeDetectionResult } from './fileType'

export interface CombinedDetectionResult {
  id: string
  fileName: string
  fileSize: number
  detectedType: {
    label: string
    description: string
    mime_type: string
    group: string
    is_text: boolean
    extensions: string[]
  }
  score: number
  confidence: 'high' | 'medium' | 'low'
  warningMessage?: string
  magikaResult?: MagikaDetectionResult
  fileTypeResult?: FileTypeDetectionResult
}

/**
 * CombinedDetector that uses both Magika and file-type for improved detection
 */
export class CombinedDetector {
  private magikaEngine: MagikaEngine
  private fileTypeEngine: FileTypeEngine
  private initialized = false

  constructor() {
    this.magikaEngine = new MagikaEngine()
    this.fileTypeEngine = new FileTypeEngine()
  }

  /**
   * Initialize both detection engines
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize both engines in parallel
      const [magikaInitialized, fileTypeInitialized] = await Promise.all([
        this.magikaEngine.initialize(),
        this.fileTypeEngine.initialize(),
      ])

      this.initialized = magikaInitialized || fileTypeInitialized
      return this.initialized
    } catch (error) {
      console.error('Failed to initialize detection engines:', error)
      return false
    }
  }

  /**
   * Detect file type using both engines for better accuracy
   * @param file The file to analyze
   * @param fileId Unique ID for the file
   */
  async detectFileType(file: File, fileId: string): Promise<CombinedDetectionResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Run both detections in parallel for better performance
    const magikaPromise = this.magikaEngine.detectFileType(file).catch(() => null)
    const fileTypePromise = this.fileTypeEngine.detectFileType(file).catch(() => null)

    // Wait for both detections to complete
    const [magikaResultOrNull, fileTypeResultOrNull] = await Promise.all([
      magikaPromise,
      fileTypePromise,
    ])

    // Convert null to undefined for type safety
    const magikaResult = magikaResultOrNull || undefined
    const fileTypeResult = fileTypeResultOrNull || undefined

    // Determine the final result based on the detections
    let label = 'unknown'
    let description = 'Unknown file type'
    let mimeType = 'application/octet-stream'
    let group = 'unknown'
    let isText = false
    let extensions: string[] = []
    let score = 0
    let confidence: 'high' | 'medium' | 'low' = 'low'
    let warningMessage: string | undefined

    // Check if engines disagree and if Magika supports the file-type detection
    const engineDisagree =
      magikaResult && fileTypeResult && magikaResult.label !== fileTypeResult.label
    const fileTypeNotSupportedByMagika =
      fileTypeResult && !isMagikaSupportedType(fileTypeResult.label)

    // Decide which engine to trust based on the above conditions
    const useFileTypeResult =
      engineDisagree && fileTypeNotSupportedByMagika && fileTypeResult.isSupported

    // If we should use file-type result
    if (useFileTypeResult) {
      label = fileTypeResult.label
      description = fileTypeResult.description || label
      mimeType = fileTypeResult.mime_type
      group = fileTypeResult.group || 'unknown'
      extensions = fileTypeResult.extensions || [label]
      // Since we're using file-type, set a reasonable score and confidence
      score = 0.85
      confidence = 'medium'
      warningMessage = 'Using file-type detection as Magika does not support this file format.'
    }
    // Otherwise use Magika if available
    else if (magikaResult) {
      label = magikaResult.label
      description = magikaResult.description || label
      mimeType = magikaResult.mime_type || `application/${label}`
      group = magikaResult.group || 'unknown'
      isText = magikaResult.is_text || false
      extensions = magikaResult.extensions || [label]
      score = magikaResult.score
      warningMessage = magikaResult.warningMessage

      // Set confidence based on Magika score
      if (score > 0.9) {
        confidence = 'high'
      } else if (score > 0.7) {
        confidence = 'medium'
      } else {
        confidence = 'low'
      }
    }

    // If file-type detected something and Magika has low confidence or didn't detect
    // and we're not already using file-type result
    if (
      fileTypeResult &&
      fileTypeResult.isSupported &&
      !useFileTypeResult &&
      (confidence === 'low' || !magikaResult)
    ) {
      // If file-type detection is different than Magika's or Magika didn't detect
      if (!magikaResult || fileTypeResult.label !== label) {
        // Check if the file-type's detected format is in Magika's scores_map
        const isInScoresMap =
          magikaResult?.rawResult?.scores_map?.[fileTypeResult.label] !== undefined

        // If the format is not in Magika's scores_map, it might be better to trust file-type
        if (!isInScoresMap) {
          label = fileTypeResult.label
          description = fileTypeResult.description || label
          mimeType = fileTypeResult.mime_type
          group = fileTypeResult.group || 'unknown'
          extensions = fileTypeResult.extensions || [label]
          // Since we're using file-type, set a reasonable score and confidence
          score = 0.85
          confidence = 'medium'

          if (!warningMessage) {
            warningMessage =
              'This file type may not be fully supported by Magika. Using alternative detection.'
          }
        }
      } else if (confidence === 'low') {
        // If both detected the same format but Magika has low confidence, increase confidence
        confidence = 'medium'
        score = Math.max(score, 0.8) // Boost score a bit
        if (warningMessage) {
          warningMessage += ' Alternative detection confirmed the file type.'
        }
      }
    }

    // If neither engine detected anything meaningful
    if (label === 'unknown' && (!magikaResult || score < 0.5)) {
      confidence = 'low'
      warningMessage =
        'Could not reliably detect the file type. The file might be corrupted or of an unsupported format.'
    }

    // Check if both engines agree
    if (magikaResult && fileTypeResult && magikaResult.label === fileTypeResult.label) {
      if (!warningMessage) {
        warningMessage = 'Verified by both detection engines.'
      } else {
        warningMessage += ' Verified by both detection engines.'
      }
      // Increase confidence if both engines agree
      confidence = 'high'
      score = Math.max(score, 0.95) // Set a very high score
    } else if (magikaResult && fileTypeResult && !useFileTypeResult) {
      // Add warning if they disagree (and we're not already using file-type result)
      if (!warningMessage) {
        warningMessage = 'Detection engines disagree on file type.'
      } else {
        warningMessage += ' Detection engines disagree on file type.'
      }
    }

    // Add file-type extension to extensions if available and not already included
    if (fileTypeResult?.extensions?.length && !extensions.includes(fileTypeResult.extensions[0])) {
      extensions = [...extensions, ...fileTypeResult.extensions]
    }

    return {
      id: fileId,
      fileName: file.name,
      fileSize: file.size,
      detectedType: {
        label,
        description,
        mime_type: mimeType,
        group,
        is_text: isText,
        extensions,
      },
      score,
      confidence,
      warningMessage,
      magikaResult,
      fileTypeResult,
    }
  }
}

export default CombinedDetector
