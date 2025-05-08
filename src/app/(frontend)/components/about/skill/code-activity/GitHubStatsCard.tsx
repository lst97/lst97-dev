'use client'

import React, { useState, useEffect } from 'react'
import { useGithubStats } from '@/frontend/hooks/useGithubStats'
import Image from 'next/image'

// GitHub Stats Card Component (Pixel Art Style)
const GitHubStatsCard: React.FC = () => {
  const [colors, setColors] = useState({
    primaryColor: 'b58900',
    textColor: '2c2c2c',
    cardColor: 'fff7e0',
  })

  // Get CSS colors after component mounts
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const primaryColor =
        getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() ||
        'b58900'
      const textColor =
        getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() ||
        '2c2c2c'
      const cardColor =
        getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim() ||
        'fff7e0'

      setColors({
        primaryColor: primaryColor.replace('#', ''),
        textColor: textColor.replace('#', ''),
        cardColor: cardColor.replace('#', ''),
      })
    }
  }, [])

  const { data: statsData, isLoading: statsLoading } = useGithubStats({
    theme: 'custom',
    titleColor: colors.primaryColor,
    textColor: colors.textColor,
    bgColor: colors.cardColor,
    iconColor: colors.primaryColor,
    hideRank: true,
    showGithubLogo: true,
    cardWidth: 320, // Make the card smaller
    hideBorder: false,
  })

  if (statsLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-[rgba(44,44,44,0.1)] border-2 border-dashed border-[rgba(44,44,44,0.4)] rounded"></div>
      </div>
    )
  }

  return (
    <div className="relative flex justify-center [image-rendering:pixelated]">
      <div className="pixel-border w-fit overflow-hidden border-4 border-[var(--color-border)] shadow-[5px_5px_0px_rgba(44,44,44,0.3)]">
        {statsData?.url && (
          <Image
            src={statsData.url}
            alt="GitHub Stats"
            className="h-auto"
            width={320}
            height={140}
            unoptimized={true}
            priority
          />
        )}
      </div>
    </div>
  )
}

export default GitHubStatsCard
