import type {
  GameMapExport,
  GameMapValidationResult,
  AnalysisResult,
  Keystroke,
  HiddenNote,
  MelodyNote,
  RawGameMapData,
} from '../types'

/**
 * Map Import/Export Service
 * Handles importing and exporting game maps with validation
 */
export class MapImportExportService {
  private readonly VERSION = '1.0.0'

  /**
   * Calculate SHA-256 hash of audio file
   * @param file - Audio file to hash
   * @returns Promise with hex hash string
   */
  async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Calculate checksum for game map data
   * @param data - Game map data (without checksum)
   * @returns Promise with hex checksum string
   */
  async calculateChecksum(data: Omit<GameMapExport, 'checksum'>): Promise<string> {
    const jsonString = JSON.stringify(data, null, 0)
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(jsonString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Export game map with analysis result and keystroke data
   * @param analysisResult - Analysis result from server
   * @param keystrokeMap - Generated keystroke map (optional)
   * @param hiddenNotes - Generated hidden notes (optional)
   * @param musicFile - Original music file for hash calculation
   * @param musicName - Name of the music file
   * @returns Promise with game map export data
   */
  async exportGameMap(
    analysisResult: AnalysisResult,
    keystrokeMap: Keystroke[] | null = null,
    hiddenNotes: HiddenNote[] | null = null,
    musicFile: File,
    musicName: string,
  ): Promise<GameMapExport> {
    const musicHash = await this.calculateFileHash(musicFile)
    const musicDuration = await this.getAudioDuration(musicFile)

    const exportData: Omit<GameMapExport, 'checksum'> = {
      version: this.VERSION,
      exportedAt: new Date().toISOString(),
      musicHash,
      musicName,
      musicDuration,
      bpm: analysisResult.bpm,
      beat_timestamps: analysisResult.beat_timestamps,
      melody_map: analysisResult.melody_map,
      analysis_info: analysisResult.analysis_info,
      lyrics: analysisResult.lyrics,
    }

    // Add optional keystroke data
    if (keystrokeMap) {
      exportData.keystroke_map = keystrokeMap
    }
    if (hiddenNotes) {
      exportData.hidden_notes = hiddenNotes
    }

    const checksum = await this.calculateChecksum(exportData)

    return {
      ...exportData,
      checksum,
    }
  }

  /**
   * Validate imported game map data
   * @param gameMapData - Imported game map data
   * @param musicFile - Current music file for hash comparison (optional)
   * @returns Promise with validation result
   */
  async validateGameMap(gameMapData: unknown, musicFile?: File): Promise<GameMapValidationResult> {
    const result: GameMapValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      hashMatch: true,
      timestampErrors: [],
    }

    // Check if data is valid JSON object
    if (!gameMapData || typeof gameMapData !== 'object') {
      result.errors.push('Invalid game map data: not a valid JSON object')
      result.isValid = false
      return result
    }

    // Check required fields
    const requiredFields = [
      'version',
      'exportedAt',
      'musicHash',
      'musicName',
      'musicDuration',
      'bpm',
      'beat_timestamps',
      'melody_map',
      'analysis_info',
      'checksum',
    ]

    for (const field of requiredFields) {
      if (!(field in gameMapData)) {
        result.errors.push(`Missing required field: ${field}`)
        result.isValid = false
      }
    }

    if (!result.isValid) return result

    // Validate checksum
    const rawData = gameMapData as RawGameMapData
    const checksum = rawData.checksum
    const { checksum: _, ...dataWithoutChecksum } = rawData
    const calculatedChecksum = await this.calculateChecksum(
      dataWithoutChecksum as Omit<GameMapExport, 'checksum'>,
    )
    if (checksum !== calculatedChecksum) {
      result.errors.push('Invalid checksum: data may be corrupted')
      result.isValid = false
    }

    // Validate music hash if music file is provided
    if (musicFile) {
      const currentMusicHash = await this.calculateFileHash(musicFile)
      const expectedHash = rawData.musicHash
      if (currentMusicHash !== expectedHash) {
        result.hashMatch = false
        result.warnings.push(
          `Warning: The uploaded audio might not be the correct one for this map file, you may experience some timing issues.`,
        )
      }
    }

    // Validate data types and structure
    const data = rawData
    if (typeof data.bpm !== 'number' || (data.bpm as number) <= 0) {
      result.errors.push('Invalid BPM: must be a positive number')
      result.isValid = false
    }

    if (!Array.isArray(data.beat_timestamps)) {
      result.errors.push('Invalid beat_timestamps: must be an array')
      result.isValid = false
    }

    if (!Array.isArray(data.melody_map)) {
      result.errors.push('Invalid melody_map: must be an array')
      result.isValid = false
    }

    if (typeof data.analysis_info !== 'object' || data.analysis_info === null) {
      result.errors.push('Invalid analysis_info: must be an object')
      result.isValid = false
    }

    if (result.isValid) {
      // Type assertions for validated data
      const beatTimestamps = data.beat_timestamps as number[]
      const melodyMap = data.melody_map as MelodyNote[]
      const musicDuration = data.musicDuration as number

      // Validate timestamp constraints
      const maxTimestamp = Math.max(
        ...beatTimestamps,
        ...melodyMap.map((note) => note.start_time + note.duration),
      )

      if (maxTimestamp > musicDuration) {
        result.timestampErrors.push(
          `Timestamp exceeds music duration: ${maxTimestamp}s > ${musicDuration}s`,
        )
        result.isValid = false
      }

      // Validate keystroke map if present
      if (data.keystroke_map) {
        if (!Array.isArray(data.keystroke_map)) {
          result.errors.push('Invalid keystroke_map: must be an array')
          result.isValid = false
        } else {
          const keystrokeMap = data.keystroke_map as Keystroke[]
          const keystrokeMaxTime = Math.max(...keystrokeMap.map((ks) => ks.startTime + ks.duration))
          if (keystrokeMaxTime > musicDuration) {
            result.timestampErrors.push(
              `Keystroke timestamp exceeds music duration: ${keystrokeMaxTime}s > ${musicDuration}s`,
            )
            result.isValid = false
          }
        }
      }

      // Validate hidden notes if present
      if (data.hidden_notes) {
        if (!Array.isArray(data.hidden_notes)) {
          result.errors.push('Invalid hidden_notes: must be an array')
          result.isValid = false
        } else {
          const hiddenNotes = data.hidden_notes as HiddenNote[]
          const hiddenMaxTime = Math.max(...hiddenNotes.map((hn) => hn.startTime + hn.duration))
          if (hiddenMaxTime > musicDuration) {
            result.timestampErrors.push(
              `Hidden note timestamp exceeds music duration: ${hiddenMaxTime}s > ${musicDuration}s`,
            )
            result.isValid = false
          }
        }
      }
    }

    return result
  }

  /**
   * Import game map from JSON string
   * @param jsonString - JSON string containing game map data
   * @param musicFile - Current music file for validation (optional)
   * @returns Promise with validation result and parsed data
   */
  async importGameMapFromJSON(
    jsonString: string,
    musicFile?: File,
  ): Promise<{ validationResult: GameMapValidationResult; gameMapData: GameMapExport | null }> {
    try {
      const gameMapData = JSON.parse(jsonString)
      const validationResult = await this.validateGameMap(gameMapData, musicFile)
      return {
        validationResult,
        gameMapData: validationResult.isValid ? gameMapData : null,
      }
    } catch (error) {
      return {
        validationResult: {
          isValid: false,
          errors: [`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: [],
          hashMatch: false,
          timestampErrors: [],
        },
        gameMapData: null,
      }
    }
  }

  /**
   * Export game map to JSON string
   * @param gameMapData - Game map data to export
   * @returns JSON string
   */
  exportGameMapToJSON(gameMapData: GameMapExport): string {
    return JSON.stringify(gameMapData, null, 2)
  }

  /**
   * Create analysis result from imported game map
   * @param gameMapData - Imported game map data
   * @returns Analysis result compatible with existing system
   */
  createAnalysisResultFromImport(gameMapData: GameMapExport): AnalysisResult {
    return {
      bpm: gameMapData.bpm,
      beat_timestamps: gameMapData.beat_timestamps,
      melody_map: gameMapData.melody_map,
      analysis_info: gameMapData.analysis_info,
      lyrics: gameMapData.lyrics,
    }
  }

  /**
   * Get audio duration from file
   * @param file - Audio file
   * @returns Promise with duration in seconds
   */
  async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
      }
      audio.onerror = () => {
        reject(new Error('Failed to load audio metadata'))
      }
      audio.src = URL.createObjectURL(file)
    })
  }

  /**
   * Generate downloadable file from game map data
   * @param gameMapData - Game map data
   * @param filename - Filename for download
   * @returns Blob for download
   */
  generateDownloadBlob(gameMapData: GameMapExport, _filename?: string): Blob {
    const jsonString = this.exportGameMapToJSON(gameMapData)
    return new Blob([jsonString], { type: 'application/json' })
  }

  /**
   * Trigger download of game map file
   * @param gameMapData - Game map data
   * @param filename - Filename for download (optional)
   */
  downloadGameMap(gameMapData: GameMapExport, filename?: string): void {
    const blob = this.generateDownloadBlob(gameMapData, filename)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    // Ensure filename has .json extension and remove any audio file extensions
    let downloadFilename: string
    if (filename) {
      // Remove common audio extensions and add .json
      const baseName = filename.replace(/\.(mp3|wav|m4a|ogg|flac|aac)$/i, '')
      downloadFilename = `${baseName}-map.json`
    } else {
      downloadFilename = `typo-sync-map-${gameMapData.musicName}.json`
    }

    a.download = downloadFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Create default instance
export const mapImportExportService = new MapImportExportService()
