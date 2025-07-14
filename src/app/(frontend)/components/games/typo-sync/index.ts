// Typo-Sync Game Components and Utilities
// Main game component exports

// Main page component
// Note: The main page component is located at src/app/(frontend)/pages/games/typo-sync/page.tsx
// Import it directly from that path when needed

// Component exports
export { default as GameRenderer } from './components/GameRenderer'
export { GameControls } from './components/ui'

// Hook exports
export { useAudioAnalysis } from './hooks'
export { useGameLoop } from './hooks'

// Service exports
export {
  audioAnalysisService,
  AudioAnalysisService,
  safeServiceCall,
} from './services/audioAnalysisService'
export {
  mapImportExportService,
  MapImportExportService,
} from './services/mapImportExportService'

// Utility exports
export {
  generateCompleteKeystrokeMap,
  generateCompleteKeystrokeMap as generateCompleteKeystrokeMapOptimized,
  KEYSTROKE_CONFIG,
} from './utils/keystrokeGeneration'

// Test utilities (development only)
// Note: Test utilities are not currently implemented

// Type exports
export type * from './types'

// Game metadata
export const GAME_METADATA = {
  id: 'typo-sync',
  title: 'Typo-Sync',
  description: 'Rhythm typing game with AI-powered beat detection',
  version: '1.0.0',
  category: 'rhythm',
  tags: ['typing', 'rhythm', 'music', 'ai', 'beat-detection', 'three.js'],
  requiresBackend: true,
  features: [
    'AI-powered audio analysis',
    'Real-time beat and melody detection',
    '3D pixel art visualization with Three.js',
    'Rhythm-based typing gameplay',
    'Hidden bonus notes for extra points',
    'Performance analytics and scoring',
    'Multiple play modes (metronome/melody)',
  ],
  technicalSpecs: {
    frontend: ['React', 'Three.js', 'TypeScript', 'Tailwind CSS'],
    backend: ['Python', 'FastAPI', 'Audio analysis AI'],
    audioFormats: ['MP3', 'WAV', 'OGG', 'M4A'],
    browsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
  },
} as const
