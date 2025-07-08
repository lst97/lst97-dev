'use client'

import React, { useMemo } from 'react'
import type { GameStatsProps } from '../types'
import { FaTrophy, FaKeyboard, FaMusic, FaEye } from 'react-icons/fa'

export default function GameStats({
  score,
  feedback,
  feedbackColor,
  keystrokeMap,
  hiddenNotes,
}: GameStatsProps) {
  // Debug logging to track updates
  console.log('📊 GameStats render:', {
    keystrokeMapLength: keystrokeMap.length,
    hiddenNotesLength: hiddenNotes.length,
    score,
    feedback,
  })

  // Calculate game statistics
  const stats = useMemo(() => {
    const totalKeystrokes = keystrokeMap.length
    const completedKeystrokes = keystrokeMap.filter(
      (k) => k.state === 'hit' || k.state === 'missed',
    ).length
    const hitKeystrokes = keystrokeMap.filter((k) => k.state === 'hit').length
    const missedKeystrokes = keystrokeMap.filter((k) => k.state === 'missed').length
    const upcomingKeystrokes = keystrokeMap.filter((k) => k.state === 'upcoming').length

    const melodyNotes = keystrokeMap.filter((k) => k.type === 'melody').length
    const beatNotes = keystrokeMap.filter((k) => k.type === 'beat').length

    const hiddenNotesTotal = hiddenNotes.length
    const hiddenNotesHit = hiddenNotes.filter((h) => h.state === 'hit').length

    const accuracy = completedKeystrokes > 0 ? (hitKeystrokes / completedKeystrokes) * 100 : 0
    const progress = totalKeystrokes > 0 ? (completedKeystrokes / totalKeystrokes) * 100 : 0

    const result = {
      totalKeystrokes,
      completedKeystrokes,
      hitKeystrokes,
      missedKeystrokes,
      upcomingKeystrokes,
      melodyNotes,
      beatNotes,
      hiddenNotesTotal,
      hiddenNotesHit,
      accuracy: isNaN(accuracy) ? 0 : accuracy,
      progress: isNaN(progress) ? 0 : progress,
    }

    console.log('📈 Stats calculated:', result)
    return result
  }, [keystrokeMap, hiddenNotes])

  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score < 0) return 'text-red-600'
    if (score < 500) return 'text-yellow-600'
    if (score < 1000) return 'text-green-600'
    return 'text-purple-600'
  }

  // Accuracy color
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 50) return 'text-red-600'
    if (accuracy < 75) return 'text-yellow-600'
    if (accuracy < 90) return 'text-green-600'
    return 'text-blue-600'
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Main Score and Feedback */}
      <div className="p-6 bg-[var(--card-background)] rounded-lg border-2 border-[var(--border-color)] pixel-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FaTrophy className="text-3xl text-[var(--accent-color)]" />
            <div>
              <h2 className="text-2xl font-['Press_Start_2P'] text-[var(--text-color)]">SCORE</h2>
              <div className={`text-4xl font-['Press_Start_2P'] ${getScoreColor(score)}`}>
                {score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Feedback Display */}
          <div className="text-center">
            {feedback && (
              <div
                className="text-2xl font-['Press_Start_2P'] px-4 py-2 rounded border-2"
                style={{
                  color: feedbackColor,
                  borderColor: feedbackColor,
                  backgroundColor: `${feedbackColor}15`,
                }}
              >
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress */}
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2">
            <FaKeyboard className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">PROGRESS</h3>
          </div>
          <div className="text-2xl font-['Press_Start_2P'] text-[var(--text-color)]">
            {stats.progress.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-[var(--accent-color)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            {stats.completedKeystrokes} / {stats.totalKeystrokes} notes
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">ACCURACY</h3>
          </div>
          <div className={`text-2xl font-['Press_Start_2P'] ${getAccuracyColor(stats.accuracy)}`}>
            {stats.accuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            {stats.hitKeystrokes} hits / {stats.missedKeystrokes} misses
          </div>
        </div>

        {/* Note Types */}
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2">
            <FaMusic className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">NOTES</h3>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[var(--text-color)]">
              <span>🎵 Melody:</span>
              <span>{stats.melodyNotes}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--text-color)]">
              <span>🥁 Beats:</span>
              <span>{stats.beatNotes}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--text-color)]">
              <span>📝 Total:</span>
              <span className="font-bold">{stats.totalKeystrokes}</span>
            </div>
          </div>
        </div>

        {/* Hidden Notes */}
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-2">
            <FaEye className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)]">BONUS</h3>
          </div>
          <div className="text-2xl font-['Press_Start_2P'] text-purple-600">
            {stats.hiddenNotesHit}
          </div>
          <div className="text-xs text-[var(--text-color)] opacity-60 mt-1">
            / {stats.hiddenNotesTotal} hidden notes
          </div>
          <div className="text-xs text-purple-600 mt-1">+{stats.hiddenNotesHit * 25} bonus pts</div>
        </div>
      </div>

      {/* Upcoming Notes Preview */}
      {stats.upcomingKeystrokes > 0 && (
        <div className="p-4 bg-[var(--card-background)] rounded border border-[var(--border-color)]">
          <h3 className="text-sm font-['Press_Start_2P'] text-[var(--text-color)] mb-3">
            🎯 NEXT NOTES ({stats.upcomingKeystrokes} remaining)
          </h3>
          <div className="flex gap-2 flex-wrap">
            {keystrokeMap
              .filter((k) => k.state === 'upcoming')
              .slice(0, 10) // Show first 10 upcoming notes
              .map((keystroke, index) => {
                const displayKey =
                  keystroke.key === '[Space]'
                    ? '␣'
                    : keystroke.key === '[Enter]'
                      ? '⏎'
                      : keystroke.key

                return (
                  <div
                    key={`${keystroke.startTime}-${index}`}
                    className={`
                      px-3 py-1 rounded border-2 font-['Press_Start_2P'] text-sm
                      ${
                        keystroke.type === 'melody'
                          ? 'bg-blue-100 border-blue-400 text-blue-800'
                          : 'bg-green-100 border-green-400 text-green-800'
                      }
                    `}
                  >
                    {displayKey}
                  </div>
                )
              })}
            {stats.upcomingKeystrokes > 10 && (
              <div className="px-3 py-1 text-sm text-[var(--text-color)] opacity-60">
                ...and {stats.upcomingKeystrokes - 10} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Complete Message */}
      {stats.totalKeystrokes > 0 && stats.upcomingKeystrokes === 0 && (
        <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400">
          <div className="text-center">
            <h2 className="text-2xl font-['Press_Start_2P'] text-green-800 mb-2">
              🎉 GAME COMPLETE! 🎉
            </h2>
            <div className="text-lg text-green-700">
              Final Score: <span className="font-['Press_Start_2P']">{score.toLocaleString()}</span>
            </div>
            <div className="text-md text-green-600 mt-2">
              Accuracy:{' '}
              <span className="font-['Press_Start_2P']">{stats.accuracy.toFixed(1)}%</span>
            </div>
            {stats.hiddenNotesHit > 0 && (
              <div className="text-md text-purple-600 mt-1">
                Bonus Notes Found:{' '}
                <span className="font-['Press_Start_2P']">{stats.hiddenNotesHit}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
