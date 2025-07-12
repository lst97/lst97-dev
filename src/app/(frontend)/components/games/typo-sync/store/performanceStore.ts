import type { PerformanceMetrics, TimingHistogram } from '../types'

export interface PerformanceActions {
  updatePerformanceMetrics: () => void
  calculateConfidenceLevel: () => number
  getTimingHistogram: () => TimingHistogram
}

export const createPerformanceActions = (set: any, get: any): PerformanceActions => ({
  updatePerformanceMetrics: () => {
    const { sessionHistory } = get()

    if (sessionHistory.length === 0) return

    const recentSessions = sessionHistory.slice(-10)

    const totalWPM = recentSessions.reduce((sum: number, session: any) => sum + session.wpm, 0)
    const totalAccuracy = recentSessions.reduce(
      (sum: number, session: any) => sum + session.accuracy,
      0,
    )
    const bestStreak = Math.max(...sessionHistory.map((session: any) => session.maxStreak))

    const averageWPM = totalWPM / recentSessions.length
    const averageAccuracy = totalAccuracy / recentSessions.length

    const totalPlayTime = sessionHistory.reduce(
      (sum: number, session: any) => sum + session.duration,
      0,
    )

    let improvementRate = 0
    if (sessionHistory.length >= 5) {
      const oldSessions = sessionHistory.slice(-10, -5)
      const newSessions = sessionHistory.slice(-5)

      const oldAvgWPM =
        oldSessions.reduce((sum: number, s: any) => sum + s.wpm, 0) / oldSessions.length
      const newAvgWPM =
        newSessions.reduce((sum: number, s: any) => sum + s.wpm, 0) / newSessions.length

      improvementRate = ((newAvgWPM - oldAvgWPM) / oldAvgWPM) * 100
    }

    const confidenceLevel = get().calculateConfidenceLevel()

    // Analyze keystroke patterns for weak/strong keys
    const allTimings = sessionHistory.flatMap((session: any) => session.hitTimings || [])
    const weakKeys: string[] = []
    const strongKeys: string[] = []

    const updatedMetrics: PerformanceMetrics = {
      averageWPM: Math.round(averageWPM),
      averageAccuracy: Math.round(averageAccuracy),
      bestStreak,
      totalSessions: sessionHistory.length,
      totalPlayTime: Math.round(totalPlayTime / 1000), // Convert to seconds
      improvementRate: Math.round(improvementRate * 100) / 100,
      confidenceLevel,
      weakKeys,
      strongKeys,
    }

    set(() => ({
      performanceMetrics: updatedMetrics,
    }))
  },

  calculateConfidenceLevel: () => {
    const { sessionHistory } = get()

    if (sessionHistory.length < 3) return 0

    const recentSessions = sessionHistory.slice(-5)

    const avgAccuracy =
      recentSessions.reduce((sum: number, session: any) => sum + session.accuracy, 0) /
      recentSessions.length
    const avgWPM =
      recentSessions.reduce((sum: number, session: any) => sum + session.wpm, 0) /
      recentSessions.length

    const accuracyVariance =
      recentSessions.reduce((sum: number, session: any) => {
        const diff = session.accuracy - avgAccuracy
        return sum + diff * diff
      }, 0) / recentSessions.length

    const wpmVariance =
      recentSessions.reduce((sum: number, session: any) => {
        const diff = session.wpm - avgWPM
        return sum + diff * diff
      }, 0) / recentSessions.length

    const consistencyScore = Math.max(0, 100 - Math.sqrt(accuracyVariance) - Math.sqrt(wpmVariance))
    const performanceScore = (avgAccuracy + Math.min(avgWPM, 100)) / 2

    const confidenceLevel = consistencyScore * 0.4 + performanceScore * 0.6

    return Math.round(Math.max(0, Math.min(100, confidenceLevel)))
  },

  getTimingHistogram: () => {
    const { sessionHistory } = get()

    const allTimings = sessionHistory.flatMap((session: any) => session.hitTimings || [])

    if (allTimings.length === 0) {
      return {
        earlyHits: 0,
        syncHits: 0,
        lateHits: 0,
        totalHits: 0,
        averageTiming: 0,
        standardDeviation: 0,
      }
    }

    const earlyHits = allTimings.filter((timing: number) => timing < -0.05).length
    const syncHits = allTimings.filter((timing: number) => Math.abs(timing) <= 0.05).length
    const lateHits = allTimings.filter((timing: number) => timing > 0.05).length

    const averageTiming =
      allTimings.reduce((sum: number, timing: number) => sum + timing, 0) / allTimings.length

    const variance =
      allTimings.reduce((sum: number, timing: number) => {
        const diff = timing - averageTiming
        return sum + diff * diff
      }, 0) / allTimings.length

    const standardDeviation = Math.sqrt(variance)

    return {
      earlyHits,
      syncHits,
      lateHits,
      totalHits: allTimings.length,
      averageTiming: Math.round(averageTiming * 1000) / 1000, // Round to 3 decimal places
      standardDeviation: Math.round(standardDeviation * 1000) / 1000,
    }
  },
})
