'use client'

import React from 'react'
import { useTypoSyncStore } from '../../store'
import { FaTrophy, FaKeyboard, FaFire, FaClock, FaChartLine, FaCrosshairs } from 'react-icons/fa'

export default function GameStats() {
  const { gameState, performanceMetrics, getTimingHistogram } = useTypoSyncStore()

  // Calculate real-time statistics
  const timingHistogram = getTimingHistogram()
  const upcomingKeystrokes =
    gameState.totalKeystrokes - gameState.correctKeystrokes - gameState.incorrectKeystrokes
  const progress =
    gameState.totalKeystrokes > 0
      ? ((gameState.correctKeystrokes + gameState.incorrectKeystrokes) /
          gameState.totalKeystrokes) *
        100
      : 0

  // Check if game is truly completed (not active AND all keystrokes processed)
  const isGameCompleted =
    !gameState.isActive && gameState.totalKeystrokes > 0 && upcomingKeystrokes === 0

  // Color functions
  const getScoreColor = (score: number) => {
    if (score < 0) return 'text-error'
    if (score < 500) return 'text-warning'
    if (score < 1000) return 'text-success'
    return 'text-primary'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 50) return 'text-error'
    if (accuracy < 75) return 'text-warning'
    if (accuracy < 90) return 'text-success'
    return 'text-primary'
  }

  const getWPMColor = (wpm: number) => {
    if (wpm < 20) return 'text-error'
    if (wpm < 35) return 'text-warning'
    if (wpm < 50) return 'text-success'
    return 'text-primary'
  }

  const getStreakColor = (streak: number) => {
    if (streak < 5) return 'text-text/60'
    if (streak < 10) return 'text-warning'
    if (streak < 20) return 'text-success'
    return 'text-error'
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4 sm:p-6 md:p-8">
      {/* Main Score and Real-time Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enhanced Score */}
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <div className="flex items-center gap-2 mb-3">
            <FaTrophy className="text-accent text-lg" />
            <h3 className="text-xs font-['Press_Start_2P'] text-text">SCORE</h3>
          </div>
          <div
            className={`text-xl sm:text-2xl font-['Press_Start_2P'] ${getScoreColor(gameState.score)}`}
          >
            {gameState.score.toLocaleString()}
          </div>
          {gameState.feedback && (
            <div
              className="text-xs font-['Press_Start_2P'] mt-1 px-2 py-1 border pixel-border"
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

        {/* Enhanced WPM */}
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <div className="flex items-center gap-2 mb-3">
            <FaKeyboard className="text-accent text-lg" />
            <h3 className="text-xs font-['Press_Start_2P'] text-text">WPM</h3>
          </div>
          <div
            className={`text-xl sm:text-2xl font-['Press_Start_2P'] ${getWPMColor(gameState.wpm)}`}
          >
            {gameState.wpm}
          </div>
          <div className="text-xs text-text/60 mt-2 bg-background/50 px-2 py-1 pixel-border">
            Avg: {performanceMetrics.averageWPM.toFixed(1)}
          </div>
        </div>

        {/* Enhanced Accuracy */}
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <div className="flex items-center gap-2 mb-3">
            <FaCrosshairs className="text-accent text-lg" />
            <h3 className="text-xs font-['Press_Start_2P'] text-text">ACCURACY</h3>
          </div>
          <div
            className={`text-xl sm:text-2xl font-['Press_Start_2P'] ${getAccuracyColor(gameState.accuracy)}`}
          >
            {gameState.accuracy}%
          </div>
          <div className="text-xs text-text/60 mt-2 bg-background/50 px-2 py-1 pixel-border">
            {gameState.correctKeystrokes} / {gameState.totalKeystrokes} hits
          </div>
        </div>

        {/* Enhanced Streak */}
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <div className="flex items-center gap-2 mb-3">
            <FaFire className="text-accent text-lg" />
            <h3 className="text-xs font-['Press_Start_2P'] text-text">STREAK</h3>
          </div>
          <div
            className={`text-xl sm:text-2xl font-['Press_Start_2P'] ${getStreakColor(gameState.streak)}`}
          >
            {gameState.streak}
          </div>
          <div className="text-xs text-text/60 mt-2 bg-background/50 px-2 py-1 pixel-border">
            Max: {gameState.maxStreak}
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Progress */}
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-accent" />
            <h3 className="text-xs font-['Press_Start_2P'] text-text">PROGRESS</h3>
          </div>
          <div className="text-lg font-['Press_Start_2P'] text-text">{progress.toFixed(1)}%</div>
          <div className="w-full bg-background/50 border border-border h-3 mt-2 pixel-border">
            <div
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-text/60 mt-1">
            {gameState.correctKeystrokes + gameState.incorrectKeystrokes} /{' '}
            {gameState.totalKeystrokes} notes
          </div>
        </div>

        {/* Reaction Time */}
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-accent" />
            <h3 className="text-xs font-['Press_Start_2P'] text-text">REACTION</h3>
          </div>
          <div className="text-lg font-['Press_Start_2P'] text-text">
            {(gameState.averageReactionTime * 1000).toFixed(0)}ms
          </div>
          <div className="text-xs text-text/60 mt-1">Average timing</div>
        </div>

        {/* Confidence Level */}
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <div className="flex items-center gap-2 mb-2">
            <FaKeyboard className="text-accent" />
            <h3 className="text-xs font-['Press_Start_2P'] text-text">CONFIDENCE</h3>
          </div>
          <div className="text-lg font-['Press_Start_2P'] text-text">
            {(performanceMetrics.confidenceLevel * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-text/60 mt-1">Based on recent performance</div>
        </div>
      </div>

      {/* Timing Histogram */}
      {timingHistogram.totalHits > 0 && (
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <h3 className="text-sm font-['Press_Start_2P'] text-text mb-3">⏱️ TIMING DISTRIBUTION</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-error">
                {timingHistogram.earlyHits}
              </div>
              <div className="text-xs text-text/60">Early</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-success">
                {timingHistogram.syncHits}
              </div>
              <div className="text-xs text-text/60">Perfect</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-warning">
                {timingHistogram.lateHits}
              </div>
              <div className="text-xs text-text/60">Late</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-text/60">
              Avg: {(timingHistogram.averageTiming * 1000).toFixed(0)}ms | StdDev:{' '}
              {(timingHistogram.standardDeviation * 1000).toFixed(0)}ms
            </div>
          </div>
        </div>
      )}

      {/* Session Summary */}
      {performanceMetrics.totalSessions > 0 && (
        <div className="p-4 bg-background border-2 border-border shadow-[4px_4px_0px_#000] pixel-border">
          <h3 className="text-sm font-['Press_Start_2P'] text-text mb-3">📊 SESSION SUMMARY</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-text">
                {performanceMetrics.totalSessions}
              </div>
              <div className="text-xs text-text/60">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-text">
                {Math.round(performanceMetrics.totalPlayTime / 1000 / 60)}m
              </div>
              <div className="text-xs text-text/60">Play Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-['Press_Start_2P'] text-text">
                {performanceMetrics.bestStreak}
              </div>
              <div className="text-xs text-text/60">Best Streak</div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-['Press_Start_2P'] ${
                  performanceMetrics.improvementRate > 0 ? 'text-success' : 'text-error'
                }`}
              >
                {performanceMetrics.improvementRate > 0 ? '+' : ''}
                {(performanceMetrics.improvementRate || 0).toFixed(1)}%
              </div>
              <div className="text-xs text-text/60">Improvement</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Complete Message */}
      {isGameCompleted && (
        <div className="p-6 bg-success/10 border-2 border-success shadow-[4px_4px_0px_#000] pixel-border">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-['Press_Start_2P'] text-success mb-2">
              🎉 GAME COMPLETE! 🎉
            </h2>
            <p className="text-sm font-['Press_Start_2P'] text-success/80 mb-4">
              Great job! You&apos;ve completed the rhythm typing challenge.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-['Press_Start_2P'] text-success">
                  {gameState.score}
                </div>
                <div className="text-xs text-success/60">Final Score</div>
              </div>
              <div>
                <div className="text-lg font-['Press_Start_2P'] text-success">
                  {gameState.accuracy}%
                </div>
                <div className="text-xs text-success/60">Accuracy</div>
              </div>
              <div>
                <div className="text-lg font-['Press_Start_2P'] text-success">
                  {gameState.maxStreak}
                </div>
                <div className="text-xs text-success/60">Best Streak</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
