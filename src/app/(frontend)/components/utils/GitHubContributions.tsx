'use client'

import React from 'react'
import GitHubCalendar from 'react-github-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import Image from 'next/image'

export const GitHubContributionsCalendar = ({
  username = 'lst97',
  className,
}: {
  username?: string
  className?: string
}) => {
  const selectLastNDays = (contributions: any[], numDays: number) => {
    const today = new Date()
    const cutoffDate = new Date(today)
    cutoffDate.setDate(today.getDate() - numDays)
    cutoffDate.setHours(0, 0, 0, 0)
    today.setHours(23, 59, 59, 999)
    return contributions.filter((activity) => {
      const date = new Date(activity.date)
      return date >= cutoffDate && date <= today
    })
  }

  const explicitTheme: any = {
    light: ['#fdf6e3', '#ecdbaf', '#dabf7c', '#c8a449', '#b58900'],
    dark: ['#fdf6e3', '#ecdbaf', '#dabf7c', '#c8a449', '#b58900'],
  }

  return (
    <div className={className ? `${className} h-full relative` : 'h-full relative'}>
      <Image
        src="/github-pixel-art-icon.svg"
        className="hover:scale-110 hover:cursor-pointer absolute top-0 right-0 z-10 transition-transform duration-200"
        height={36}
        width={36}
        alt="gh"
        onClick={() => window.open(`https://www.github.com/${username}`, '_blank')}
      />
      <div className="pt-8 pb-4 flex flex-col items-center justify-center w-full h-full press-start-2p-regular">
        <GitHubCalendar
          username={username}
          transformData={(data: any[]) => selectLastNDays(data, 72)}
          labels={{ totalCount: '{{count}} contributions ∈ 72 days' }}
          hideMonthLabels={true}
          hideColorLegend={true}
          theme={explicitTheme}
          fontSize={14}
          blockSize={24}
          renderBlock={(block, activity) =>
            React.cloneElement(block, {
              'data-tooltip-id': 'react-tooltip',
              'data-tooltip-html': `${activity.count} activities on ${activity.date}`,
            })
          }
        />
      </div>
      <ReactTooltip id="react-tooltip" className="!bg-[#b58900] !text-white " />
    </div>
  )
}
