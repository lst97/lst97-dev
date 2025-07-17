'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Keystroke } from '../../types'

interface KeyboardLayoutProps {
  keystrokeMap: Keystroke[]
  gameState: {
    isActive: boolean
    isPaused: boolean
    sessionEndTime: number | null
  }
  className?: string
}

// QWERTY keyboard layout based on the provided image
const KEYBOARD_LAYOUT = [
  // Row 1: Number row
  [
    { key: '~', shift: '`', width: 'w-8' },
    { key: '!', shift: '1', width: 'w-8' },
    { key: '@', shift: '2', width: 'w-8' },
    { key: '#', shift: '3', width: 'w-8' },
    { key: '$', shift: '4', width: 'w-8' },
    { key: '%', shift: '5', width: 'w-8' },
    { key: '^', shift: '6', width: 'w-8' },
    { key: '&', shift: '7', width: 'w-8' },
    { key: '*', shift: '8', width: 'w-8' },
    { key: '(', shift: '9', width: 'w-8' },
    { key: ')', shift: '0', width: 'w-8' },
    { key: '_', shift: '-', width: 'w-8' },
    { key: '+', shift: '=', width: 'w-8' },
    { key: 'Backspace', width: 'w-16' },
  ],
  // Row 2: QWERTY row
  [
    { key: 'Tab', width: 'w-12' },
    { key: 'Q', width: 'w-8' },
    { key: 'W', width: 'w-8' },
    { key: 'E', width: 'w-8' },
    { key: 'R', width: 'w-8' },
    { key: 'T', width: 'w-8' },
    { key: 'Y', width: 'w-8' },
    { key: 'U', width: 'w-8' },
    { key: 'I', width: 'w-8' },
    { key: 'O', width: 'w-8' },
    { key: 'P', width: 'w-8' },
    { key: '{', shift: '[', width: 'w-8' },
    { key: '}', shift: ']', width: 'w-8' },
    { key: '|', shift: '\\', width: 'w-8' },
  ],
  // Row 3: ASDF row
  [
    { key: 'Caps Lock', width: 'w-14' },
    { key: 'A', width: 'w-8' },
    { key: 'S', width: 'w-8' },
    { key: 'D', width: 'w-8' },
    { key: 'F', width: 'w-8' },
    { key: 'G', width: 'w-8' },
    { key: 'H', width: 'w-8' },
    { key: 'J', width: 'w-8' },
    { key: 'K', width: 'w-8' },
    { key: 'L', width: 'w-8' },
    { key: ':', shift: ';', width: 'w-8' },
    { key: '"', shift: "'", width: 'w-8' },
    { key: 'Enter', width: 'w-16' },
  ],
  // Row 4: ZXCV row
  [
    { key: 'Shift', width: 'w-20' },
    { key: 'Z', width: 'w-8' },
    { key: 'X', width: 'w-8' },
    { key: 'C', width: 'w-8' },
    { key: 'V', width: 'w-8' },
    { key: 'B', width: 'w-8' },
    { key: 'N', width: 'w-8' },
    { key: 'M', width: 'w-8' },
    { key: '<', shift: ',', width: 'w-8' },
    { key: '>', shift: '.', width: 'w-8' },
    { key: '?', shift: '/', width: 'w-8' },
    { key: 'Shift', width: 'w-20' },
  ],
  // Row 5: Bottom row
  [
    { key: 'Ctrl', width: 'w-12' },
    { key: 'Alt', width: 'w-10' },
    { key: '[Space]', width: 'w-48' },
    { key: 'Alt', width: 'w-10' },
    { key: 'Ctrl', width: 'w-12' },
  ],
]

// Finger mapping for each key (standard touch typing)
const FINGER_MAPPING: Record<string, string> = {
  // Left hand
  Q: 'left-pinky',
  A: 'left-pinky',
  Z: 'left-pinky',
  '1': 'left-pinky',
  '!': 'left-pinky',
  '~': 'left-pinky',
  '`': 'left-pinky',
  W: 'left-ring',
  S: 'left-ring',
  X: 'left-ring',
  '2': 'left-ring',
  '@': 'left-ring',
  E: 'left-middle',
  D: 'left-middle',
  C: 'left-middle',
  '3': 'left-middle',
  '#': 'left-middle',
  R: 'left-index',
  F: 'left-index',
  V: 'left-index',
  '4': 'left-index',
  $: 'left-index',
  T: 'left-index',
  G: 'left-index',
  B: 'left-index',
  '5': 'left-index',
  '%': 'left-index',

  // Right hand
  Y: 'right-index',
  H: 'right-index',
  N: 'right-index',
  '6': 'right-index',
  '^': 'right-index',
  U: 'right-index',
  J: 'right-index',
  M: 'right-index',
  '7': 'right-index',
  '&': 'right-index',
  I: 'right-middle',
  K: 'right-middle',
  '<': 'right-middle',
  ',': 'right-middle',
  '8': 'right-middle',
  '*': 'right-middle',
  O: 'right-ring',
  L: 'right-ring',
  '>': 'right-ring',
  '.': 'right-ring',
  '9': 'right-ring',
  '(': 'right-ring',
  P: 'right-pinky',
  ':': 'right-pinky',
  ';': 'right-pinky',
  '?': 'right-pinky',
  '/': 'right-pinky',
  '0': 'right-pinky',
  ')': 'right-pinky',
  '{': 'right-pinky',
  '[': 'right-pinky',
  '"': 'right-pinky',
  "'": 'right-pinky',
  _: 'right-pinky',
  '-': 'right-pinky',
  '}': 'right-pinky',
  ']': 'right-pinky',
  '+': 'right-pinky',
  '=': 'right-pinky',
  '|': 'right-pinky',
  '\\': 'right-pinky',

  // Thumbs
  '[SPACE]': 'thumbs',
  ' ': 'thumbs',

  // Special keys (no specific finger)
  ENTER: 'right-pinky',
  BACKSPACE: 'right-pinky',
  TAB: 'left-pinky',
  'CAPS LOCK': 'left-pinky',
  SHIFT: 'pinkies',
  CTRL: 'pinkies',
  ALT: 'thumbs',
}

// Finger colors for highlighting
const FINGER_COLORS: Record<string, string> = {
  'left-pinky': 'bg-red-500/30 border-red-500/60',
  'left-ring': 'bg-orange-500/30 border-orange-500/60',
  'left-middle': 'bg-yellow-500/30 border-yellow-500/60',
  'left-index': 'bg-green-500/30 border-green-500/60',
  'right-index': 'bg-green-500/30 border-green-500/60',
  'right-middle': 'bg-blue-500/30 border-blue-500/60',
  'right-ring': 'bg-purple-500/30 border-purple-500/60',
  'right-pinky': 'bg-pink-500/30 border-pink-500/60',
  thumbs: 'bg-gray-500/30 border-gray-500/60',
  pinkies: 'bg-red-500/30 border-red-500/60',
}

export default function KeyboardLayout({
  keystrokeMap,
  gameState,
  className = '',
}: KeyboardLayoutProps) {
  // State to track currently pressed keys
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  // Add key event listeners during gameplay
  useEffect(() => {
    if (!gameState.isActive || gameState.isPaused) {
      // Clear pressed keys when game is not active
      setPressedKeys(new Set())
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      const mappedKey = mapEventKeyToKeyboardKey(key)
      if (mappedKey) {
        setPressedKeys((prev) => new Set(prev).add(mappedKey))
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      const mappedKey = mapEventKeyToKeyboardKey(key)
      if (mappedKey) {
        setPressedKeys((prev) => {
          const newSet = new Set(prev)
          newSet.delete(mappedKey)
          return newSet
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState.isActive, gameState.isPaused])

  // Map keyboard event keys to our keyboard layout keys
  const mapEventKeyToKeyboardKey = (eventKey: string): string | null => {
    // Handle special cases first
    if (eventKey === ' ') return '[Space]'
    if (eventKey === 'ENTER') return 'Enter'
    if (eventKey === 'BACKSPACE') return 'Backspace'
    if (eventKey === 'TAB') return 'Tab'
    if (eventKey === 'CAPSLOCK') return 'Caps Lock'
    if (eventKey === 'SHIFT') return 'Shift'
    if (eventKey === 'CONTROL') return 'Ctrl'
    if (eventKey === 'ALT') return 'Alt'

    // Handle symbol keys (these are what we see on the keyboard layout)
    const symbolMap: Record<string, string> = {
      '`': '~',
      '1': '!',
      '2': '@',
      '3': '#',
      '4': '$',
      '5': '%',
      '6': '^',
      '7': '&',
      '8': '*',
      '9': '(',
      '0': ')',
      '-': '_',
      '=': '+',
      '[': '{',
      ']': '}',
      '\\': '|',
      ';': ':',
      "'": '"',
      ',': '<',
      '.': '>',
      '/': '?',
    }

    // Check if it's a symbol key
    if (symbolMap[eventKey]) {
      return symbolMap[eventKey]
    }

    // For letter keys, just return the uppercase version
    if (eventKey.match(/^[A-Z]$/)) {
      return eventKey
    }

    return null
  }

  // Calculate hit frequency for each key
  const keyHitFrequency = useMemo(() => {
    const frequency: Record<string, number> = {}

    keystrokeMap.forEach((keystroke) => {
      if (keystroke.state === 'hit') {
        let key = keystroke.key.toUpperCase()
        
        // Normalize key names to match keyboard layout
        if (key === ' ' || key === 'SPACE' || key === '[SPACE]') {
          key = '[SPACE]'
        } else if (key === 'ENTER' || key === '[ENTER]') {
          key = 'ENTER'
        } else if (key === 'TAB' || key === '[TAB]') {
          key = 'TAB'
        } else if (key === 'BACKSPACE' || key === '[BACKSPACE]') {
          key = 'BACKSPACE'
        } else if (key === 'SHIFT' || key === '[SHIFT]') {
          key = 'SHIFT'
        }
        
        frequency[key] = (frequency[key] || 0) + 1
      }
    })

    return frequency
  }, [keystrokeMap])

  // Get the maximum hit count for normalization
  const maxHitCount = useMemo(() => {
    return Math.max(...Object.values(keyHitFrequency), 1)
  }, [keyHitFrequency])

  // Get hit intensity (0-1) for a key
  const getKeyIntensity = (key: string): number => {
    let normalizedKey = key.toUpperCase()
    
    // Handle special key mappings
    if (normalizedKey === '[SPACE]') {
      normalizedKey = '[SPACE]'
    } else if (normalizedKey === 'ENTER') {
      normalizedKey = 'ENTER'
    }
    
    const hitCount = keyHitFrequency[normalizedKey] || keyHitFrequency[key.toUpperCase()] || 0
    return hitCount / maxHitCount
  }

  // Get key display text
  const getKeyDisplayText = (keyData: { key: string; shift?: string }) => {
    if (keyData.key === '[Space]') return '▭'
    if (keyData.key === 'Enter') return '↵'
    if (keyData.key === 'Backspace') return '⌫'
    if (keyData.key === 'Tab') return '⇥'
    if (keyData.key === 'Caps Lock') return '⇪'
    if (keyData.key === 'Shift') return '⇧'
    if (keyData.key === 'Ctrl') return 'Ctrl'
    if (keyData.key === 'Alt') return 'Alt'
    return keyData.key
  }

  // Get finger for a key
  const getKeyFinger = (key: string): string | null => {
    return FINGER_MAPPING[key.toUpperCase()] || null
  }

  // Get background color based on display mode
  const getKeyBackgroundColor = (key: string, intensity: number): string => {
    const isGameFinished = !gameState.isActive && gameState.sessionEndTime !== null
    const isGamePaused = gameState.isPaused
    const isGamePlaying = gameState.isActive && !gameState.isPaused
    const isKeyPressed = pressedKeys.has(key)

    // During gameplay: show pressed keys with black background
    if (isGamePlaying && isKeyPressed) {
      return 'bg-black border-black'
    }

    // Show heatmap only when game is finished or paused
    if (isGameFinished || isGamePaused) {
      if (intensity === 0) return 'bg-card/80 border-border/50'
      if (intensity < 0.2) return 'bg-accent/20 border-accent/40'
      if (intensity < 0.4) return 'bg-accent/40 border-accent/60'
      if (intensity < 0.6) return 'bg-accent/60 border-accent/80'
      if (intensity < 0.8) return 'bg-accent/80 border-accent'
      return 'bg-accent border-accent shadow-[0_0_8px_rgba(181,137,0,0.5)]'
    }

    // Show finger highlighting when game is not active or before start
    const finger = getKeyFinger(key)
    if (finger && FINGER_COLORS[finger]) {
      return FINGER_COLORS[finger]
    }

    return 'bg-card/80 border-border/50'
  }

  // Get text color based on hit intensity and pressed state
  const getKeyTextColor = (key: string, intensity: number): string => {
    const isGamePlaying = gameState.isActive && !gameState.isPaused
    const isKeyPressed = pressedKeys.has(key)

    // During gameplay: show white text on pressed keys
    if (isGamePlaying && isKeyPressed) {
      return 'text-white'
    }

    if (intensity === 0) return 'text-text/70'
    if (intensity < 0.5) return 'text-text'
    return 'text-background'
  }

  // Determine display mode
  const isGameFinished = !gameState.isActive && gameState.sessionEndTime !== null
  const isGamePaused = gameState.isPaused
  const showHeatmap = isGameFinished || isGamePaused

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-sm font-['Press_Start_2P'] text-text/80 mb-2">
          {showHeatmap ? 'KEYBOARD HEATMAP' : 'FINGER POSITIONING'}
        </div>
        <div className="text-xs text-text/60">
          {showHeatmap
            ? `Darker keys = More hits (${maxHitCount > 0 ? `Max: ${maxHitCount}` : 'No hits yet'})`
            : 'Colors show which finger to use for each key'}
        </div>
      </div>

      {/* Keyboard Layout */}
      <div className="bg-background/90 backdrop-blur-sm border-2 border-border p-4 pixel-border shadow-[4px_4px_0px_#000]">
        <div className="space-y-2">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((keyData, keyIndex) => {
                const intensity = getKeyIntensity(keyData.key)
                const bgColor = getKeyBackgroundColor(keyData.key, intensity)
                const textColor = getKeyTextColor(keyData.key, intensity)
                const displayText = getKeyDisplayText(keyData)

                return (
                  <motion.div
                    key={`${rowIndex}-${keyIndex}`}
                    className={`
                      ${keyData.width} h-8 border-2 pixel-border flex items-center justify-center
                      ${bgColor} ${textColor}
                      transition-all duration-300 relative overflow-hidden
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow:
                        showHeatmap && intensity > 0.8
                          ? [
                              '0 0 0px rgba(181,137,0,0.3)',
                              '0 0 8px rgba(181,137,0,0.7)',
                              '0 0 0px rgba(181,137,0,0.3)',
                            ]
                          : '0 0 0px rgba(181,137,0,0)',
                    }}
                    transition={{
                      duration: 2,
                      repeat: showHeatmap && intensity > 0.8 ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Key text */}
                    <span className="text-xs font-['Press_Start_2P'] z-10 relative">
                      {displayText}
                    </span>

                    {/* Hit count badge for all hit keys (only in heatmap mode) */}
                    {showHeatmap && intensity > 0 && (
                      <div className="absolute -top-1 -right-1 bg-primary text-background text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-['Press_Start_2P'] text-[8px] z-20">
                        {keyHitFrequency[keyData.key.toUpperCase()] || keyHitFrequency[keyData.key] || 0}
                      </div>
                    )}

                    {/* Intensity glow effect (only in heatmap mode) */}
                    {showHeatmap && intensity > 0 && (
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/40 opacity-50"
                        style={{
                          opacity: intensity * 0.3,
                        }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          {showHeatmap ? (
            // Heatmap legend
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-card/80 border border-border/50 pixel-border"></div>
                <span className="text-xs text-text/60">No hits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent/40 border border-accent/60 pixel-border"></div>
                <span className="text-xs text-text/60">Some hits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent border border-accent pixel-border"></div>
                <span className="text-xs text-text/60">Many hits</span>
              </div>
            </>
          ) : (
            // Finger positioning legend
            <>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/30 border border-red-500/60 pixel-border"></div>
                <span className="text-xs text-text/60">Pinky</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500/30 border border-orange-500/60 pixel-border"></div>
                <span className="text-xs text-text/60">Ring</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500/30 border border-yellow-500/60 pixel-border"></div>
                <span className="text-xs text-text/60">Middle</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/30 border border-green-500/60 pixel-border"></div>
                <span className="text-xs text-text/60">Index</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-500/30 border border-gray-500/60 pixel-border"></div>
                <span className="text-xs text-text/60">Thumb</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
