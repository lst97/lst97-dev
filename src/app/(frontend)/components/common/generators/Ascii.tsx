'use client'
import figlet from 'figlet'
import { useEffect, useState, useCallback } from 'react'

interface AsciiTextGeneratorProps {
  text: string
}

const TYPING_BATCH_SIZE = 8
const LINE_BREAK_INTERVAL = 35
const FONT_NAME = 'Doom'

export function AsciiTextGenerator({ text }: AsciiTextGeneratorProps) {
  const [displayText, setDisplayText] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFont = useCallback(async () => {
    try {
      // @ts-expect-error - figlet/importable-fonts/Doom.js is not typed (javascript)
      const doomFont = await import('figlet/importable-fonts/Doom.js')
      figlet.parseFont(FONT_NAME, doomFont.default)
    } catch (err) {
      console.error('Font loading failed:', err)
      throw new Error('Failed to load font')
    }
  }, [])

  const generateAsciiArt = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      figlet(text, { font: FONT_NAME }, (err, data) => {
        if (err || !data) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }, [text])

  const startTypingEffect = useCallback((data: string) => {
    const textArray = data.split('')
    const displayBuffer = Array(textArray.length).fill(' ')
    const remainingIndices = Array.from(textArray.keys())

    // Pre-process line breaks
    for (let i = 0; i < textArray.length; i += LINE_BREAK_INTERVAL) {
      displayBuffer[i] = '\n'
    }

    const animate = () => {
      const updates: number[] = []
      for (let i = 0; i < TYPING_BATCH_SIZE && remainingIndices.length > 0; i++) {
        const idx = Math.floor(Math.random() * remainingIndices.length)
        updates.push(remainingIndices.splice(idx, 1)[0])
      }

      updates.forEach((index) => (displayBuffer[index] = textArray[index]))
      setDisplayText(displayBuffer.join(''))

      if (remainingIndices.length > 0) {
        requestAnimationFrame(animate)
      }
    }

    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    const initialize = async () => {
      try {
        await loadFont()
        const data = await generateAsciiArt()
        if (isMounted) {
          startTypingEffect(data)
        }
      } catch {
        if (isMounted) {
          setError('Failed to generate art')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initialize()
    return () => {
      isMounted = false
    }
  }, [text, loadFont, generateAsciiArt, startTypingEffect])

  if (error) return <div className="text-red-500 text-sm">{error}</div>
  if (isLoading) return <div className="text-gray-500 text-sm">Loading...</div>

  return (
    <div className="min-h-[100px]">
      {' '}
      {/* Reduced from h-48 */}
      <pre className="text-xs leading-none font-mono max-w-full overflow-hidden text-center pt-2">
        {displayText}
      </pre>
    </div>
  )
}
