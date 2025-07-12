'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useTypoSyncStore } from '../store'
import type { GameRendererProps } from '../types'
import { GameScene } from './GameScene'
import { InGameOverlay } from './ui'
import { GAME_CONFIG } from '../config'

export default function GameRenderer({
  gameConfig = GAME_CONFIG,
  onKeystrokeUpdate,
}: Omit<GameRendererProps, 'keystrokeMap' | 'gameState' | 'analysisResult'>) {
  const { gameState, audioState } = useTypoSyncStore()
  const { keystrokeMap, analysisResult } = audioState

  const [gameTime, setGameTime] = useState(0)

  const beatTimestamps = useMemo(() => {
    if (
      analysisResult &&
      analysisResult.beat_timestamps &&
      analysisResult.beat_timestamps.length > 0
    ) {
      return analysisResult.beat_timestamps
    }

    const fallbackTimestamps = keystrokeMap
      .filter((k) => k.type === 'beat')
      .map((k) => k.startTime)
      .sort((a, b) => a - b)

    if (fallbackTimestamps.length > 0) {
      return fallbackTimestamps
    }

    const basicBeats = []
    for (let i = 0; i < 120; i += 0.5) {
      basicBeats.push(i)
    }
    return basicBeats
  }, [analysisResult, keystrokeMap])

  useEffect(() => {
    if (!gameState.isActive || !gameState.gameStartTime) {
      setGameTime(0)
      return
    }

    let animationId: number

    const updateTime = () => {
      if (!gameState.isPaused) {
        const currentTime = performance.now() / 1000
        const totalGameTime = currentTime - gameState.gameStartTime! / 1000

        const pauseTime =
          gameState.isPaused && gameState.pauseStartTime
            ? currentTime - gameState.pauseStartTime / 1000
            : 0

        const effectiveGameTime = totalGameTime - gameState.totalPauseTime / 1000 - pauseTime

        setGameTime(Math.max(0, effectiveGameTime))
      }

      animationId = requestAnimationFrame(updateTime)
    }

    updateTime()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [
    gameState.isActive,
    gameState.gameStartTime,
    gameState.isPaused,
    gameState.pauseStartTime,
    gameState.totalPauseTime,
  ])

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-background to-card overflow-hidden">
      <div className="relative w-full h-full">
        <Canvas
          orthographic={true}
          camera={{
            left: -8,
            right: 8,
            top: 3,
            bottom: -3,
            position: [3, 0, 8],
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
            premultipliedAlpha: false,
          }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          frameloop="always"
          performance={{ min: 0.8 }}
        >
          <GameScene
            keystrokeMap={keystrokeMap}
            gameTime={gameTime}
            gameState={gameState}
            beatTimestamps={beatTimestamps}
            gameConfig={gameConfig}
            onKeystrokeUpdate={onKeystrokeUpdate}
          />
        </Canvas>

        <InGameOverlay gameState={gameState} keystrokeMap={keystrokeMap} gameTime={gameTime} />
      </div>
    </div>
  )
}
