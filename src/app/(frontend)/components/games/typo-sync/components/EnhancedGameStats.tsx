'use client'

import React from 'react'
import { useTypoSyncStore } from '../store/typoSyncStore'
import { FaTrophy, FaKeyboard, FaFire, FaClock, FaChartLine, FaTrash as FaTarget } from 'react-icons/fa'

export default function EnhancedGameStats() {
  const { gameState, performanceMetrics, getTimingHistogram } = useTypoSyncStore()
  
  // Calculate real-time statistics
  const timingHistogram = getTimingHistogram()
  const upcomingKeystrokes = gameState.totalKeystrokes - gameState.correctKeystrokes - gameState.incorrectKeystrokes
  const progress = gameState.totalKeystrokes > 0 ? ((gameState.correctKeystrokes + gameState.incorrectKeystrokes) / gameState.totalKeystrokes) * 100 : 0
  
  // Check if game is truly completed (not active AND all keystrokes processed)
  const isGameCompleted = !gameState.isActive && gameState.totalKeystrokes > 0 && upcomingKeystrokes === 0

  // Color functions
  const getScoreColor = (score: number) => {
    if (score < 0) return 'text-red-600'
    if (score < 500) return 'text-yellow-600'
    if (score < 1000) return 'text-green-600'
    return 'text-purple-600'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 50) return 'text-red-600'
    if (accuracy < 75) return 'text-yellow-600'
    if (accuracy < 90) return 'text-green-600'
    return 'text-blue-600'
  }

  const getWPMColor = (wpm: number) => {
    if (wpm < 20) return 'text-red-600'
    if (wpm < 35) return 'text-yellow-600'
    if (wpm < 50) return 'text-green-600'
    return 'text-purple-600'
  }

  const getStreakColor = (streak: number) => {
    if (streak < 5) return 'text-gray-600'
    if (streak < 10) return 'text-yellow-600'
    if (streak < 20) return 'text-green-600'
    return 'text-red-600'
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Main Score and Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score */}
        <div className="p-4 bg-[var(--card-background)] rounded-lg border-2 border-[var(--border-color)] pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">SCORE</h3>
          </div>
          <div className={`text-2xl font-['Press_Start_2P'] ${getScoreColor(gameState.score)}`}>
            {gameState.score.toLocaleString()}
          </div>
          {gameState.feedback && (
            <div
              className="text-sm font-['Press_Start_2P'] mt-1 px-2 py-1 rounded border"
              style={{
                color: gameState.feedbackColor,
                borderColor: gameState.feedbackColor,
                backgroundColor: `${gameState.feedbackColor}15`,
              }}
            >
              {gameState.feedback}
            </div>
          )}
        </div>

        {/* WPM */}
        <div className="p-4 bg-[var(--card-background)] rounded-lg border-2 border-[var(--border-color)] pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FaKeyboard className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">WPM</h3>
          </div>
          <div className={`text-2xl font-['Press_Start_2P'] ${getWPMColor(gameState.wpm)}`}>
            {gameState.wpm}
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            Avg: {performanceMetrics.averageWPM.toFixed(1)}
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-4 bg-[var(--card-background)] rounded-lg border-2 border-[var(--border-color)] pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FaTarget className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">ACCURACY</h3>
          </div>
          <div className={`text-2xl font-['Press_Start_2P'] ${getAccuracyColor(gameState.accuracy)}`}>
            {gameState.accuracy}%
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            {gameState.correctKeystrokes} / {gameState.totalKeystrokes} hits
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 bg-[var(--card-background)] rounded-lg border-2 border-[var(--border-color)] pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">STREAK</h3>
          </div>
          <div className={`text-2xl font-['Press_Start_2P'] ${getStreakColor(gameState.streak)}`}>
            {gameState.streak}
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            Max: {gameState.maxStreak}
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Progress */}
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">PROGRESS</h3>
          </div>
          <div className="text-xl font-['Press_Start_2P'] text-[var(--text-color)]">
            {progress.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-[var(--accent-color)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            {gameState.correctKeystrokes + gameState.incorrectKeystrokes} / {gameState.totalKeystrokes} notes
          </div>
        </div>

        {/* Reaction Time */}
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">REACTION</h3>
          </div>
          <div className="text-xl font-['Press_Start_2P'] text-[var(--text-color)]">
            {(gameState.averageReactionTime * 1000).toFixed(0)}ms
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            Average timing
          </div>
        </div>

        {/* Confidence Level */}
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2">
            <FaKeyboard className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">CONFIDENCE</h3>
          </div>
          <div className="text-xl font-['Press_Start_2P'] text-[var(--text-color)]">
            {(performanceMetrics.confidenceLevel * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            Based on recent performance
          </div>
        </div>
      </div>

      {/* Timing Histogram */}
      {timingHistogram.totalHits > 0 && (
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)] mb-3">
            ⏱️ TIMING DISTRIBUTION
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-red-600">
                {timingHistogram.earlyHits}
              </div>
              <div className="text-xs text-[var(--text-color)] opacity-60">Early</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-green-600">
                {timingHistogram.syncHits}
              </div>
              <div className="text-xs text-[var(--text-color)] opacity-60">Perfect</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-yellow-600">
                {timingHistogram.lateHits}
              </div>
              <div className="text-xs text-[var(--text-color)] opacity-60">Late</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-[var(--text-color)] opacity-60">
              Avg: {(timingHistogram.averageTiming * 1000).toFixed(0)}ms | 
              StdDev: {(timingHistogram.standardDeviation * 1000).toFixed(0)}ms
            </div>
          </div>
        </div>
      )}

      {/* Session Summary */}
      {performanceMetrics.totalSessions > 0 && (
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)] mb-3">
            📊 SESSION SUMMARY
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-[var(--text-color)]">
                {performanceMetrics.totalSessions}
              </div>
              <div className="text-xs text-[var(--text-color)] opacity-60">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-[var(--text-color)]">
                {Math.round(performanceMetrics.totalPlayTime / 1000 / 60)}m
              </div>
              <div className="text-xs text-[var(--text-color)] opacity-60">Play Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-[var(--text-color)]">
                {performanceMetrics.bestStreak}
              </div>
              <div className="text-xs text-[var(--text-color)] opacity-60">Best Streak</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-['Press_Start_2P'] ${
                performanceMetrics.improvementRate > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {performanceMetrics.improvementRate > 0 ? '+' : ''}{(performanceMetrics.improvementRate || 0).toFixed(1)}%
              </div>
              <div className="text-xs text-[var(--text-color)] opacity-60">Improvement</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Complete Message */}
      {isGameCompleted && (
        <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400">
          <div className="text-center">
            <h2 className="text-2xl font-['Press_Start_2P'] text-green-800 mb-2">
              🎉 GAME COMPLETE! 🎉
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <div className="text-lg font-['Press_Start_2P'] text-green-700">
                  {gameState.score.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Final Score</div>
              </div>
              <div>
                <div className="text-lg font-['Press_Start_2P'] text-green-700">
                  {gameState.wpm}
                </div>
                <div className="text-sm text-green-600">WPM</div>
              </div>
              <div>
                <div className="text-lg font-['Press_Start_2P'] text-green-700">
                  {gameState.accuracy}%
                </div>
                <div className="text-sm text-green-600">Accuracy</div>
              </div>
              <div>
                <div className="text-lg font-['Press_Start_2P'] text-green-700">
                  {gameState.maxStreak}
                </div>
                <div className="text-sm text-green-600">Max Streak</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}