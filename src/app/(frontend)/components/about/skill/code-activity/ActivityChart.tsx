'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Day } from '@/frontend/models/Wakatime'
import { THEME, SECONDS_TO_HOURS } from './constants'
import type { ApexOptions } from 'apexcharts'

// Dynamically load ReactApexChart for GitHub style view (mobile)
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface ActivityChartProps {
  days: Day[]
  inView: boolean
}

const ActivityChart: React.FC<ActivityChartProps> = ({ days, inView }) => {
  // Prepare data for GitHub style graph (mobile)
  const chartData = useMemo(() => {
    // Group by date and convert to hours
    const dateMap = new Map<string, number>()

    days.forEach((day) => {
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
  }, [days])

  // Memoize GitHub-style chart options (mobile)
  const getGithubStyleOptions = useMemo((): ApexOptions => {
    // Get dates for selection range (default to last 3 months)
    const dates = chartData.map((item) => item.x)
    const maxDate = dates.length ? Math.max(...dates) : new Date().getTime()
    const defaultStartDate = new Date(maxDate)
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3) // Last 3 months

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

  return (
    <div className="w-full mb-4 bg-[rgba(44,44,44,0.05)] p-4 border-2 border-[#2c2c2c]">
      <div className="mb-6">
        <ReactApexChart
          options={getGithubStyleOptions}
          series={[{ name: 'Coding Hours', data: chartData }]}
          type="area"
          height={220}
        />
      </div>

      <div>
        <ReactApexChart
          options={getBrushChartOptions}
          series={[{ name: 'Coding Hours', data: chartData }]}
          type="area"
          height={100}
        />
      </div>
    </div>
  )
}

export default ActivityChart
