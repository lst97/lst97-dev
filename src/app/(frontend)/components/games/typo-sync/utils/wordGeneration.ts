import { generate } from 'random-words'

/**
 * Enhanced word generation using random-words library
 * Replaces the mockWords system with a more robust solution
 */

export interface WordGenerationOptions {
  maxLength?: number
  minLength?: number
  count?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  seed?: string
}

/**
 * Difficulty-based word length mapping
 */
const DIFFICULTY_LENGTHS = {
  easy: { min: 2, max: 5 },
  medium: { min: 4, max: 8 },
  hard: { min: 6, max: 12 },
}

/**
 * Generate words based on specified criteria
 */
export function generateWords(options: WordGenerationOptions = {}): string[] {
  const { maxLength, minLength, count = 1, difficulty, seed } = options

  // Determine length constraints
  let lengthConstraints: { min?: number; max?: number } = {}

  if (difficulty) {
    lengthConstraints = DIFFICULTY_LENGTHS[difficulty]
  } else {
    if (minLength) lengthConstraints.min = minLength
    if (maxLength) lengthConstraints.max = maxLength
  }

  // Generate words
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    try {
      const wordOptions: any = {}

      if (lengthConstraints.min && lengthConstraints.max) {
        // Try to get a word within the range
        const targetLength =
          Math.floor(Math.random() * (lengthConstraints.max - lengthConstraints.min + 1)) +
          lengthConstraints.min
        wordOptions.minLength = targetLength
        wordOptions.maxLength = targetLength
      } else if (lengthConstraints.min) {
        wordOptions.minLength = lengthConstraints.min
      } else if (lengthConstraints.max) {
        wordOptions.maxLength = lengthConstraints.max
      }

      const result = generate(wordOptions)
      const word = Array.isArray(result) ? result[0] : result

      if (word && typeof word === 'string') {
        words.push(word.toLowerCase())
      }
    } catch (error) {
      // Fallback to simple word generation if constraints fail
      const fallbackResult = generate(1)
      const fallbackWord = Array.isArray(fallbackResult) ? fallbackResult[0] : fallbackResult
      if (fallbackWord && typeof fallbackWord === 'string') {
        words.push(fallbackWord.toLowerCase())
      }
    }
  }

  return words.length > 0 ? words : ['code'] // Ultimate fallback
}

/**
 * Generate a single word for keystroke generation
 */
export function generateWordForKeystroke(targetLength: number): string {
  // Try to get a word close to the target length
  const words = generateWords({
    minLength: Math.max(1, targetLength - 2),
    maxLength: targetLength + 2,
    count: 1,
  })

  return words[0] || 'code'
}

/**
 * Generate typing practice text with multiple words
 */
export function generatePracticeText(
  options: WordGenerationOptions & { wordCount?: number } = {},
): string {
  const { wordCount = 10, ...wordOptions } = options
  const words = generateWords({ ...wordOptions, count: wordCount })
  return words.join(' ')
}

/**
 * Get word difficulty based on length and character complexity
 */
export function getWordDifficulty(word: string): 'easy' | 'medium' | 'hard' {
  const length = word.length
  const hasComplexChars = /[qwxzj]/.test(word)
  const hasDoubleLetters = /(.)\1/.test(word)

  if (length <= 4 && !hasComplexChars) return 'easy'
  if (length <= 7 && !hasDoubleLetters) return 'medium'
  return 'hard'
}
