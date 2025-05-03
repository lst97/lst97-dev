import React, { useMemo, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ActivityData, Day } from '@/frontend/models/Wakatime'
import { motion } from 'framer-motion'
import type { ApexOptions } from 'apexcharts'
import clsx from 'clsx'
import { useGithubStats } from '@/frontend/hooks/useGithubStats'

// Dynamically load ECharts for calendar view (desktop)
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
})

// Dynamically load ReactApexChart for GitHub style view (mobile)
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

// Constants
const SECONDS_TO_HOURS = 3600
const COLORS = {
  background: '#f3edd9',
  text: '#2c2c2c',
  highlight: '#cc9900',
  cell: {
    default: '#2c2c2c0d',
    border: 'rgba(44, 44, 44, 0.2)',
  },
}

// Theme constants
const THEME = {
  colors: {
    primary: '#b58900',
    secondary: '#ffe580',
    tertiary: '#fff3c4',
    background: '#f3edd9',
    text: '#2c2c2c',
    border: '#2c2c2c',
  },
  fonts: {
    family: 'monospace',
  },
}

// Programming level table data
const PROGRAMMING_LEVELS = [
  {
    progLevel: 'Rookie',
    hrs: '0-500',
    pilotEquiv: 'Student',
    desc: 'Learning to code & debug',
    range: [0, 500],
  },
  {
    progLevel: 'Junior',
    hrs: '500-2K',
    pilotEquiv: 'Private',
    desc: 'Building real projects',
    range: [500, 2000],
  },
  {
    progLevel: 'Mid',
    hrs: '2K-5K',
    pilotEquiv: 'Commercial',
    desc: 'Systems & teamwork',
    range: [2000, 5000],
  },
  {
    progLevel: 'Senior',
    hrs: '5K-10K',
    pilotEquiv: 'Captain',
    desc: 'Leading & architecting',
    range: [5000, 10000],
  },
  {
    progLevel: 'Master',
    hrs: '10K+',
    pilotEquiv: 'Test Pilot',
    desc: 'Innovation & mastery',
    range: [10000, Infinity],
  },
]

interface CodingActivityProps {
  activity?: ActivityData
  inView?: boolean
  variant?: 'Front' | 'Back'
  width: string | number // Required by FlipCard
  height: string | number // Required by FlipCard
  style?: React.CSSProperties
  isLoading?: boolean
  error?: string
}

function ProgrammingPilotComparisonTable({ totalHours }: { totalHours: number }) {
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

// GitHub Stats Card Component (Pixel Art Style)
const GitHubStatsCard = () => {
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
        <img src={statsData?.url} alt="GitHub Stats" className="h-auto" width={320} height={140} />
      </div>
    </div>
  )
}

const CodingActivity: React.FC<CodingActivityProps> = ({
  activity,
  inView = false,
  variant = 'Front',
  style,
  isLoading = false,
  error,
}) => {
  // Calculate total hours with useMemo to avoid recalculation on each render
  const totalHours = useMemo(() => {
    if (!activity) return 0
    return Math.round(activity.days.reduce((total, day) => total + day.total, 0) / SECONDS_TO_HOURS)
  }, [activity])

  // Get unique years from activity data for calendar view (desktop)
  const years = useMemo(() => {
    if (!activity) return []
    return Array.from(new Set(activity.days.map((day) => new Date(day.date).getFullYear()))).sort(
      (a, b) => b - a,
    )
  }, [activity])

  // Prepare data for GitHub style graph (mobile)
  const chartData = useMemo(() => {
    if (!activity) return []

    // Group by date and convert to hours
    const dateMap = new Map<string, number>()

    activity.days.forEach((day) => {
      const hours = day.total / SECONDS_TO_HOURS
      dateMap.set(day.date, hours)
    })

    // Sort by date
    const sortedEntries = Array.from(dateMap.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
    )

    return sortedEntries.map(([date, hours]) => ({
      x: new Date(date).getTime(),
      y: parseFloat(hours.toFixed(1)),
    }))
  }, [activity])

  // Format tooltip content for calendar view
  const formatTooltip = (params: any) => {
    const hours = params.value[1]
    const date = new Date(params.value[0]).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return `
      <div style="
        padding: 1rem;
        background-color: #2c2c2c;
        border: 6px solid #4a4a4a;
      ">
        <div style="
          font-size: 1.2rem;
          font-family: monospace;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #fff3c4;
        ">${date}</div>
        <div style="
          font-size: 1rem;
          font-family: monospace;
          opacity: 0.8;
          color: #ffffff;
        ">${hours || 0} hours</div>
      </div>
    `
  }

  // Memoize calendar chart options to prevent unnecessary recalculations (desktop)
  const getCalendarOptions = useMemo(() => {
    return (year: number, data: Day[]) => {
      // Transform data for the chart
      const yearData = data.map((day) => [
        day.date,
        Math.round(day.total / SECONDS_TO_HOURS), // Convert seconds to hours
      ])

      return {
        backgroundColor: COLORS.background,
        tooltip: {
          position: 'top',
          formatter: formatTooltip,
          backgroundColor: 'transparent',
          borderWidth: 0,
          textStyle: {
            color: '#ffffff',
            fontFamily: 'monospace',
          },
          extraCssText: 'box-shadow: none;',
        },
        grid: {
          top: 30,
          bottom: 20,
          left: '15%',
          right: '5%',
          containLabel: true,
        },
        visualMap: {
          min: 0,
          max: 10,
          calculable: true,
          orient: 'vertical',
          left: '3%',
          top: 'center',
          textStyle: {
            color: COLORS.text,
            fontFamily: 'monospace',
          },
          inRange: {
            color: ['#ffffff', COLORS.highlight],
          },
        },
        calendar: {
          top: 30,
          left: '15%',
          right: '5%',
          cellSize: ['auto', 20],
          range: year,
          itemStyle: {
            borderWidth: 1,
            borderColor: COLORS.cell.border,
            color: COLORS.cell.default, // Default color for cells with no data
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: COLORS.text,
              width: 2,
              type: 'solid',
            },
          },
          yearLabel: {
            color: COLORS.text,
            fontFamily: 'monospace',
          },
          dayLabel: {
            color: COLORS.text,
            fontFamily: 'monospace',
            firstDay: 1, // Start from Monday
          },
          monthLabel: {
            color: COLORS.text,
            fontFamily: 'monospace',
            align: 'center',
          },
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: yearData,
          emphasis: {
            itemStyle: {
              borderColor: '#4a4a4a',
              borderWidth: 2,
            },
          },
          animation: inView,
          animationDuration: 1000,
          animationEasing: 'cubicOut',
        },
      }
    }
  }, [])

  // Memoize GitHub-style chart options (mobile)
  const getGithubStyleOptions = useMemo((): ApexOptions => {
    // Get dates for selection range (default to last 3 months)
    const dates = chartData.map((item) => item.x)
    const maxDate = dates.length ? Math.max(...dates) : new Date().getTime()
    const defaultStartDate = new Date(maxDate)
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3) // Last 3 months
    const minDate = defaultStartDate.getTime()

    return {
      chart: {
        id: 'coding-activity',
        type: 'area',
        height: 180,
        background: THEME.colors.background,
        toolbar: {
          show: false,
          autoSelected: 'pan',
        },
        animations: {
          enabled: inView,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      colors: [THEME.colors.primary],
      stroke: {
        width: 0,
        curve: 'monotoneCubic',
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 1,
        type: 'solid',
        colors: [THEME.colors.primary],
      },
      tooltip: {
        theme: 'dark',
        x: {
          format: 'dd MMM yyyy',
        },
        y: {
          formatter: function (val) {
            return val.toFixed(1) + ' hours'
          },
        },
      },
      yaxis: {
        show: true,
        forceNiceScale: true,
        labels: {
          style: {
            colors: THEME.colors.text,
            fontFamily: THEME.fonts.family,
          },
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: THEME.colors.text,
            fontFamily: THEME.fonts.family,
          },
        },
      },
      grid: {
        borderColor: THEME.colors.border + '20',
        strokeDashArray: 4,
      },
    }
  }, [chartData, inView])

  const getBrushChartOptions = useMemo((): ApexOptions => {
    // Get dates for selection range (default to last 3 months)
    const dates = chartData.map((item) => item.x)
    const maxDate = dates.length ? Math.max(...dates) : new Date().getTime()
    const defaultStartDate = new Date(maxDate)
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3) // Last 3 months
    const minDate = defaultStartDate.getTime()

    return {
      chart: {
        id: 'coding-activity-brush',
        height: 100,
        type: 'area',
        background: THEME.colors.background,
        toolbar: {
          autoSelected: 'selection',
          show: false,
        },
        brush: {
          enabled: true,
          target: 'coding-activity',
        },
        selection: {
          enabled: true,
          xaxis: {
            min: minDate,
            max: maxDate,
          },
        },
        animations: {
          enabled: inView,
        },
      },
      colors: ['#4a4a4a'], // Dark grey color instead of yellow
      fill: {
        opacity: 0.7,
        type: 'solid',
        colors: ['#4a4a4a'], // Dark grey color
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 0,
        curve: 'monotoneCubic',
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: THEME.colors.text,
            fontFamily: THEME.fonts.family,
          },
        },
      },
      yaxis: {
        show: false,
      },
    }
  }, [chartData, inView])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  // Common container class to reduce duplication
  const containerClass =
    "relative bg-[#fff7e0] border-4 border-[#2c2c2c] p-8 my-4 [image-rendering:pixelated] shadow-[8px_8px_0_rgba(44,44,44,0.46)] w-full rounded-2xl overflow-hidden before:content-[''] before:absolute before:-top-1 before:-left-1 before:-right-1 before:-bottom-1 before:bg-transparent before:border-2 before:border-[#2c2c2c] before:pointer-events-none after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-[linear-gradient(45deg,transparent_45%,#2c2c2c_45%,#2c2c2c_55%,transparent_55%),linear-gradient(-45deg,transparent_45%,#2c2c2c_45%,#2c2c2c_55%,transparent_55%)] after:bg-[length:8px_8px] after:bg-[0_0,4px_0] after:opacity-5 after:pointer-events-none"

  // Render loading state
  if (isLoading) {
    return (
      <motion.div className={containerClass} style={style}>
        <div className="flex justify-center items-center h-full py-20">
          <div
            className="animate-pulse flex flex-col items-center"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="w-20 h-20 bg-[rgba(44,44,44,0.2)] rounded mb-4"></div>
            <div className="h-6 w-40 bg-[rgba(44,44,44,0.2)] rounded"></div>
            <p className="sr-only">Loading coding activity data...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Render error state
  if (error) {
    return (
      <motion.div className={containerClass} style={style}>
        <div
          className="flex flex-col justify-center items-center h-full py-20"
          aria-live="assertive"
        >
          <div className="text-red-500 font-['Press_Start_2P'] text-lg mb-4">
            ⚠️ Error loading data
          </div>
          <p className="text-[#2c2c2c] font-['Press_Start_2P'] text-center max-w-md">{error}</p>
        </div>
      </motion.div>
    )
  }

  // Render empty state
  if (!activity) {
    return (
      <motion.div className={containerClass} style={style}>
        <div className="flex flex-col justify-center items-center h-full py-20">
          <div className="font-['Press_Start_2P'] text-lg text-[#2c2c2c] text-center max-w-md">
            No coding activity data available
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'Back') {
    return (
      <motion.div
        className={containerClass}
        style={{
          ...style,
          color: '#fff7e0',
        }}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-[#2c2c2c]">
          <h3 className="text-xl font-bold uppercase font-['Press_Start_2P'] text-[#2c2c2c]">
            What does this mean?
          </h3>
        </div>
        <div className="w-full">
          <p className="font-['Press_Start_2P'] text-[#2c2c2c] leading-relaxed mb-8 p-4 sm:p-8 bg-[rgba(44,44,44,0.05)] border-2 border-[#2c2c2c] rounded shadow-[1px_1px_0px_rgba(255,255,255,0.5)] text-xs sm:text-sm md:text-lg">
            Nelson has moved beyond solo flights and is now confidently flying with passengers.
            He&apos;s not yet an airline captain, but he has solid skills and is{' '}
            <span className="pixel-underline">ready for more complex journeys</span>. Similarly, as
            a programmer, he transitioned from a novice to someone capable of building real
            applications and contributing meaningfully to software projects.
          </p>
          <ProgrammingPilotComparisonTable totalHours={totalHours} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={containerClass}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={style}
      role="region"
      aria-label="Coding activity calendar"
    >
      <motion.div
        className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-[#2c2c2c]"
        variants={itemVariants}
      >
        <h3 className="text-xl font-bold uppercase font-['Press_Start_2P'] text-[#2c2c2c]">
          Coding Activity
        </h3>
      </motion.div>
      <motion.div className="w-full" variants={itemVariants}>
        <div className="w-full">
          <motion.div
            className="font-['Press_Start_2P'] text-4xl font-bold text-[#2c2c2c] text-center mb-6 p-2"
            variants={itemVariants}
          >
            {totalHours} hours total
          </motion.div>

          {/* Mobile view - GitHub-style activity chart */}
          {inView && activity && chartData.length > 0 && (
            <motion.div
              className="w-full mb-4 bg-[rgba(44,44,44,0.05)] p-4 border-2 border-[#2c2c2c] block md:hidden"
              variants={itemVariants}
            >
              <div className="mb-6">
                <ReactApexChart
                  options={getGithubStyleOptions}
                  series={[{ name: 'Coding Hours', data: chartData }]}
                  type="area"
                  height={220}
                />
              </div>

              {/* GitHub Stats Card - Pixel Art Style */}
              <div className="mb-6">
                <GitHubStatsCard />
              </div>

              <div>
                <ReactApexChart
                  options={getBrushChartOptions}
                  series={[{ name: 'Coding Hours', data: chartData }]}
                  type="area"
                  height={100}
                />
              </div>
            </motion.div>
          )}

          {/* Desktop view - Calendar view */}
          <div className="hidden md:block">
            {years.map((year) => (
              <motion.div
                key={year}
                className="w-full mb-8 bg-[rgba(44,44,44,0.05)] p-4 border-2 border-[#2c2c2c]"
                variants={itemVariants}
              >
                {inView && activity && (
                  <ReactECharts
                    option={getCalendarOptions(
                      year,
                      activity.days.filter((day) => new Date(day.date).getFullYear() === year) ||
                        [],
                    )}
                    style={{ height: '220px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    aria-label={`Coding activity heatmap for ${year}`}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CodingActivity
