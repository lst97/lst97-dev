// Typo-Sync Game Components and Utilities
// Main game component exports

// Main page component
// Note: The main page component is located at src/app/(frontend)/pages/games/typo-sync/page.tsx
// Import it directly from that path when needed

// Component exports
export { default as ThreeGameRenderer } from './components/GameRenderer'
export { default as GameControls } from './components/GameControls'
export { default as GameStats } from './components/GameStats'

// Hook exports
export { useAudioAnalysis } from './hooks/useAudioAnalysis'
export { useGameLoop } from './hooks/useGameLoop'

// Service exports
export {
  audioAnalysisService,
  AudioAnalysisService,
  safeServiceCall,
} from './services/audioAnalysisService'

// Utility exports
export {
  generateCompleteKeystrokeMap,
  generateCompleteKeystrokeMapLegacy,
  generateCompleteKeystrokeMapOptimized,
  KEYSTROKE_CONFIG,
} from './utils/keystrokeGeneration'

export { mockWords, generate } from './utils/mockWords'

// Test utilities (development only)
export {
  testKeystrokeGenerationAlgorithms,
  quickValidationTest,
} from './utils/keystrokeGeneration.test'

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
