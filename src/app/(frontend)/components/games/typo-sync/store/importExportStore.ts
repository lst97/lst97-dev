export interface ImportExportActions {
  importBeatMap: (beatMapData: any) => void
  importKeystrokeMap: (keystrokeMapData: any) => void
  setError: (error: string | null) => void
}

export const createImportExportActions = (set: any, get: any): ImportExportActions => ({
  importBeatMap: (beatMapData: any) => {
    try {
      const beatMap = beatMapData.beatMap || beatMapData
      
      if (beatMap && Array.isArray(beatMap.beat_timestamps)) {
        const beatTimestamps = beatMap.beat_timestamps
        const melodyMap = beatMap.melody_map || beatMap.melody_notes || []
        const analysisInfo = beatMap.analysis_info || {}
        const bpm = beatMap.bpm || analysisInfo.tempo || 120

        set((state: any) => ({
          audioState: {
            ...state.audioState,
            analysisResult: {
              beat_timestamps: beatTimestamps,
              melody_map: melodyMap,
              lyrics: '',
              analysis_info: analysisInfo,
              bpm: bpm,
            },
          },
        }))
      } else {
        throw new Error('Invalid beat map format')
      }
    } catch (error) {
      get().setError('Failed to import beat map')
    }
  },

  importKeystrokeMap: (keystrokeMapData: any) => {
    try {
      const keystrokeMap = keystrokeMapData.keystrokeMap || keystrokeMapData

      if (Array.isArray(keystrokeMap)) {
        const resetKeystrokeMap = keystrokeMap.map((k: any) => ({
          ...k,
          state: 'upcoming' as const,
          timingAccuracy: undefined,
          hitTiming: undefined,
        }))

        set((state: any) => ({
          audioState: {
            ...state.audioState,
            keystrokeMap: resetKeystrokeMap,
          },
        }))
      } else {
        throw new Error('Invalid keystroke map format')
      }
    } catch (error) {
      get().setError('Failed to import keystroke map')
    }
  },

  setError: (error: string | null) => {
    set((state: any) => ({
      error,
    }))
  },
})