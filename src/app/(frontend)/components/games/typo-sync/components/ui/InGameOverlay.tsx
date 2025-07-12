'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RollingNumber } from '../animation/RollingDigit'
import type { GameState, Keystroke } from '../../types'

interface InGameOverlayProps {
  gameState: GameState
  keystrokeMap: Keystroke[]
  gameTime: number
}

export function InGameOverlay({ gameState, keystrokeMap, gameTime }: InGameOverlayProps) {
  return (
    <>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-background/80 backdrop-blur-sm border-b-2 border-border/50">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300 pixel-border relative overflow-hidden"
          style={{
            width: `${Math.min(
              keystrokeMap.length > 0
                ? (keystrokeMap.filter(
                    (k) => k.state === 'hit' || k.state === 'missed' || k.state === 'typo',
                  ).length /
                    keystrokeMap.filter((k) => k.type !== 'hidden').length) *
                    100
                : 0,
              100,
            )}%`,
          }}
          animate={{
            boxShadow:
              keystrokeMap.length > 0 &&
              keystrokeMap.filter(
                (k) => k.state === 'hit' || k.state === 'missed' || k.state === 'typo',
              ).length /
                keystrokeMap.filter((k) => k.type !== 'hidden').length >
                0.8
                ? ['0 0 0px #b58900', '0 0 8px #b58900', '0 0 0px #b58900']
                : '0 0 0px #b58900',
          }}
          transition={{
            duration: 1,
            repeat:
              keystrokeMap.length > 0 &&
              keystrokeMap.filter(
                (k) => k.state === 'hit' || k.state === 'missed' || k.state === 'typo',
              ).length /
                keystrokeMap.filter((k) => k.type !== 'hidden').length >
                0.8
                ? Infinity
                : 0,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full"
              animate={{
                x: ['-100%', '100%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
              style={{
                top: `${20 + i * 30}%`,
                left: '0%',
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Main Game Stats - Top Center Row */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-3 pointer-events-none max-h-22">
        <ScoreComponent gameState={gameState} keystrokeMap={keystrokeMap} />
        <WPMComponent gameState={gameState} />
        <AccuracyComponent gameState={gameState} />
      </div>

      {/* Streak - Top Right */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <StreakComponent gameState={gameState} keystrokeMap={keystrokeMap} />
      </div>

      {/* Reaction Time - Bottom Right */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none">
        <ReactionComponent gameState={gameState} />
      </div>

      {/* Upcoming Words - Bottom */}
      {gameState.isActive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-10">
          <UpcomingWordsComponent keystrokeMap={keystrokeMap} />
        </div>
      )}

      {/* Debug Info - Top Left */}
      <motion.div
        className="absolute top-2 left-2 text-text font-['Press_Start_2P'] text-xs bg-card/90 p-2 border-2 border-border pixel-border shadow-[4px_4px_0px_#000] backdrop-blur-sm hidden lg:block pointer-events-auto z-10"
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div>Time: {gameTime.toFixed(2)}s</div>
        <div>
          Notes: {keystrokeMap.filter((k) => k.state === 'upcoming' && k.type !== 'hidden').length}
        </div>
        <div>
          Hidden: {keystrokeMap.filter((k) => k.state === 'upcoming' && k.type === 'hidden').length}
        </div>
      </motion.div>
    </>
  )
}

function ScoreComponent({
  gameState,
  keystrokeMap,
}: {
  gameState: GameState
  keystrokeMap: Keystroke[]
}) {
  const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
  const syncHits = keystrokeMap.filter(
    (k) => k.state === 'hit' && k.timingAccuracy === 'sync',
  ).length
  const syncPercentage = totalNotes > 0 ? (syncHits / totalNotes) * 100 : 0

  const getBackgroundClass = () => {
    if (syncPercentage >= 99) return 'bg-violet-900/90 border-violet-700'
    if (syncPercentage >= 90) return 'bg-indigo-900/90 border-indigo-700'
    if (syncPercentage >= 75) return 'bg-blue-900/90 border-blue-700'
    if (syncPercentage >= 50) return 'bg-emerald-900/90 border-emerald-700'
    return 'bg-background/85 border-border/50'
  }

  const getTextClass = () => {
    if (syncPercentage >= 99) return 'text-violet-200'
    if (syncPercentage >= 90) return 'text-indigo-200'
    if (syncPercentage >= 75) return 'text-blue-200'
    if (syncPercentage >= 50) return 'text-emerald-200'
    if (gameState.score < 0) return 'text-red-400'
    return 'text-amber-700'
  }

  return (
    <motion.div
      className={`backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border ${getBackgroundClass()}`}
      animate={{
        scale: gameState.score > 0 && gameState.score % 100 === 0 ? [1, 1.1, 1] : 1,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="text-center">
        <RollingNumber
          value={gameState.score}
          className={`text-2xl font-['Press_Start_2P'] ${getTextClass()}`}
          duration={0.12}
        />
        <div
          className={`text-xs mt-[-24] ${syncPercentage >= 50 ? 'text-white/80' : 'text-text/60'}`}
        >
          SCORE
        </div>
      </div>
    </motion.div>
  )
}

function WPMComponent({ gameState }: { gameState: GameState }) {
  const getBackgroundClass = () => {
    if (gameState.wpm >= 60) return 'bg-violet-900/90 border-violet-700'
    if (gameState.wpm >= 45) return 'bg-indigo-900/90 border-indigo-700'
    if (gameState.wpm >= 30) return 'bg-blue-900/90 border-blue-700'
    if (gameState.wpm >= 20) return 'bg-emerald-900/90 border-emerald-700'
    return 'bg-background/85 border-border/50'
  }

  const getTextClass = () => {
    if (gameState.wpm >= 60) return 'text-violet-200'
    if (gameState.wpm >= 45) return 'text-indigo-200'
    if (gameState.wpm >= 30) return 'text-blue-200'
    if (gameState.wpm >= 20) return 'text-emerald-200'
    return 'text-amber-700'
  }

  return (
    <motion.div
      className={`backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border ${getBackgroundClass()}`}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.div
          animate={{
            textShadow: gameState.wpm >= 60 ? '0 0 6px currentColor' : 'none',
          }}
        >
          <RollingNumber
            value={gameState.wpm}
            className={`text-2xl font-['Press_Start_2P'] ${getTextClass()}`}
            duration={0.12}
          />
        </motion.div>
        <div
          className={`text-xs mt-[-24] ${gameState.wpm >= 20 ? 'text-white/80' : 'text-text/60'}`}
        >
          WPM
        </div>
      </div>
    </motion.div>
  )
}

function AccuracyComponent({ gameState }: { gameState: GameState }) {
  const getBackgroundClass = () => {
    if (gameState.accuracy >= 99) return 'bg-violet-900/90 border-violet-700'
    if (gameState.accuracy >= 90) return 'bg-indigo-900/90 border-indigo-700'
    if (gameState.accuracy >= 75) return 'bg-blue-900/90 border-blue-700'
    if (gameState.accuracy >= 50) return 'bg-emerald-900/90 border-emerald-700'
    return 'bg-background/85 border-border/50'
  }

  const getTextClass = () => {
    if (gameState.accuracy >= 99) return 'text-violet-200'
    if (gameState.accuracy >= 90) return 'text-indigo-200'
    if (gameState.accuracy >= 75) return 'text-blue-200'
    if (gameState.accuracy >= 50) return 'text-emerald-200'
    return 'text-red-400'
  }

  return (
    <motion.div
      className={`backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border ${getBackgroundClass()}`}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center">
          <RollingNumber
            value={gameState.accuracy}
            className={`text-2xl font-['Press_Start_2P'] ${getTextClass()}`}
            duration={0.12}
          />
          <span className={`text-sm font-['Press_Start_2P'] ml-1 opacity-70 ${getTextClass()}`}>
            %
          </span>
        </div>
        <div
          className={`text-xs mt-[-24] ${gameState.accuracy >= 50 ? 'text-white/80' : 'text-text/60'}`}
        >
          ACCURACY
        </div>
      </div>
    </motion.div>
  )
}

function StreakComponent({
  gameState,
  keystrokeMap,
}: {
  gameState: GameState
  keystrokeMap: Keystroke[]
}) {
  const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
  const streakPercentage = totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0

  const getBackgroundClass = () => {
    if (streakPercentage >= 90) return 'bg-red-900/90 border-red-800 animate-pulse'
    if (streakPercentage >= 75) return 'bg-orange-900/90 border-orange-800'
    if (streakPercentage >= 50) return 'bg-amber-900/90 border-amber-800'
    if (streakPercentage >= 30) return 'bg-yellow-900/90 border-yellow-800'
    if (streakPercentage >= 15) return 'bg-lime-900/90 border-lime-800'
    if (streakPercentage >= 5) return 'bg-green-900/90 border-green-800'
    return 'bg-background/85 border-border/50'
  }

  const getTextClass = () => {
    if (streakPercentage >= 90) return 'text-red-200'
    if (streakPercentage >= 75) return 'text-orange-200'
    if (streakPercentage >= 50) return 'text-amber-200'
    if (streakPercentage >= 30) return 'text-yellow-200'
    if (streakPercentage >= 15) return 'text-lime-200'
    if (streakPercentage >= 5) return 'text-green-200'
    return 'text-gray-400'
  }

  const getEmoji = () => {
    if (streakPercentage >= 90) return ' 🔥'
    if (streakPercentage >= 75) return ' ⭐'
    if (streakPercentage >= 50) return ' ✨'
    if (streakPercentage >= 30) return ' 💫'
    if (streakPercentage >= 15) return ' ⚡'
    if (streakPercentage >= 5) return ' ✓'
    return ''
  }

  return (
    <motion.div
      className={`backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border ${getBackgroundClass()}`}
      animate={{
        scale: streakPercentage >= 90 ? [1, 1.05, 1] : 1,
        boxShadow:
          streakPercentage >= 90
            ? ['4px_4px_0px_#000', '6px_6px_0px_#000', '4px_4px_0px_#000']
            : '4px_4px_0px_#000',
      }}
      transition={{
        duration: streakPercentage >= 90 ? 0.5 : 0.3,
        repeat: streakPercentage >= 90 ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      <div className="text-center">
        <motion.div
          className="flex items-center justify-center"
          animate={{
            textShadow:
              streakPercentage >= 90
                ? ['0 0 0px currentColor', '0 0 6px currentColor', '0 0 0px currentColor']
                : 'none',
          }}
          transition={{
            duration: 0.5,
            repeat: streakPercentage >= 90 ? Infinity : 0,
          }}
        >
          <RollingNumber
            value={gameState.streak}
            className={`text-2xl font-['Press_Start_2P'] ${getTextClass()}`}
            duration={0.12}
          />
          <span className={`text-sm font-['Press_Start_2P'] ml-1 opacity-80 ${getTextClass()}`}>
            {getEmoji()}
          </span>
        </motion.div>
        <div
          className={`text-xs mt-[-24] ${streakPercentage >= 5 ? 'text-white/80' : 'text-text/60'}`}
        >
          STREAK ({streakPercentage.toFixed(0)}%)
        </div>
        <div className={`text-xs mt-1 ${streakPercentage >= 5 ? 'text-white/60' : 'text-text/40'}`}>
          Max: {gameState.maxStreak}
        </div>
      </div>
    </motion.div>
  )
}

function ReactionComponent({ gameState }: { gameState: GameState }) {
  const getBackgroundClass = () => {
    if (gameState.averageReactionTime < 0.05) return 'bg-violet-900/90 border-violet-700'
    if (gameState.averageReactionTime < 0.1) return 'bg-indigo-900/90 border-indigo-700'
    if (gameState.averageReactionTime < 0.15) return 'bg-blue-900/90 border-blue-700'
    if (gameState.averageReactionTime < 0.2) return 'bg-emerald-900/90 border-emerald-700'
    return 'bg-background/85 border-border/50'
  }

  const getTextClass = () => {
    if (gameState.averageReactionTime < 0.05) return 'text-violet-200'
    if (gameState.averageReactionTime < 0.1) return 'text-indigo-200'
    if (gameState.averageReactionTime < 0.15) return 'text-blue-200'
    if (gameState.averageReactionTime < 0.2) return 'text-emerald-200'
    return 'text-red-400'
  }

  return (
    <motion.div
      className={`backdrop-blur-sm border-2 px-3 py-1 text-right pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border ${getBackgroundClass()}`}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center">
        <RollingNumber
          value={Math.round(gameState.averageReactionTime * 1000)}
          className={`text-lg font-['Press_Start_2P'] ${getTextClass()}`}
          duration={0.1}
        />
        <span className={`text-xs font-['Press_Start_2P'] ml-1 opacity-70 ${getTextClass()}`}>
          ms
        </span>
      </div>
      <div
        className={`text-xs ${gameState.averageReactionTime < 0.2 ? 'text-white/80' : 'text-text/60'}`}
      >
        REACTION
      </div>
    </motion.div>
  )
}

function UpcomingWordsComponent({ keystrokeMap }: { keystrokeMap: Keystroke[] }) {
  const allWords = []
  let currentWord = ''
  let currentKeystrokes = []
  let wordIndex = 0

  for (const keystroke of keystrokeMap.filter((k) => k.type !== 'hidden')) {
    const displayKey = (() => {
      switch (keystroke.key) {
        case '[Space]':
          return '▭'
        case '[Enter]':
          return '↵'
        default:
          return keystroke.key
      }
    })()

    if (displayKey === '▭' || displayKey === '↵') {
      if (currentWord.length > 0) {
        const isFullyCompleted = currentKeystrokes.every((k) => k.state !== 'upcoming')
        const hasUpcoming = currentKeystrokes.some((k) => k.state === 'upcoming')
        allWords.push({
          text: currentWord,
          keystrokes: [...currentKeystrokes],
          isFullyCompleted,
          hasUpcoming,
          wordId: `word-${wordIndex++}-${currentWord}`,
        })
        currentWord = ''
        currentKeystrokes = []
      }

      if (displayKey === '▭') {
        const isFullyCompleted = keystroke.state !== 'upcoming'
        const hasUpcoming = keystroke.state === 'upcoming'
        allWords.push({
          text: '▭',
          keystrokes: [keystroke],
          isFullyCompleted,
          hasUpcoming,
          wordId: `space-${wordIndex++}-${keystroke.startTime}`,
        })
      } else if (displayKey === '↵') {
        const isFullyCompleted = keystroke.state !== 'upcoming'
        const hasUpcoming = keystroke.state === 'upcoming'
        allWords.push({
          text: '↵',
          keystrokes: [keystroke],
          isFullyCompleted,
          hasUpcoming,
          wordId: `enter-${wordIndex++}-${keystroke.startTime}`,
        })
      }
    } else {
      currentWord += displayKey
      currentKeystrokes.push(keystroke)
    }
  }

  if (currentWord.length > 0) {
    const isFullyCompleted = currentKeystrokes.every((k) => k.state !== 'upcoming')
    const hasUpcoming = currentKeystrokes.some((k) => k.state === 'upcoming')
    allWords.push({
      text: currentWord,
      keystrokes: [...currentKeystrokes],
      isFullyCompleted,
      hasUpcoming,
      wordId: `final-${wordIndex++}-${currentWord}`,
    })
  }

  const wordsToShow = allWords
    .filter((word) => word.hasUpcoming || !word.isFullyCompleted)
    .slice(0, 8)

  const finalWordsToShow = wordsToShow.length >= 2 ? wordsToShow : allWords.slice(0, Math.max(2, 8))

  const minWidth = 200 // px, for 2 words
  const wordWidth = 450 // px, for each additional word
  const containerWidth = Math.max(minWidth, finalWordsToShow.length * wordWidth * 0.3)

  return (
    <motion.div
      className="bg-card/90 p-3 border-2 border-border pixel-border shadow-[4px_4px_0px_#000] backdrop-blur-sm overflow-hidden"
      animate={{ width: containerWidth }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      style={{ width: containerWidth }}
    >
      <div className="flex gap-1 items-center min-h-[60px] justify-center">
        <AnimatePresence initial={false}>
          {finalWordsToShow.map((word, index) => (
            <motion.div
              key={word.wordId}
              layout
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -80, opacity: 0, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
              className={`
                font-['Press_Start_2P'] border-2 pixel-border text-center whitespace-nowrap
                ${
                  index === 0
                    ? 'text-xl px-3 py-2 bg-accent text-background border-accent shadow-[0_0_8px_rgba(181,137,0,0.4)] min-w-20 max-w-[800px] text-center'
                    : 'text-sm px-2 py-1 bg-card/70 text-text/80 border-border/50 min-w-16 max-w-[800px] text-center'
                }
                ${word.isFullyCompleted ? 'opacity-40' : ''}
              `}
            >
              {word.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
