'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import { Day } from '@/frontend/models/Wakatime'
import { COLORS } from './constants'
import * as echarts from 'echarts/core'
import {
  CalendarComponent,
  CalendarComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  VisualMapComponent,
  VisualMapComponentOption,
  GridComponent,
  GridComponentOption,
} from 'echarts/components'
import { HeatmapChart, HeatmapSeriesOption } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// Register necessary ECharts components
echarts.use([
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  HeatmapChart,
  CanvasRenderer,
])

// Define the chart option types
type ECOption = echarts.ComposeOption<
  | CalendarComponentOption
  | TooltipComponentOption
  | VisualMapComponentOption
  | GridComponentOption
  | HeatmapSeriesOption
>

interface CalendarViewProps {
  year: number
  days: Day[]
  inView: boolean
}

const CalendarView: React.FC<CalendarViewProps> = ({ year, days, inView }) => {
  // Reference to the chart container element
  const chartRef = useRef<HTMLDivElement>(null)
  // Reference to the ECharts instance
  const chartInstance = useRef<echarts.ECharts | null>(null)

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

  // Memoize chart options to prevent unnecessary recalculations
  const chartOptions = useMemo((): ECOption => {
    // Transform data for the chart - convert seconds to hours
    const yearData = days
      .filter((day) => new Date(day.date).getFullYear() === year)
      .map((day) => [
        day.date,
        Math.round(day.total / 3600), // Convert seconds to hours
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
        cellSize: [15, 20],
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
  }, [year, days, inView])

  // Initialize and update the chart
  useEffect(() => {
    // Skip rendering if not in view or no container element
    if (!inView || !chartRef.current) return

    // Initialize chart if it doesn't exist
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    // Set options and render chart
    chartInstance.current.setOption(chartOptions, true)

    // Handle window resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
      // Only dispose when component unmounts, not on every render
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [chartOptions, inView])

  return (
    <div className="w-full mb-8 bg-[rgba(44,44,44,0.05)] p-4 border-2 border-[#2c2c2c]">
      <div
        ref={chartRef}
        style={{ height: '220px', width: '100%' }}
        aria-label={`Coding activity heatmap for ${year}`}
      />
    </div>
  )
}

export default CalendarView
