'use client'

import React, { useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaShare, FaRedo, FaInfoCircle } from 'react-icons/fa'
import { GameState, Keystroke } from '../../../types'
import { PixelProgressBar, PixelScrollArea, Tooltip } from '@/frontend/components/ui'
import KeyboardLayout from '../KeyboardLayout'
import * as RadixTooltip from '@radix-ui/react-tooltip'

interface PostGameStatsOverlayProps {
  isVisible: boolean
  gameState: GameState
  keystrokeMap: Keystroke[]
  audioBuffer: AudioBuffer | null
  onClose: () => void
  onPlayAgain: () => void
  onShare?: () => void
}

const PostGameStatsOverlay: React.FC<PostGameStatsOverlayProps> = ({
  isVisible,
  gameState,
  keystrokeMap,
  audioBuffer,
  onClose,
  onPlayAgain,
  onShare,
}) => {
  const stats = useMemo(() => {
    const totalKeystrokes = keystrokeMap.length
    const hitKeystrokes = keystrokeMap.filter((k) => k.state === 'hit').length
    const missedKeystrokes = keystrokeMap.filter((k) => k.state === 'missed').length
    const typoKeystrokes = keystrokeMap.filter((k) => k.state === 'typo').length

    const syncHits = keystrokeMap.filter((k) => k.timingAccuracy === 'sync').length
    const earlyHits = keystrokeMap.filter((k) => k.timingAccuracy === 'early').length
    const lateHits = keystrokeMap.filter((k) => k.timingAccuracy === 'late').length

    // Use the music/audio duration from audioBuffer
    const musicDurationSeconds = audioBuffer?.duration || 0
    const minutes = Math.floor(musicDurationSeconds / 60)
    const seconds = Math.floor(musicDurationSeconds % 60)
    const musicDurationDisplay =
      musicDurationSeconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : '—'

    return {
      totalKeystrokes,
      hitKeystrokes,
      missedKeystrokes,
      typoKeystrokes,
      syncHits,
      earlyHits,
      lateHits,
      musicDuration: musicDurationDisplay,
      accuracy: totalKeystrokes > 0 ? Math.round((hitKeystrokes / totalKeystrokes) * 100) : 0,
      wpm: gameState.wpm,
      score: gameState.score,
      maxStreak: gameState.maxStreak,
      averageReactionTime: (() => {
        // Use the same calculation as InGameOverlay: convert from seconds to milliseconds
        if (
          typeof gameState.averageReactionTime === 'number' &&
          gameState.averageReactionTime > 0
        ) {
          return gameState.averageReactionTime * 1000 // Convert seconds to milliseconds
        }

        // Fallback: calculate from hitTimings if available
        if (Array.isArray(gameState.hitTimings) && gameState.hitTimings.length > 0) {
          const avgTimingSeconds =
            gameState.hitTimings.reduce((a, b) => a + Math.abs(b), 0) / gameState.hitTimings.length
          return avgTimingSeconds * 1000 // Convert to milliseconds
        }

        return null
      })(),
    }
  }, [gameState, keystrokeMap, audioBuffer?.duration])

  const keyDistribution = useMemo(() => {
    const keyStats: Record<string, { hit: number; missed: number; total: number }> = {}

    keystrokeMap.forEach((keystroke) => {
      const key = keystroke.key
      if (!keyStats[key]) {
        keyStats[key] = { hit: 0, missed: 0, total: 0 }
      }
      keyStats[key].total++
      if (keystroke.state === 'hit') {
        keyStats[key].hit++
      } else if (keystroke.state === 'missed' || keystroke.state === 'typo') {
        keyStats[key].missed++
      }
    })

    const sortedKeys = Object.entries(keyStats)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 8) // Top 8 most common keys

    const mostAccurateKey = Object.entries(keyStats)
      .filter(([, stats]) => stats.total >= 3) // Minimum 3 hits for statistical significance
      .sort(([, a], [, b]) => b.hit / b.total - a.hit / a.total)[0]

    const leastAccurateKey = Object.entries(keyStats)
      .filter(([, stats]) => stats.total >= 3)
      .sort(([, a], [, b]) => a.hit / a.total - b.hit / b.total)[0]

    return {
      topKeys: sortedKeys,
      mostAccurate: mostAccurateKey,
      leastAccurate: leastAccurateKey,
      totalUniqueKeys: Object.keys(keyStats).length,
    }
  }, [keystrokeMap])

  const getKeySymbol = useCallback((key: string) => {
    const normalizedKey = key.toLowerCase().trim()
    switch (normalizedKey) {
      case ' ':
      case 'space':
      case '[space]':
        return '⎵'
      case 'enter':
      case '[enter]':
      case 'return':
        return '↵'
      case 'tab':
      case '[tab]':
        return '⇥'
      case 'shift':
      case '[shift]':
        return '⇧'
      case 'backspace':
      case '[backspace]':
        return '⌫'
      case 'ctrl':
      case 'control':
        return 'Ctrl'
      case 'alt':
        return 'Alt'
      case 'caps':
      case 'caps lock':
        return '⇪'
      default:
        // Remove brackets if present and return uppercase
        const cleanKey = normalizedKey.replace(/[\[\]]/g, '')
        return cleanKey.length === 1 ? cleanKey.toUpperCase() : key.toUpperCase()
    }
  }, [])

  const timingDistribution = useMemo(() => {
    const total = stats.syncHits + stats.earlyHits + stats.lateHits
    if (total === 0) return { sync: 0, early: 0, late: 0 }

    return {
      sync: Math.round((stats.syncHits / total) * 100),
      early: Math.round((stats.earlyHits / total) * 100),
      late: Math.round((stats.lateHits / total) * 100),
    }
  }, [stats])

  const improvementAnalysis = useMemo(() => {
    const consistency =
      gameState.hitTimings.length > 0
        ? Math.max(
            0,
            1 -
              gameState.hitTimings.reduce((acc, timing) => acc + Math.abs(timing), 0) /
                gameState.hitTimings.length /
                100,
          )
        : 0

    const nextTargets = {
      wpm: Math.ceil(stats.wpm / 10) * 10 + (stats.wpm % 10 === 0 ? 10 : 0),
      accuracy: stats.accuracy < 95 ? Math.ceil(stats.accuracy / 5) * 5 : 100,
    }

    // Get keys that need improvement (worst accuracy)
    const keysNeedingImprovement = Object.entries(
      keyDistribution.topKeys.reduce(
        (acc, [key, keyStats]) => {
          acc[key] = keyStats
          return acc
        },
        {} as Record<string, { hit: number; missed: number; total: number }>,
      ),
    )
      .filter(([, stats]) => stats.total >= 3) // Only keys with 3+ attempts
      .sort(([, a], [, b]) => a.hit / a.total - b.hit / b.total) // Sort by accuracy (worst first)
      .slice(0, 4) // Top 4 worst
      .map(([key, keyStats]) => ({
        key,
        accuracy: Math.round((keyStats.hit / keyStats.total) * 100),
        total: keyStats.total,
      }))

    const suggestions = []
    if (stats.accuracy < 80) suggestions.push('Focus on accuracy over speed')
    if (timingDistribution.sync < 60) suggestions.push('Practice hitting keys exactly on beat')
    if (typeof stats.averageReactionTime === 'number' && stats.averageReactionTime > 200) {
      suggestions.push('Work on faster reaction times')
    }

    return { consistency, nextTargets, keysNeedingImprovement, suggestions }
  }, [gameState, stats, timingDistribution, keyDistribution])

  const getPerformanceRating = (accuracy: number, wpm: number) => {
    if (accuracy >= 95 && wpm >= 80)
      return {
        text: 'LEGENDARY',
        color: 'text-yellow-400',
        tooltip:
          'Outstanding performance! You have achieved the highest level of typing rhythm mastery with 95%+ accuracy and 80+ WPM.',
      }
    if (accuracy >= 90 && wpm >= 60)
      return {
        text: 'EXCELLENT',
        color: 'text-green-400',
        tooltip:
          'Exceptional rhythm and accuracy! You demonstrate advanced typing sync skills with 90%+ accuracy and 60+ WPM.',
      }
    if (accuracy >= 80 && wpm >= 40)
      return {
        text: 'GOOD',
        color: 'text-blue-400',
        tooltip:
          'Solid performance with good rhythm control. You have decent timing skills with 80%+ accuracy and 40+ WPM.',
      }
    if (accuracy >= 70 && wpm >= 25)
      return {
        text: 'FAIR',
        color: 'text-orange-400',
        tooltip:
          'Room for improvement in timing accuracy. Focus on hitting keys in sync with the beat.',
      }
    return {
      text: 'NEEDS PRACTICE',
      color: 'text-red-400',
      tooltip:
        'Keep practicing! Focus on accuracy first, then speed. Try starting with slower songs to improve your rhythm.',
    }
  }

  const performance = getPerformanceRating(stats.accuracy, stats.wpm)

  // Disable body scrolling when modal is visible
  useEffect(() => {
    if (isVisible) {
      // Store the current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Restore scrolling and position
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <RadixTooltip.Provider>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[90vh] min-h-[60vh] h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ height: 'min(90vh, 90%)' }}
          >
            <div className="bg-card border-4 border-border shadow-[8px_8px_0px_#000] flex flex-col h-full">
              {/* Fixed Header */}
              <div className="p-6 pb-0 border-b-2 border-border/30">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="font-['Press_Start_2P'] text-2xl mb-2">GAME COMPLETE</h1>
                    <Tooltip
                      content={performance.tooltip}
                      side="right"
                      className="min-w-64 max-w-80"
                    >
                      <div
                        className={`font-['Press_Start_2P'] text-lg ${performance.color} flex items-center gap-2 cursor-help`}
                      >
                        {performance.text}
                        <FaInfoCircle className="text-sm opacity-70" />
                      </div>
                    </Tooltip>
                  </div>
                  <button
                    onClick={onClose}
                    className="h-8 w-8 flex items-center justify-center bg-error border-2 border-border hover:bg-error/80 transition-colors shadow-[2px_2px_0px_#000]"
                  >
                    <FaTimes className="text-white text-sm" />
                  </button>
                </div>

                {/* Quick Overview */}
                <div className="bg-background/10 border-2 border-border/30 p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="font-['Press_Start_2P'] text-xs text-foreground/60 mb-1">
                        TOTAL NOTES
                      </div>
                      <div className="font-['Press_Start_2P'] text-lg">{stats.totalKeystrokes}</div>
                    </div>
                    <div>
                      <div className="font-['Press_Start_2P'] text-xs text-success/60 mb-1">
                        HIT
                      </div>
                      <div className="font-['Press_Start_2P'] text-lg text-success">
                        {stats.hitKeystrokes}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Press_Start_2P'] text-xs text-error/60 mb-1">
                        MISSED
                      </div>
                      <div className="font-['Press_Start_2P'] text-lg text-error">
                        {stats.missedKeystrokes}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Press_Start_2P'] text-xs text-warning/60 mb-1">
                        MAX STREAK
                      </div>
                      <div className="font-['Press_Start_2P'] text-lg text-warning">
                        {stats.maxStreak}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Score */}
                  <div className="bg-background/50 border-4 border-border p-4 shadow-[4px_4px_0px_#000]">
                    <div className="text-center">
                      <div className="font-['Press_Start_2P'] text-xs text-foreground/70 mb-2">
                        SCORE
                      </div>
                      <div className="font-['Press_Start_2P'] text-xl text-accent-color">
                        {stats.score.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Accuracy */}
                  <Tooltip
                    content="Percentage of notes hit correctly vs total notes attempted"
                    side="bottom"
                    className="min-w-56 max-w-72"
                  >
                    <div className="bg-background/50 border-4 border-border p-4 shadow-[4px_4px_0px_#000] cursor-help">
                      <div className="text-center">
                        <div className="font-['Press_Start_2P'] text-xs text-foreground/70 mb-2 flex items-center justify-center gap-1">
                          ACCURACY <FaInfoCircle className="text-xs opacity-50" />
                        </div>
                        <div className="font-['Press_Start_2P'] text-xl text-success">
                          {stats.accuracy}%
                        </div>
                      </div>
                    </div>
                  </Tooltip>

                  {/* WPM */}
                  <Tooltip
                    content="Words Per Minute - measure of typing speed based on successful keystrokes"
                    side="bottom"
                    className="min-w-56 max-w-72"
                  >
                    <div className="bg-background/50 border-4 border-border p-4 shadow-[4px_4px_0px_#000] cursor-help">
                      <div className="text-center">
                        <div className="font-['Press_Start_2P'] text-xs text-foreground/70 mb-2 flex items-center justify-center gap-1">
                          WPM <FaInfoCircle className="text-xs opacity-50" />
                        </div>
                        <div className="font-['Press_Start_2P'] text-xl text-info">
                          {Math.round(stats.wpm)}
                        </div>
                      </div>
                    </div>
                  </Tooltip>

                  {/* Consistency */}
                  <Tooltip
                    content="How consistent your timing is. Higher values mean more stable rhythm"
                    side="bottom"
                    className="min-w-56 max-w-72"
                  >
                    <div className="bg-background/50 border-4 border-border p-4 shadow-[4px_4px_0px_#000] cursor-help">
                      <div className="text-center">
                        <div className="font-['Press_Start_2P'] text-xs text-foreground/70 mb-2 flex items-center justify-center gap-1">
                          CONSISTENCY <FaInfoCircle className="text-xs opacity-50" />
                        </div>
                        <div className="font-['Press_Start_2P'] text-xl text-warning">
                          {Math.round(improvementAnalysis.consistency * 100)}%
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-hidden min-h-0">
                <PixelScrollArea maxHeight="55vh" className="w-full">
                  <div className="p-6 pt-6">
                    {/* Detailed Statistics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Timing Analysis */}
                      <div className="bg-background/20 border-4 border-border p-6 shadow-[4px_4px_0px_#000]">
                        <h3 className="font-['Press_Start_2P'] text-lg mb-4">TIMING BREAKDOWN</h3>

                        <div className="space-y-6">
                          {/* Sync Hits */}
                          <div>
                            <div className="flex justify-between mb-3">
                              <Tooltip
                                content="Perfect timing! Keys hit exactly in sync with the beat."
                                side="bottom"
                                className="min-w-48 max-w-64"
                              >
                                <span className="font-['Press_Start_2P'] text-sm flex items-center gap-2 cursor-help">
                                  SYNC <FaInfoCircle className="text-xs opacity-60" />
                                </span>
                              </Tooltip>
                              <span className="font-['Press_Start_2P'] text-sm">
                                {stats.syncHits} hits ({timingDistribution.sync}%)
                              </span>
                            </div>
                            <PixelProgressBar
                              value={stats.syncHits}
                              max={Math.max(stats.hitKeystrokes, 1)}
                              height={20}
                              className="w-full"
                              progressClassName="bg-success"
                            />
                          </div>

                          {/* Early Hits */}
                          <div>
                            <div className="flex justify-between mb-3">
                              <Tooltip
                                content="Hit slightly before the beat. Reduced score."
                                side="bottom"
                                className="min-w-48 max-w-64"
                              >
                                <span className="font-['Press_Start_2P'] text-sm flex items-center gap-2 cursor-help">
                                  EARLY <FaInfoCircle className="text-xs opacity-60" />
                                </span>
                              </Tooltip>
                              <span className="font-['Press_Start_2P'] text-sm">
                                {stats.earlyHits} hits ({timingDistribution.early}%)
                              </span>
                            </div>
                            <PixelProgressBar
                              value={stats.earlyHits}
                              max={Math.max(stats.hitKeystrokes, 1)}
                              height={20}
                              className="w-full"
                              progressClassName="bg-warning"
                            />
                          </div>

                          {/* Late Hits */}
                          <div>
                            <div className="flex justify-between mb-3">
                              <Tooltip
                                content="Hit slightly after the beat. Reduced score."
                                side="bottom"
                                className="min-w-48 max-w-64"
                              >
                                <span className="font-['Press_Start_2P'] text-sm flex items-center gap-2 cursor-help">
                                  LATE <FaInfoCircle className="text-xs opacity-60" />
                                </span>
                              </Tooltip>
                              <span className="font-['Press_Start_2P'] text-sm">
                                {stats.lateHits} hits ({timingDistribution.late}%)
                              </span>
                            </div>
                            <PixelProgressBar
                              value={stats.lateHits}
                              max={Math.max(stats.hitKeystrokes, 1)}
                              height={20}
                              className="w-full"
                              progressClassName="bg-info"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Improvement Insights */}
                      <div className="bg-background/20 border-4 border-border p-6 shadow-[4px_4px_0px_#000]">
                        <h3 className="font-['Press_Start_2P'] text-lg mb-4">
                          IMPROVEMENT INSIGHTS
                        </h3>

                        <div className="space-y-4">
                          {/* Next Targets */}
                          <div className="bg-background/30 border-2 border-border/50 p-4">
                            <div className="font-['Press_Start_2P'] text-sm mb-3 text-accent-color">
                              NEXT TARGETS
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="font-['Press_Start_2P'] text-xs text-foreground/70">
                                  WPM GOAL
                                </div>
                                <div className="font-['Press_Start_2P'] text-lg text-info">
                                  {improvementAnalysis.nextTargets.wpm}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-['Press_Start_2P'] text-xs text-foreground/70">
                                  ACCURACY GOAL
                                </div>
                                <div className="font-['Press_Start_2P'] text-lg text-success">
                                  {improvementAnalysis.nextTargets.accuracy}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Top Keys */}
                          <div>
                            <div className="font-['Press_Start_2P'] text-sm mb-3">
                              MOST USED KEYS
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {keyDistribution.topKeys.slice(0, 4).map(([key, keyStats]) => (
                                <div key={key} className="text-center">
                                  <div className="bg-background/50 border-2 border-border p-3 mb-2">
                                    <div className="font-['Press_Start_2P'] text-lg">
                                      {getKeySymbol(key)}
                                    </div>
                                  </div>
                                  <div className="font-['Press_Start_2P'] text-xs">
                                    {keyStats.total}×
                                  </div>
                                  <div
                                    className={`font-['Press_Start_2P'] text-xs ${keyStats.hit / keyStats.total >= 0.8 ? 'text-success' : keyStats.hit / keyStats.total >= 0.6 ? 'text-warning' : 'text-error'}`}
                                  >
                                    {Math.round((keyStats.hit / keyStats.total) * 100)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Keys Needing Improvement */}
                          {improvementAnalysis.keysNeedingImprovement.length > 0 && (
                            <div className="bg-error/20 border-2 border-error/50 p-4">
                              <div className="font-['Press_Start_2P'] text-sm mb-3 text-error">
                                NEED IMPROVEMENT
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {improvementAnalysis.keysNeedingImprovement.map(
                                  (keyData, index) => (
                                    <div key={index} className="text-center">
                                      <div className="bg-background/50 border-2 border-border p-3 mb-2">
                                        <div className="font-['Press_Start_2P'] text-lg">
                                          {getKeySymbol(keyData.key)}
                                        </div>
                                      </div>
                                      <div className="font-['Press_Start_2P'] text-xs">
                                        {keyData.total}×
                                      </div>
                                      <div className="font-['Press_Start_2P'] text-xs text-error">
                                        {keyData.accuracy}%
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {/* Session Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="font-['Press_Start_2P'] text-xs text-foreground/70">
                                SONG LENGTH
                              </div>
                              <div className="font-['Press_Start_2P'] text-sm">
                                {stats.musicDuration}
                              </div>
                            </div>
                            <div>
                              <div className="font-['Press_Start_2P'] text-xs text-foreground/70">
                                KEYS USED
                              </div>
                              <div className="font-['Press_Start_2P'] text-sm">
                                {keyDistribution.totalUniqueKeys}
                              </div>
                            </div>
                            <div>
                              <div className="font-['Press_Start_2P'] text-xs text-foreground/70">
                                REACTION
                              </div>
                              <div className="font-['Press_Start_2P'] text-sm">
                                {typeof stats.averageReactionTime === 'number' &&
                                stats.averageReactionTime > 0
                                  ? `${Math.round(stats.averageReactionTime)}ms`
                                  : '—'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keyboard Heatmap */}
                    <div className="mb-8">
                      <KeyboardLayout
                        keystrokeMap={keystrokeMap}
                        gameState={{
                          isActive: gameState.isActive,
                          isPaused: gameState.isPaused,
                          sessionEndTime: gameState.sessionEndTime,
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </PixelScrollArea>
              </div>

              {/* Fixed Footer with Action Buttons */}
              <div className="p-6 pt-4 border-t-2 border-border/30 bg-card">
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={onPlayAgain}
                    className="px-6 py-3 bg-accent-color font-['Press_Start_2P'] text-sm flex items-center gap-3 
                border-4 border-border shadow-[4px_4px_0px_#000]
                hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                transition-all duration-100"
                  >
                    <FaRedo />
                    PLAY AGAIN
                  </button>

                  {onShare && (
                    <button
                      onClick={onShare}
                      className="px-6 py-3 bg-info font-['Press_Start_2P'] text-sm flex items-center gap-3 
                  border-4 border-border shadow-[4px_4px_0px_#000]
                  hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
                  active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                  transition-all duration-100"
                    >
                      <FaShare />
                      SHARE
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </RadixTooltip.Provider>
  )
}

export default PostGameStatsOverlay
