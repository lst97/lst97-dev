'use client'

import React, { useMemo } from 'react'
import type { Keystroke, GameConfig } from '../types'
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
  gameState: any
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
        return timeSinceHit <= 6.0
      }

      const isVisible = screenX > -100 && screenX < CANVAS_WIDTH + 100
      return isVisible
    })

    return visible
  }, [keystrokeMap, gameTime, gameConfig])

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 5]} intensity={0.6} />

      {/* Animated grid background - lowest render priority */}
      <AnimatedGrid />

      <WaveHitEffect keystrokeMap={keystrokeMap} gameTime={gameTime} />
      <MorphingShapes keystrokeMap={keystrokeMap} gameTime={gameTime} gameState={gameState} />

      <mesh position={[-8, 0, 0]}>
        <boxGeometry args={[0.1, 6, 0.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.0} />
      </mesh>

      <HitZone
        keystrokeMap={keystrokeMap}
        gameTime={gameTime}
        beatTimestamps={beatTimestamps}
        gameConfig={gameConfig}
        onKeystrokeUpdate={onKeystrokeUpdate}
      />

      {visibleKeystrokes.map((keystroke) => (
        <KeystrokeNote
          key={`${keystroke.startTime.toFixed(4)}-${keystroke.key}-${keystroke.type}`}
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
