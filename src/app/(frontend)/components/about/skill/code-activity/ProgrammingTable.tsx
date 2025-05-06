'use client'

import React from 'react'
import clsx from 'clsx'
import { PROGRAMMING_LEVELS } from './constants'

interface ProgrammingTableProps {
  totalHours: number
}

const ProgrammingPilotComparisonTable: React.FC<ProgrammingTableProps> = ({ totalHours }) => {
  // Extract cellClass logic to make JSX more readable
  const getCellClass = (isActive: boolean) =>
    clsx(
      'font-["Press_Start_2P"] text-sm text-[#2c2c2c] p-3 border-2',
      {
        'font-bold border-[#cc9900]': isActive,
        'border-[#2c2c2c]': !isActive,
      },
      'bg-[rgba(255,247,224,0.5)] text-center',
    )

  // Find the current level based on total hours
  const currentLevel =
    PROGRAMMING_LEVELS.find(
      (level) => totalHours >= level.range[0] && totalHours < level.range[1],
    ) || PROGRAMMING_LEVELS[0]

  // Mobile responsive view - show only current level with progression indicator
  const renderMobileView = () => (
    <div className="space-y-4 md:hidden">
      {/* Current Level card */}
      <div className="border-2 border-[#cc9900] bg-[rgba(204,153,0,0.15)] rounded p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-['Press_Start_2P'] text-xs font-bold text-[#2c2c2c]">
            Current Level:
          </h4>
          <span className="font-['Press_Start_2P'] text-sm text-[#2c2c2c] font-bold">
            {currentLevel.progLevel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="font-['Press_Start_2P'] text-xs font-bold text-[#2c2c2c]">Hours:</div>
          <div className="font-['Press_Start_2P'] text-xs text-[#2c2c2c]">{currentLevel.hrs}</div>

          <div className="font-['Press_Start_2P'] text-xs font-bold text-[#2c2c2c]">
            Pilot Equiv:
          </div>
          <div className="font-['Press_Start_2P'] text-xs text-[#2c2c2c]">
            {currentLevel.pilotEquiv}
          </div>

          <div className="font-['Press_Start_2P'] text-xs font-bold text-[#2c2c2c]">
            Description:
          </div>
          <div className="font-['Press_Start_2P'] text-xs text-[#2c2c2c]">{currentLevel.desc}</div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="relative mt-6 px-2">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-[#2c2c2c30] z-0"></div>
        <div className="relative z-10 flex justify-between">
          {PROGRAMMING_LEVELS.map((level, index) => {
            const isCurrentOrPast = totalHours >= level.range[0]
            const isCurrent =
              totalHours >= level.range[0] &&
              (index === PROGRAMMING_LEVELS.length - 1 ||
                totalHours < PROGRAMMING_LEVELS[index + 1].range[0])

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full mb-1 flex items-center justify-center relative ${
                    isCurrentOrPast ? 'bg-[#cc9900]' : 'bg-[#2c2c2c30]'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="animate-bounce text-[#cc9900]">▼</div>
                    </div>
                  )}
                </div>
                <span
                  className={`font-['Press_Start_2P'] text-[8px] ${
                    isCurrent ? 'text-[#cc9900] font-bold' : 'text-[#2c2c2c]'
                  }`}
                >
                  {level.progLevel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total Hours Card */}
      <div className="mt-4 text-center">
        <div className="inline-block border-2 border-[#2c2c2c] bg-[rgba(44,44,44,0.05)] rounded px-4 py-2 [image-rendering:pixelated] shadow-[2px_2px_0_rgba(44,44,44,0.3)]">
          <div className="font-['Press_Start_2P'] text-xs text-[#2c2c2c]">Total Hours:</div>
          <div className="font-['Press_Start_2P'] text-lg text-[#cc9900] font-bold">
            {totalHours}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile view */}
      {renderMobileView()}

      {/* Desktop view */}
      <table className="w-full border-separate border-spacing-1 my-4 hidden md:table">
        <thead>
          <tr className="bg-[#2c2c2c] p-3 border-2 border-[#2c2c2c] [image-rendering:pixelated]">
            <th className="font-['Press_Start_2P'] text-sm font-bold text-[#fff7e0] text-center uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.2)] p-3">
              Prog. Level
            </th>
            <th className="font-['Press_Start_2P'] text-sm font-bold text-[#fff7e0] text-center uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.2)] p-3">
              Hrs
            </th>
            <th className="font-['Press_Start_2P'] text-sm font-bold text-[#fff7e0] text-center uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.2)] p-3">
              Pilot Equiv.
            </th>
            <th className="font-['Press_Start_2P'] text-sm font-bold text-[#fff7e0] text-center uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.2)] p-3">
              Desc.
            </th>
          </tr>
        </thead>
        <tbody className="bg-transparent">
          {PROGRAMMING_LEVELS.map((row, index) => {
            const isActive = totalHours >= row.range[0] && totalHours < row.range[1]
            return (
              <tr
                key={index}
                className={clsx(
                  'transition-all duration-200 ease-in-out hover:bg-[rgba(44,44,44,0.1)] hover:-translate-y-0.5',
                  { 'bg-[rgba(204,153,0,0.15)]': isActive },
                )}
              >
                <td className={getCellClass(isActive) + ' text-xs'}>{row.progLevel}</td>
                <td className={getCellClass(isActive) + ' text-xs'}>{row.hrs}</td>
                <td className={getCellClass(isActive) + ' text-xs'}>{row.pilotEquiv}</td>
                <td className={getCellClass(isActive) + ' text-xs'}>{row.desc}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default ProgrammingPilotComparisonTable
