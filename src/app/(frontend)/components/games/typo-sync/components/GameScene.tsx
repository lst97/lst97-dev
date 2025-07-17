'use client'

import React, { useMemo } from 'react'
import type { Keystroke, GameConfig, GameState } from '../types'
import {
  KeystrokeNote,
  HitZone,
  WaveHitEffect,
  HiddenNoteBurst,
  MorphingShapes,
  AnimatedGrid,
} from './3d'
import { GAME_CONFIG, CANVAS_WIDTH } from '../config'

interface GameSceneProps {
  keystrokeMap: Keystroke[]
  gameTime: number
  gameState: GameState
  beatTimestamps: number[]
  gameConfig?: GameConfig
  onKeystrokeUpdate?: (keystroke: Keystroke) => void
}

export function GameScene({
  keystrokeMap,
  gameTime,
  gameState,
  beatTimestamps,
  gameConfig = GAME_CONFIG,
  onKeystrokeUpdate,
}: GameSceneProps) {
  const visibleKeystrokes = useMemo(() => {
    const visible = keystrokeMap.filter((keystroke) => {
      if (keystroke.type === 'hidden') {
        return false
      }

      const timeDifference = keystroke.startTime - gameTime
      const distance = timeDifference * gameConfig.NOTE_SPEED_PPS
      const screenX = gameConfig.HIT_ZONE_X + distance

      if (keystroke.state === 'hit') {
        const timeSinceHit = gameTime - keystroke.startTime
        return timeSinceHit <= 2.0 // Reduced from 6 to 2 seconds for performance
      }

      const isVisible = screenX > -100 && screenX < CANVAS_WIDTH + 100
      return isVisible
    })

    // Limit concurrent keystrokes to prevent WebGL resource exhaustion
    const maxConcurrentKeystrokes = 24
    return visible.slice(0, maxConcurrentKeystrokes)
  }, [keystrokeMap, gameTime, gameConfig])

  return (
    <>
      <AnimatedGrid />

      <WaveHitEffect keystrokeMap={keystrokeMap} gameTime={gameTime} />
      <MorphingShapes keystrokeMap={keystrokeMap} gameTime={gameTime} gameState={gameState} />

      <HitZone
        keystrokeMap={keystrokeMap}
        gameTime={gameTime}
        beatTimestamps={beatTimestamps}
        gameConfig={gameConfig}
        onKeystrokeUpdate={onKeystrokeUpdate}
      />

      {visibleKeystrokes.map((keystroke) => (
        <KeystrokeNote
          key={`${Number.isFinite(keystroke.startTime) ? keystroke.startTime.toFixed(4) : '0.0000'}-${keystroke.key}-${keystroke.type}`}
          keystroke={keystroke}
          gameTime={gameTime}
          gameConfig={gameConfig}
          onKeystrokeUpdate={onKeystrokeUpdate}
        />
      ))}

      {useMemo(() => {
        return keystrokeMap
          .filter((k) => k.type === 'hidden' && k.state === 'hit')
          .map((note) => (
            <HiddenNoteBurst
              key={`burst-hidden-${note.startTime}`}
              note={note}
              gameTime={gameTime}
            />
          ))
      }, [keystrokeMap, gameTime])}
    </>
  )
}
