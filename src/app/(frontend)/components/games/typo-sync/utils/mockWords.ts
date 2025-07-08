import type { MockWords } from '../types'

/**
 * Mock random-words functionality for browser compatibility
 * Provides word lists of different lengths for keystroke generation
 */
export const mockWords: MockWords = {
  1: ['a', 'i'],
  2: ['is', 'at', 'be', 'go', 'up', 'me', 'we', 'my', 'no', 'so'],
  3: ['cat', 'dog', 'run', 'big', 'red', 'hot', 'new', 'old', 'yes', 'way'],
  4: ['code', 'word', 'time', 'work', 'home', 'love', 'game', 'life', 'blue', 'fast'],
  5: ['house', 'water', 'music', 'plant', 'happy', 'world', 'light', 'sound', 'green', 'quick'],
  6: [
    'coding',
    'typing',
    'rhythm',
    'melody',
    'guitar',
    'python',
    'simple',
    'bright',
    'strong',
    'smooth',
  ],
  7: [
    'amazing',
    'journey',
    'rainbow',
    'perfect',
    'science',
    'freedom',
    'kitchen',
    'machine',
    'nothing',
    'example',
  ],
  8: [
    'computer',
    'keyboard',
    'software',
    'database',
    'function',
    'variable',
    'document',
    'language',
    'creative',
    'powerful',
  ],
  9: [
    'algorithm',
    'developer',
    'interface',
    'framework',
    'generator',
    'processor',
    'structure',
    'debugging',
    'efficient',
    'beautiful',
  ],
  10: [
    'javascript',
    'programming',
    'technology',
    'automation',
    'generation',
    'application',
    'development',
    'optimization',
    'integration',
    'systematic',
  ],
  11: [
    'engineering',
    'performance',
    'interactive',
    'architecture',
    'computation',
    'specification',
    'implementation',
    'collaboration',
    'sophisticated',
    'functionality',
  ],
  12: [
    'revolutionary',
    'computational',
    'implementation',
    'sophisticated',
    'technological',
    'organizational',
    'architectural',
    'environmental',
    'international',
    'philosophical',
  ],
}

/**
 * Generate random words of specified length
 * @param options - Options for word generation
 * @returns Array of generated words
 */
export function generate(options: { maxLength?: number; minLength?: number } = {}): string[] {
  const length = options.maxLength || options.minLength || 5

  // Find the closest available word list in our mock data
  const availableLengths = Object.keys(mockWords).map(Number)
  const closestLength = availableLengths.reduce((prev, curr) => {
    return Math.abs(curr - length) < Math.abs(prev - length) ? curr : prev
  })

  const word = mockWords[closestLength][Math.floor(Math.random() * mockWords[closestLength].length)]

  return [word]
}
