'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useTypoSyncStore } from '../store'
import type { GameRendererProps } from '../types'
import { GameScene } from './GameScene'
import { InGameOverlay, PostGameStatsOverlay, PauseOverlay } from './ui'
import { GAME_CONFIG } from '../config'

export default function GameRenderer({
  gameConfig = GAME_CONFIG,
  onKeystrokeUpdate,
  onPlayAgain,
  onStopGame,
}: Omit<GameRendererProps, 'keystrokeMap' | 'gameState' | 'analysisResult'>) {
  const { gameState, audioState, resetGame, startGame, resumeGame, stopGame, setKeystrokeMap, setHiddenNotes } = useTypoSyncStore()
  const { keystrokeMap, analysisResult, audioBuffer, hiddenNotes } = audioState

  const [gameTime, setGameTime] = useState(0)
  const [showPostGameStats, setShowPostGameStats] = useState(false)
  const [lastShownSessionEndTime, setLastShownSessionEndTime] = useState<number | null>(null)

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

  // Detect when game ends and show post-game stats
  useEffect(() => {
    if (
      gameState.sessionEndTime &&
      !gameState.isActive &&
      !showPostGameStats &&
      gameState.sessionEndTime !== lastShownSessionEndTime
    ) {
      setShowPostGameStats(true)
      setLastShownSessionEndTime(gameState.sessionEndTime)
    }
  }, [gameState.sessionEndTime, gameState.isActive, showPostGameStats, lastShownSessionEndTime])

  // Reset tracking when a new game starts
  useEffect(() => {
    if (gameState.isActive && gameState.gameStartTime) {
      setLastShownSessionEndTime(null)
    }
  }, [gameState.isActive, gameState.gameStartTime])

  const handleCloseStats = () => {
    setShowPostGameStats(false)
    
    // Reset game state and keystroke states when closing stats
    resetGame()
    
    // Reset keystroke and hidden note states to 'upcoming' for next game
    const resetKeystrokeMap = keystrokeMap.map((k) => ({
      ...k,
      state: 'upcoming' as const,
      timingAccuracy: undefined,
      hitTiming: undefined,
    }))
    
    const resetHiddenNotes = hiddenNotes.map((h) => ({
      ...h,
      state: 'upcoming' as const,
    }))
    
    // Update the store with reset states
    setKeystrokeMap(resetKeystrokeMap)
    setHiddenNotes(resetHiddenNotes)
  }

  const handlePlayAgain = () => {
    setShowPostGameStats(false)
    // Reset the tracking variable to prevent stats from showing again
    setLastShownSessionEndTime(null)
    
    if (onPlayAgain) {
      // Use the parent's play again handler which properly sets up keyboard listeners
      onPlayAgain()
    } else {
      // Fallback to local logic (though this won't have keyboard listener)
      resetGame()
      if (audioBuffer && keystrokeMap.length > 0) {
        startGame(audioBuffer, keystrokeMap, hiddenNotes)
      }
    }
  }

  const handleShare = () => {
    const shareText = `I just played TypoSync at ${window.location.href}! Score: ${gameState.score.toLocaleString()}, Accuracy: ${Math.round((gameState.correctKeystrokes / gameState.totalKeystrokes) * 100)}%, WPM: ${Math.round(gameState.wpm)}`

    if (navigator.share) {
      navigator
        .share({
          title: 'TypoSync Game Results',
          text: shareText,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert('Results copied to clipboard!')
        })
        .catch(() => {
          alert('Unable to share results')
        })
    }
  }

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

        {/* Pause overlay */}
        <PauseOverlay
          isVisible={gameState.isActive && gameState.isPaused}
          onResume={resumeGame}
          onStop={onStopGame || stopGame}
        />

        {/* Post-game statistics overlay */}
        <PostGameStatsOverlay
          isVisible={showPostGameStats}
          gameState={gameState}
          keystrokeMap={keystrokeMap}
          audioBuffer={audioBuffer}
          onClose={handleCloseStats}
          onPlayAgain={handlePlayAgain}
          onShare={handleShare}
        />
      </div>
    </div>
  )
}
