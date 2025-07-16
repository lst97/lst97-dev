import type {
  GameMapExport,
  GameMapValidationResult,
  Keystroke,
  RawGameMapData,
  TypoSyncStore,
  ZustandGetter,
  ZustandSetter,
  AnalysisResult,
  AnalysisInfo,
  MelodyNote,
} from '../types'

export interface ImportExportActions {
  importBeatMap: (beatMapData: unknown) => void
  importKeystrokeMap: (keystrokeMapData: unknown) => void
  exportGameMap: () => GameMapExport | null
  importGameMap: (
    gameMapData: GameMapExport,
    currentMusicFile?: File,
  ) => Promise<GameMapValidationResult>
  setError: (error: string | null) => void
}

export const createImportExportActions = (
  set: ZustandSetter<TypoSyncStore>,
  get: ZustandGetter<TypoSyncStore>,
): ImportExportActions => ({
  importBeatMap: (beatMapData: unknown) => {
    try {
      // Type validation and casting
      if (!beatMapData || typeof beatMapData !== 'object') {
        throw new Error('Invalid beat map data: not an object')
      }

      const rawData = beatMapData as RawGameMapData
      const beatMap = (rawData.beatMap || rawData) as RawGameMapData

      if (beatMap && Array.isArray(beatMap.beat_timestamps)) {
        const beatTimestamps = beatMap.beat_timestamps as number[]
        const melodyMap = (beatMap.melody_map || beatMap.melody_notes || []) as MelodyNote[]
        const rawAnalysisInfo = beatMap.analysis_info || {}
        const bpm = (beatMap.bpm || (rawAnalysisInfo as { tempo?: number }).tempo || 120) as number

        // Create a proper AnalysisInfo object with default values
        const analysisInfo: AnalysisInfo = {
          total_beats:
            (rawAnalysisInfo as Partial<AnalysisInfo>).total_beats || beatTimestamps.length,
          total_subdivisions:
            (rawAnalysisInfo as Partial<AnalysisInfo>).total_subdivisions ||
            beatTimestamps.length * 4,
          consolidated_notes:
            (rawAnalysisInfo as Partial<AnalysisInfo>).consolidated_notes || melodyMap.length,
          filtered_notes:
            (rawAnalysisInfo as Partial<AnalysisInfo>).filtered_notes || melodyMap.length,
          min_note_duration: (rawAnalysisInfo as Partial<AnalysisInfo>).min_note_duration || 0.1,
          subdivision_factor: (rawAnalysisInfo as Partial<AnalysisInfo>).subdivision_factor || 4,
        }

        const analysisResult: AnalysisResult = {
          beat_timestamps: beatTimestamps,
          melody_map: melodyMap,
          lyrics: '',
          analysis_info: analysisInfo,
          bpm: bpm,
        }

        set((state) => ({
          audioState: {
            ...state.audioState,
            analysisResult,
          },
        }))
      } else {
        throw new Error('Invalid beat map format')
      }
    } catch {
      get().setError('Failed to import beat map')
    }
  },

  importKeystrokeMap: (keystrokeMapData: unknown) => {
    try {
      // Type validation and casting
      if (!keystrokeMapData) {
        throw new Error('Invalid keystroke map data: null or undefined')
      }

      let keystrokeMap: unknown

      // Handle different input formats
      if (typeof keystrokeMapData === 'object' && keystrokeMapData !== null) {
        const dataObj = keystrokeMapData as { keystrokeMap?: unknown }
        keystrokeMap = dataObj.keystrokeMap || keystrokeMapData
      } else {
        keystrokeMap = keystrokeMapData
      }

      if (Array.isArray(keystrokeMap)) {
        const resetKeystrokeMap = keystrokeMap.map((k: Keystroke) => ({
          ...k,
          state: 'upcoming' as const,
          timingAccuracy: undefined,
          hitTiming: undefined,
        }))

        set((state) => ({
          audioState: {
            ...state.audioState,
            keystrokeMap: resetKeystrokeMap,
          },
        }))
      } else {
        throw new Error('Invalid keystroke map format: not an array')
      }
    } catch {
      get().setError('Failed to import keystroke map')
    }
  },

  exportGameMap: () => {
    try {
      const state = get()
      const { audioState } = state

      if (!audioState.analysisResult) {
        throw new Error('No analysis result available for export')
      }

      // Create comprehensive export data including all required components
      const exportData: GameMapExport = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        musicHash: '', // Will be set by component when music file is available
        musicName: 'Exported Map',
        musicDuration: 0, // Will be set by component when music file is available
        bpm: audioState.analysisResult.bpm,
        beat_timestamps: audioState.analysisResult.beat_timestamps,
        melody_map: audioState.analysisResult.melody_map,
        keystroke_map: audioState.keystrokeMap.length > 0 ? audioState.keystrokeMap : undefined,
        hidden_notes: audioState.hiddenNotes.length > 0 ? audioState.hiddenNotes : undefined,
        analysis_info: audioState.analysisResult.analysis_info,
        lyrics: audioState.analysisResult.lyrics,
        checksum: '', // Will be calculated by service
      }

      return exportData
    } catch (error) {
      console.error('Failed to export game map from store:', error)
      get().setError('Failed to export game map')
      return null
    }
  },

  importGameMap: async (gameMapData: GameMapExport, currentMusicFile?: File) => {
    try {
      const validationResult: GameMapValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        hashMatch: true,
        timestampErrors: [],
      }

      // Validate required fields
      const requiredFields = ['beat_timestamps', 'melody_map', 'bpm', 'analysis_info']
      for (const field of requiredFields) {
        if (!(field in gameMapData)) {
          validationResult.errors.push(`Missing required field: ${field}`)
          validationResult.isValid = false
        }
      }

      if (!validationResult.isValid) {
        return validationResult
      }

      // Validate music hash if current music file is provided
      if (currentMusicFile && gameMapData.musicHash) {
        try {
          const mapImportService = await import('../services/mapImportExportService')
          const service = mapImportService.mapImportExportService
          const currentMusicHash = await service.calculateFileHash(currentMusicFile)

          if (currentMusicHash !== gameMapData.musicHash) {
            validationResult.hashMatch = false

            // Get current music duration
            const currentMusicDuration = await service.getAudioDuration(currentMusicFile)
            const expectedDuration = gameMapData.musicDuration

            validationResult.warnings.push(
              `⚠️ Music hash mismatch detected! The current music file may not match the exported map.`,
            )
            validationResult.warnings.push(
              `Expected music duration: ${expectedDuration.toFixed(2)}s | Current music duration: ${currentMusicDuration.toFixed(2)}s`,
            )

            if (Math.abs(currentMusicDuration - expectedDuration) > 2) {
              validationResult.warnings.push(
                `⏱️ Duration difference is significant (${Math.abs(currentMusicDuration - expectedDuration).toFixed(2)}s). This may cause timing issues.`,
              )
            }
          }
        } catch (error) {
          console.error('Failed to validate music hash:', error)
          validationResult.warnings.push('Unable to validate music hash - continuing with import')
        }
      }

      // Create analysis result from imported data
      const analysisResult = {
        bpm: gameMapData.bpm,
        beat_timestamps: gameMapData.beat_timestamps,
        melody_map: gameMapData.melody_map,
        analysis_info: gameMapData.analysis_info,
        lyrics: gameMapData.lyrics || '',
      }

      // Import the data into store
      set((state) => ({
        audioState: {
          ...state.audioState,
          analysisResult,
          keystrokeMap: gameMapData.keystroke_map
            ? gameMapData.keystroke_map.map((k: Keystroke) => ({
                ...k,
                state: 'upcoming' as const,
                timingAccuracy: undefined,
                hitTiming: undefined,
              }))
            : [],
          hiddenNotes: gameMapData.hidden_notes || [],
        },
      }))

      if (gameMapData.keystroke_map) {
        validationResult.warnings.push('✅ Keystroke map imported successfully')
      }
      if (gameMapData.hidden_notes) {
        validationResult.warnings.push('✅ Hidden notes imported successfully')
      }

      return validationResult
    } catch (error) {
      console.error('Failed to import game map:', error)
      get().setError('Failed to import game map')
      return {
        isValid: false,
        errors: [`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        hashMatch: false,
        timestampErrors: [],
      }
    }
  },

  setError: (error: string | null) => {
    set(() => ({
      error,
    }))
  },
})
